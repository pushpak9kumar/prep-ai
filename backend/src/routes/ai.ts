import dotenv from 'dotenv';
dotenv.config(); 

import { Router, Request, Response } from 'express';
import Groq from 'groq-sdk';

const router = Router();

// Groq client initialize karna (API key .env se le raha hai)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST API: Job Description se Questions Generate karna
router.post('/generate-questions', async (req: Request, res: Response) => {
  try {
    const { jobDescription } = req.body;

    // Validation: Agar JD nahi aayi toh error bhejo
    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    // Groq API ko call karna
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          // System Prompt: AI ko batana ki usko kaise behave karna hai
          content: 'You are an expert technical interviewer. Generate exactly 5 interview questions based on the provided job description. Return the response ONLY as a JSON array of strings. Do not include any markdown formatting like ```json or extra text.'
        },
        {
          role: 'user',
          // User Prompt: Asli JD yahan pass ho rahi hai
          content: `Generate 5 interview questions for this Job Description:\n\n${jobDescription}`
        }
      ],
      // Model selection (Llama 3.3 70B fast aur free hai Groq par)
      model: 'llama-3.3-70b-versatile', 
      temperature: 0.7, // Creativity level (0.7 balanced hai)
      max_tokens: 1024,
    });

    // AI ka response nikalna
    const content = chatCompletion.choices[0]?.message?.content || '';
    
    // AI kabhi-kabhi JSON ke aage-piche "```json" laga deta hai, usko clean karna
    const cleanedContent = content.replace(/```json|```/g, '').trim();
    
    // String ko actual JavaScript Array mein convert karna
    const questions = JSON.parse(cleanedContent);

    // Frontend ko final JSON bhejna
    res.json({ questions });

  } catch (error) {
    console.error('Groq API Error:', error);
    res.status(500).json({ error: 'Failed to generate questions from AI' });
  }
});

export default router;