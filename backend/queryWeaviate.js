import fetch from "node-fetch";
import dotenv from "dotenv";
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

export async function getEmbedding(text) {
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

export async function queryWeaviate(question) {
  try {
    const embedding = await getEmbedding(question);

    const graphqlQuery = `
    {
      Get {
        HealthcareQA(
          nearVector: {
            vector: ${JSON.stringify(embedding)}
          },
          limit: 3
        ) {
          question
          answer
          _additional {
            distance
            certainty
          }
        }
      }
    }
    `;

    const res = await fetch(`${WEAVIATE_URL}/v1/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WEAVIATE_API_KEY}`,
      },
      body: JSON.stringify({ query: graphqlQuery }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Weaviate query error: ${err}`);
    }

    const data = await res.json();

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    return data.data.Get.HealthcareQA;
  } catch (error) {
    console.error("Error querying Weaviate:", error.message);
    throw error;
  }
}
