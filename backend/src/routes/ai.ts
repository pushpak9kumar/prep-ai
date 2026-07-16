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

export default router;