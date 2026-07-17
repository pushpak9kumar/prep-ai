import dotenv from 'dotenv';
dotenv.config();

import { Router, Request, Response } from 'express';
import Groq from 'groq-sdk';
import { prisma } from '../prisma'; // Prisma import karna mat bhoolna!

const router = Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/generate-questions', async (req: Request, res: Response) => {
  try {
    const { jobDescription, userId } = req.body; // userId bhi lenge

    if (!jobDescription || !userId) {
      return res.status(400).json({ error: 'Job description and userId are required' });
    }

    // 1. AI se questions generate karna
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical interviewer. Generate exactly 5 interview questions based on the provided job description. Return the response ONLY as a JSON array of strings. Do not include any markdown formatting like ```json or extra text.'
        },
        {
          role: 'user',
          content: `Generate 5 interview questions for this Job Description:\n\n${jobDescription}`
        }
      ],
      model: 'llama-3.3-70b-versatile', 
      temperature: 0.7, 
      max_tokens: 1024,
    });

    const content = chatCompletion.choices[0]?.message?.content || '';
    const cleanedContent = content.replace(/```json|```/g, '').trim();
    const questions: string[] = JSON.parse(cleanedContent);

    // 2. Questions ko Database mein Save karna (Prisma Nested Write)
    const interview = await prisma.interview.create({
      data: {
        jobDescription,
        userId: userId,
        questions: {
          create: questions.map((q) => ({ questionText: q })) // Har question ko Question table mein daal raha hai
        }
      },
      include: { questions: true } // Save hone ke baad questions wapas fetch karo
    });

    // 3. Frontend ko data bhejna
    res.json({ 
      questions: interview.questions.map(q => q.questionText),
      interviewId: interview.id 
    });

  } catch (error) {
    console.error('Groq API Error:', error);
    res.status(500).json({ error: 'Failed to generate questions from AI' });
  }
});

// 1. AI ANSWER GRADING API
router.post('/grade-answer', async (req: Request, res: Response) => {
  try {
    const { question, answer, jobDescription } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          // Strict Prompt for JSON output
          content: 'You are a strict technical interviewer. Evaluate the candidate answer for the given question. Return the response ONLY as a valid JSON object with two keys: "score" (a number from 1 to 10) and "feedback" (a short string explaining why). Do not include markdown formatting.'
        },
        {
          role: 'user',
          content: `Job Description: ${jobDescription || 'General Tech Role'}\n\nQuestion: ${question}\n\nCandidate Answer: ${answer}`
        }
      ],
      model: 'llama-3.3-70b-versatile', 
      temperature: 0.3, // Low temperature for consistent grading
    });

    const content = chatCompletion.choices[0]?.message?.content || '';
    // Wahi Regex cleaning trick jo humne Day 3 mein sikhi thi!
    const cleanedContent = content.replace(/```json|```/g, '').trim();
    const gradingResult = JSON.parse(cleanedContent);

    res.json(gradingResult);

  } catch (error) {
    console.error('Grading API Error:', error);
    res.status(500).json({ error: 'Failed to grade answer' });
  }
});

// 2. FETCH PAST INTERVIEWS API
router.get('/history/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Database se user ke saare interviews nikalo (newest first)
    const interviews = await prisma.interview.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { questions: true } // Saath mein questions bhi fetch karo
    });

    res.json(interviews);
  } catch (error) {
    console.error('History API Error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;