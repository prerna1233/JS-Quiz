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
  // origin: "http://127.0.0.1:550",
   origin: "*",
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/generate", async (req, res) => {
  const { topic, count } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "API key not set" });
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
              text: `Generate ${count} multiple-choice quiz questions on the topic in detail "${topic}". Format each like this:

Q1. What is ...?
A. Option 1
B. Option 2
C. Option 3
D. Option 4
Answer: B`
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
    console.log("🧪 Google API Response:", data);

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
