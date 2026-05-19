# 🤖 AI Sentiment Analysis Tool

## 📌 Project Overview

The **AI Sentiment Analysis Tool** is a modern full-stack web application built using **HTML, CSS, JavaScript** on the frontend and **Python** on the backend. The system analyzes user-provided text and classifies its emotional sentiment into:

- ✅ Positive
- ❌ Negative
- ⚪ Neutral

In addition to the sentiment label, the application generates:

- Confidence scores
- AI-style explanations
- Emotional tone insights
- Interactive charts and analytics

This project demonstrates practical implementation of:

- Artificial Intelligence concepts
- Natural Language Processing (NLP) with Python
- Text classification
- Data visualization
- Frontend web development
- Backend API design
- Dashboard design
- User interaction and analytics

---

## 🚀 Features

### ✅ Sentiment Classification
Analyze product reviews, tweets, customer feedback, YouTube comments, movie reviews, and general text. The system automatically determines whether the sentiment is Positive, Negative, or Neutral.

### ✅ Confidence Score
Each analysis includes a confidence percentage showing how certain the model is about the detected sentiment (e.g., Positive – 92%).

### ✅ AI-Generated Explanation
The application generates a short explanation describing the emotional tone, sentiment indicators, and overall interpretation of the text.

### ✅ Batch Analysis
Users can analyze multiple texts at once by separating entries with new lines — useful for large review datasets, social media monitoring, and customer feedback analysis.

### ✅ Sentiment History
All analyses from the current session are stored in Local Storage, including original text, sentiment result, confidence score, and timestamp.

### ✅ Dashboard Analytics
Pie chart visualization, bar chart analytics, statistics dashboard, total analysis tracking, sentiment count summaries, and average confidence score.

### ✅ Search and Filter
Search sentiment history and filter by Positive, Negative, or Neutral entries.

### ✅ Export Features
CSV export and PDF report export to save analysis results professionally.

### ✅ Dark Mode
Light and Dark themes for better accessibility.

---

## 🐍 Python Backend (New)

The Python backend powers the advanced NLP engine behind the application.

### Highlights
- **200+ curated keywords** per sentiment category
- **Intensifier detection** (e.g., "very", "extremely", "absolutely")
- **Negation handling** (e.g., "not good", "never happy")
- **Batch processing** for large datasets
- **Confidence scoring** based on weighted keyword matches
- **REST API endpoints** to serve the frontend

### Tech
- **Python 3.10+**
- **Flask / FastAPI** for the API layer
- **NLTK / custom tokenizer** for text preprocessing
- **JSON** as the request/response format

### Example Endpoint
```http
POST /api/analyze
Content-Type: application/json

{ "text": "I absolutely love this product!" }
```
Response:
```json
{
  "sentiment": "positive",
  "confidence": 0.94,
  "explanation": "Strong positive tone with intensifier 'absolutely'."
}
```

### Run the Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

---

## 🛠️ Technologies Used

| Layer    | Technology                | Purpose                       |
| -------- | ------------------------- | ----------------------------- |
| Frontend | HTML5                     | Structure                     |
| Frontend | CSS3                      | Styling & Responsive Design   |
| Frontend | JavaScript                | Application logic & UI        |
| Frontend | Chart.js                  | Data visualization            |
| Frontend | jsPDF                     | PDF export                    |
| Storage  | Local Storage             | Session persistence           |
| Backend  | Python 3.10+              | NLP & sentiment engine        |
| Backend  | Flask / FastAPI           | REST API                      |
| Backend  | NLTK / custom tokenizer   | Text preprocessing            |

---

## 📊 Charts & Visualization
- Doughnut chart
- Bar chart
- Sentiment distribution analytics
- Confidence tracking

---

## 🎯 Project Objectives
- Build a professional AI-inspired full-stack application
- Demonstrate sentiment analysis concepts with a real Python NLP engine
- Create interactive dashboards
- Practice frontend + backend integration
- Implement responsive design
- Visualize sentiment data effectively

---

## 💡 Real-World Use Cases
- Product review analysis
- Customer feedback processing
- Social media sentiment tracking
- Market research
- User experience evaluation
- Educational AI demonstrations

---

## 📱 Responsive Design
Fully responsive across desktop, tablet, and mobile.

---

## 🔒 Data Storage
Session history is stored client-side via Local Storage. The Python backend is stateless by default — no external database is required.

---

## 📂 Project Structure
```
project-folder/
│
├── index.html
├── style.css
├── script.js
├── backend/
│   ├── app.py
│   ├── sentiment_analyzer.py
│   └── requirements.txt
└── README.md
```

---

## ⚡ How to Run the Project

### 1. Clone the project
```bash
git clone <repository-link>
```

### 2. Start the Python backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 3. Open the frontend
Open `index.html` in your browser (or serve it with any static server).

---

## 🔮 Future Improvements
- Real AI API integration (OpenAI / Gemini)
- User authentication
- Cloud database storage
- Sentiment trend analysis over time
- Advanced NLP (transformers, BERT)
- Multi-language support
- Live social media integration

---

## 👨‍💻 Author
Developed by **Molebatso** as part of the **Week 3 Sentiment Analysis & Data Insight Assessment at Capaciti**.

---

## ✅ Conclusion
The AI Sentiment Analysis Tool demonstrates modern full-stack development by combining a polished JavaScript frontend with a Python-powered NLP backend — providing a strong foundation for future AI-powered web applications.
