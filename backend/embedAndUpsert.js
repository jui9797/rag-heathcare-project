import fetch from "node-fetch";
import dotenv from "dotenv";
import fs from "fs/promises";
dotenv.config();

const WEAVIATE_URL = process.env.WEAVIATE_URL;
const HUGGINGFACE_API = process.env.HUGGINGFACE_API;
const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN;
const WEAVIATE_API_KEY = process.env.WEAVIATE_API_KEY;

// Mock embedding function for testing (384-dimensional vector)
function createMockEmbedding(text) {
  const vector = [];
  for (let i = 0; i < 384; i++) {
    // Create a deterministic but varied vector based on text
    const hash = text.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    vector.push(Math.sin(hash + i) * 0.1);
  }
  return vector;
}

async function getEmbedding(text) {
  try {
    // Try HuggingFace API first
    const res = await fetch(HUGGINGFACE_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log(
        "✅ HuggingFace API response received------ line no 39 embedAndUpsert file",
        data
      );
      return data[0]; // HuggingFace returns array of embeddings
    } else {
      console.log(
        "⚠️ HuggingFace API failed, using mock embeddings for testing"
      );
      return createMockEmbedding(text);
    }
  } catch (error) {
    console.log("⚠️ HuggingFace API error, using mock embeddings for testing");
    return createMockEmbedding(text);
  }
}

async function upsertItem(item, vector) {
  try {
    const res = await fetch(`${WEAVIATE_URL}/v1/objects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WEAVIATE_API_KEY}`,
      },
      body: JSON.stringify({
        class: "HealthcareQA",
        properties: {
          question: item.question,
          answer: item.answer,
        },
        vector,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Upsert error: ${err}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error upserting item:", error.message);
    throw error;
  }
}

async function main() {
  try {
    const dataRaw = await fs.readFile("./data/healthcare.json", "utf-8");
    const data = JSON.parse(dataRaw);

    console.log(`📊 Loaded ${data.length} healthcare Q&A items.`);
    console.log("🚀 Starting embedding and upsert process...\n");

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      try {
        console.log(
          `📝 Processing item ${i + 1}/${
            data.length
          }: "${item.question.substring(0, 50)}..."`
        );

        const vector = await getEmbedding(item.question);
        await upsertItem(item, vector);

        successCount++;
        console.log(
          `✅ Successfully upserted: ${item.question.substring(0, 50)}...`
        );

        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (err) {
        errorCount++;
        console.error(`❌ Error processing item ${i + 1}:`, err.message);
      }
    }

    console.log(`\n🎉 Process completed!`);
    console.log(`✅ Successfully processed: ${successCount} items`);
    console.log(`❌ Errors: ${errorCount} items`);
  } catch (error) {
    console.error("❌ Fatal error:", error.message);
  }
}

main();
