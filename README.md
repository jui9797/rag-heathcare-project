# 🏥 RAG Healthcare Q&A System

A complete Retrieval-Augmented Generation (RAG) system for healthcare question-answering using Node.js, Weaviate vector database, and Next.js frontend.

## 🚀 Features

- **50 Healthcare Q&A Items**: Pre-loaded with comprehensive healthcare questions and answers
- **Vector Embeddings**: Uses HuggingFace sentence transformers for semantic search
- **Weaviate Integration**: REST API-based vector database for similarity search
- **Modern UI**: Beautiful Next.js frontend with loading, error, and success states
- **Cosine Similarity**: Returns top 3 most relevant results ranked by similarity
- **Real-time Search**: Live query interface with instant results

## 📁 Project Structure

```
rag-healthcare/
├── backend/
│   ├── createSchema.js      # Creates Weaviate schema
│   ├── embedAndUpsert.js    # Embeds and stores 50 healthcare Q&A items
│   ├── queryWeaviate.js     # Query functions for similarity search
│   ├── test-system.js       # System testing script
│   ├── data/
│   │   └── healthcare.json  # 50 healthcare Q&A pairs
│   └── .env                 # Environment variables
├── frontend/
│   ├── src/app/
│   │   ├── components/
│   │   │   └── SearchBox.tsx    # Main search interface
│   │   ├── pages/api/
│   │   │   └── query.ts         # Next.js API endpoint
│   │   └── page.tsx             # Main page
│   └── .env.local              # Frontend environment variables
└── README.md
```

## 🛠️ Setup Instructions

### 1. Environment Variables

Create `.env` files in both `backend/` and `frontend/` directories:



### 2. Backend Setup

```bash
cd backend
npm install
node createSchema.js      # Create Weaviate schema
node embedAndUpsert.js    # Load 50 healthcare Q&A items
node test-system.js       # Test the system
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to use the application.

## 🔧 How It Works

### 1. Schema Creation
- Creates a `HealthcareQA` class in Weaviate with `question` and `answer` properties
- Uses `vectorizer: "none"` to allow custom embeddings

### 2. Data Ingestion
- Loads 50 healthcare Q&A pairs from `healthcare.json`
- Generates embeddings using HuggingFace sentence transformers
- Stores vectors and metadata in Weaviate

### 3. Query Processing
- User enters a healthcare question
- Question is embedded using the same model
- Cosine similarity search finds top 3 most relevant answers
- Results are ranked and displayed with similarity scores

### 4. UI States
- **Loading**: Spinner animation during search
- **Error**: Red error message with details
- **Success**: Green success indicator with ranked results
- **No Results**: Helpful message to rephrase query

## 🧪 Testing

Run the test script to verify the system:

```bash
cd backend
node test-system.js
```

This will test 5 different healthcare questions and show the results with similarity scores.

## 📊 Sample Questions

The system includes 50 healthcare Q&A pairs covering:

- **Diseases**: Diabetes, hypertension, heart attacks, COVID-19
- **Symptoms**: Fever, fatigue, pain, breathing issues
- **Treatments**: Vaccines, medications, lifestyle changes
- **Anatomy**: Heart, liver, kidneys, blood cells
- **Mental Health**: Depression, anxiety, stress management
- **Prevention**: Exercise, diet, hygiene, vaccinations

## 🔍 API Endpoints

### POST /api/query
Query the healthcare knowledge base.

**Request:**
```json
{
  "question": "What are the symptoms of diabetes?"
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "question": "What are the symptoms of diabetes?",
      "answer": "Common symptoms include increased thirst, frequent urination, extreme fatigue, and blurred vision.",
      "similarity": 1.0,
      "distance": 0.0
    }
  ]
}
```

## 🎨 UI Features

- **Modern Design**: Clean, professional healthcare-themed interface
- **Responsive**: Works on desktop and mobile devices
- **Real-time Feedback**: Immediate loading states and error handling
- **Similarity Scores**: Visual indicators of result relevance
- **Accessibility**: Proper contrast and keyboard navigation

## 🔧 Technical Details

- **Vector Dimension**: 384 (all-MiniLM-L6-v2 model)
- **Similarity Metric**: Cosine similarity
- **Results Limit**: Top 3 most relevant answers
- **Embedding Model**: sentence-transformers/all-MiniLM-L6-v2
- **Database**: Weaviate Cloud (GCP)

## 🚨 Troubleshooting

### HuggingFace API Issues
If you encounter permission errors with HuggingFace API, the system automatically falls back to mock embeddings for testing.

### Weaviate Connection Issues
- Verify your Weaviate URL and API key
- Check network connectivity
- Ensure the schema exists before running queries

### Frontend Issues
- Make sure all environment variables are set in `.env.local`
- Check that the backend API is accessible
- Verify Next.js is running on the correct port

## 📈 Future Enhancements

- [ ] Add more healthcare Q&A pairs
- [ ] Implement user authentication
- [ ] Add conversation history
- [ ] Support for multiple languages
- [ ] Integration with medical databases
- [ ] Advanced filtering and categorization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Note**: This system is for educational and demonstration purposes. For medical advice, always consult with healthcare professionals. 