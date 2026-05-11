import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// In Node ES modules, __dirname is not defined, so we create it manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the VITE_GEMINI_API_KEY from the .env file
const envPath = path.resolve(__dirname, '../.env');
let GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;

try {
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    const match = envFile.match(/VITE_GEMINI_API_KEY=(.*)/);
    if (match) GEMINI_API_KEY = match[1].trim();
  }
} catch (e) {
  console.log('No .env file found or unable to read it.');
}

if (!GEMINI_API_KEY) {
  console.error("❌ ERROR: VITE_GEMINI_API_KEY not found in .env file.");
  process.exit(1);
}

// 1. The Knowledge Base (The pieces of information the AI should know)
// By putting these in chunks, we'll later fetch ONLY the relevant ones, which saves costs
// and helps the LLM focus on the exact answers instead of the entire CV.
const chunks = [
  "Role & Education: Akarsh is a Machine Learning Researcher and Data Scientist. Pursuing M.Sc. in Water Science at INRS, Québec. He holds a B.Tech in Computer Science from SRMIST.",
  "Core Expertise: Akarsh's core expertise includes Deep learning, time-series analysis, and numerical modeling. Applying advanced AI techniques (LSTMs, CNNs) for environmental forecasting.",
  "Experience & Research at INRS: M.Sc. Researcher & Intern at INRS, Canada (2023-NOW). Leading thesis on Bias Correction of Ensemble Environmental Forecasts using Deep Learning (LSTM). Managed large environmental datasets for 'Non-stationary Modelling of Wind Speed'.",
  "Leadership Experience: CodeChef Club Leader at SRMIST, India (2019-23). Managed 50 core members and mentored over 1000 students in Competitive Programming and Software Engineering.",
  "Web Dev Experience: WordPress Developer at Inspired by Dream Foundation (2020-21). Enhanced websites and maintained client pages for the NGO.",
  "AI & Data Science Skills: Python, TensorFlow, Pandas, NumPy, LLMs, Time-Series analysis, AWS SageMaker, Jupyter, Numerical Modeling.",
  "Software Development Skills: C, C++, JavaScript, TypeScript, HTML, CSS, React, NodeJS, PostgreSQL, MongoDB, Snowflake, Git, Docker, Linux."
];

async function generateEmbeddings() {
  console.log('🧠 Generating embeddings for your CV and skills...');
  const vectorStore = [];

  for (const chunk of chunks) {
    try {
      // 2. We use 'text-embedding-004', Google's latest embedding model
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: "models/text-embedding-004",
            content: { parts: [{ text: chunk }] }
          })
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Failed to embed");

      const embedding = data.embedding.values;

      vectorStore.push({
        text: chunk,
        embedding: embedding
      });
      console.log(`✅ Embedded: "${chunk.substring(0, 40)}..."`);
    } catch (error) {
      console.error("❌ Error embedding chunk:", chunk);
      console.error(error);
    }
  }

  // 3. Save the results to a JS file so the API route can statically import it
  const outputFilePath = path.resolve(__dirname, '../src/data/vectorStore.js');
  
  // Create data directory if it doesn't exist
  const dataDir = path.dirname(outputFilePath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const fileContent = `// SYSTEM GENERATED FILE. DO NOT EDIT DIRECTLY.
// Run: node scripts/generateEmbeddings.js to update.

export const vectorStore = ${JSON.stringify(vectorStore, null, 2)};
`;

  fs.writeFileSync(outputFilePath, fileContent);
  console.log(`\n🎉 Success! Vector store saved to ${outputFilePath}`);
  console.log('Your local vector database is ready.');
}

generateEmbeddings();
