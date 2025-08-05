import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const WEAVIATE_URL = process.env.WEAVIATE_URL;
const HUGGINGFACE_API = process.env.HUGGINGFACE_API;
const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN;
const WEAVIATE_API_KEY = process.env.WEAVIATE_API_KEY;

// Mock embedding function for testing (384-dimensional vector)
function createMockEmbedding(text) {
  const vector = [];
  for (let i = 0; i < 384; i++) {
    const hash = text.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    vector.push(Math.sin(hash + i) * 0.1);
  }
  return vector;
}

async function getEmbedding(text) {
  try {
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
      return data[0];
    } else {
      console.log("⚠️ Using mock embeddings for testing");
      return createMockEmbedding(text);
    }
  } catch (error) {
    console.log("⚠️ Using mock embeddings for testing");
    return createMockEmbedding(text);
  }
}

async function queryWeaviate(question) {
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
        "Authorization": `Bearer ${WEAVIATE_API_KEY}`,
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

async function testSystem() {
  console.log("🧪 Testing RAG Healthcare System...\n");

  const testQuestions = [
    "What are the symptoms of diabetes?",
    "How to manage high blood pressure?",
    "What causes heart attacks?",
    "How do vaccines work?",
    "What is the normal body temperature?"
  ];

  for (let i = 0; i < testQuestions.length; i++) {
    const question = testQuestions[i];
    console.log(`\n📝 Test ${i + 1}: "${question}"`);
    
    try {
      const results = await queryWeaviate(question);
      
      console.log(`✅ Found ${results.length} results:`);
      results.forEach((result, index) => {
        console.log(`   ${index + 1}. Q: ${result.question}`);
        console.log(`      A: ${result.answer}`);
        console.log(`      Similarity: ${(result._additional.certainty * 100).toFixed(1)}%`);
        console.log(`      Distance: ${result._additional.distance.toFixed(4)}`);
        console.log('');
      });
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }

  console.log("🎉 System test completed!");
}

testSystem(); 