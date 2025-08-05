import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const WEAVIATE_URL = process.env.WEAVIATE_URL;
const WEAVIATE_API_KEY = process.env.WEAVIATE_API_KEY;

async function createSchema() {
  const schema = {
    class: "HealthcareQA",
    description: "Healthcare question and answer pairs",
    vectorizer: "none",
    properties: [
      { name: "question", dataType: ["text"] },
      { name: "answer", dataType: ["text"] },
    ],
  };

  try {
    const res = await fetch(`${WEAVIATE_URL}/v1/schema`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WEAVIATE_API_KEY}`,
      },
      body: JSON.stringify(schema),
    });

    if (res.ok) {
      console.log("✅ Schema created successfully");
    } else {
      const err = await res.text();
      console.error("❌ Failed to create schema:", err);
    }
  } catch (error) {
    console.error("❌ Error creating schema:", error.message);
  }
}

createSchema();
