import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS middleware: only once, allow frontend origin exactly
app.use(cors({
  origin: "*",
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/generate", async (req, res) => {
  const { topic, count, questionType } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "API key not set" });
  }

  let prompt = "";
  if (questionType === "coding") {
    prompt = `Generate ${count} coding MCQ questions on the topic "${topic}". For each question:
- Show a code snippet (in JavaScript) with a bug, missing line, or multiple code options.
- Ask the user to either debug the code, choose the correct line to fix it, or select which code option is correct.
- Provide 4 options (A, B, C, D) for each question, only one of which is correct.
- After the options, provide the correct answer (e.g., Answer: B) and a short explanation.

Format:
Q1. <code snippet>
Question: <debug/fix/choose correct code question>
A. Option 1
B. Option 2
C. Option 3
D. Option 4
Answer: <correct option letter>
Explanation: <short explanation>`;
  } else if (questionType === "theory") {
    prompt = `Generate ${count} theory-based (conceptual, descriptive) questions on the topic "${topic}". Do NOT include code. Format:
Q1. <theory question>
Answer: <short, clear explanation>`;
  } else {
    prompt = `Generate ${count} multiple-choice quiz questions on the topic in detail "${topic}". Format each like this:

Q1. What is ...?
A. Option 1
B. Option 2
C. Option 3
D. Option 4
Answer: B`;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7
          }
        })
      }
    );

    const data = await response.json();
    const quizText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No quiz generated.";
    res.json({ quiz: quizText });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Failed to generate quiz." });
  }
});



app.listen(PORT, () => {
console.log(`✅ Server running at http://localhost:${PORT}`);
});
