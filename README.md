# AI-First CRM HCP Module

An AI-powered Customer Relationship Management (CRM) system designed for Pharmaceutical Sales Representatives to efficiently manage Healthcare Professional (HCP) interactions. The system combines structured CRM workflows with an AI assistant powered by **LangGraph** and **Groq LLM** to convert unstructured meeting notes into structured CRM records.

> **Assignment:** AI-First CRM HCP Module – Log Interaction Screen

---

# Features

## Authentication

- User Registration
- User Login
- JWT Authentication
- Protected Routes
- Secure Logout

---

## Dashboard

- Total HCPs
- Total Interactions
- Today's Visits
- AI Notes Processed
- Live CRM Statistics

---

## Healthcare Professionals (HCP)

- View Doctors
- Add Doctor
- Edit Doctor
- Delete Doctor
- Active / Pending / Inactive Status
- Search & Filter
- Dynamic City Input

---

## Log Interaction

Users can log interactions using:

### Structured Form

- Select Doctor
- Interaction Type
- Date & Time
- Attendees
- Topics Discussed
- Materials Shared
- Samples Distributed
- Discussion Outcome
- Follow-up Actions

### AI Copilot

Users simply paste meeting notes.

Example:

> Yesterday I met Dr. Sarah Johnson at Apollo Hospital. We discussed the new oncology drug, reviewed clinical trial results, shared product brochures, distributed 10 samples, and scheduled a follow-up meeting next week.

The AI automatically extracts:

- Doctor
- Hospital
- Interaction Type
- Date
- Sentiment
- Topics
- Materials Shared
- Samples Distributed
- Discussion Outcome
- Follow-up Actions

The extracted information automatically populates the CRM form before saving.

---

## Interaction History

- View all interactions
- View interaction details
- Edit interaction
- Delete interaction
- Latest interactions shown first

---

# AI Agent (LangGraph)

The AI Agent orchestrates multiple tools to process meeting notes.

Workflow:

```
Meeting Notes
      │
      ▼
Extract HCP
      │
      ▼
Identify Existing Doctor
      │
      ▼
Analyze Notes (Groq LLM)
      │
      ▼
Generate Structured Data
      │
      ▼
Populate CRM Form
      │
      ▼
Save Interaction
      │
      ▼
Refresh Dashboard & History
```

---

# LangGraph Tools

## 1. Extract HCP

Extracts the doctor's email and identifies the corresponding HCP from the CRM database.

Input:

- Meeting Notes

Output:

- Doctor Name
- Email
- Hospital

---

## 2. Analyze Meeting Notes

Uses Groq LLM to extract:

- Interaction Type
- Meeting Date
- Sentiment
- Topics
- Materials Shared
- Samples Distributed
- Discussion Outcome
- Follow-up Actions

---

## 3. Log Interaction

Stores the AI-generated interaction into the database.

---

## 4. Edit Interaction

Allows users to modify AI-generated information before or after saving.

---

## 5. Retrieve HCP

Validates whether the doctor exists in the CRM.

If found:

- Links interaction to doctor

If not found:

- Returns HCP Not Found message

---

# Tech Stack

## Frontend

- React
- Vite
- Redux Toolkit
- React Router
- Axios
- Tailwind CSS
- Google Inter Font

---

## Backend

- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication
- Python

---

## AI

- LangGraph
- Groq API
- Gemma2-9B-IT
- Llama-3.3-70B-Versatile (Supported)

---

## Database

- MySQL

---

# Project Structure

```
project
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── redux
│   │   ├── services
│   │   ├── hooks
│   │   └── utils
│   └── package.json
│
├── backend
│   ├── app
│   │   ├── api
│   │   ├── agents
│   │   ├── core
│   │   ├── database
│   │   ├── models
│   │   ├── schemas
│   │   ├── services
│   │   ├── tools
│   │   └── main.py
│   └── requirements.txt
│
└── README.md
```

---

# Installation

## Clone Repository

```bash
git clone <repository-url>
```

---

# Backend Setup

Navigate to backend:

```bash
cd backend
```

Create virtual environment:

```bash
python -m venv .venv
```

Activate virtual environment:

Windows

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create `.env`

```env
DATABASE_URL=mysql+pymysql://username:password@localhost/database_name

SECRET_KEY=your_secret_key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=60

GROQ_API_KEY=your_groq_api_key
```

Run backend:

```bash
uvicorn app.main:app --reload
```

Backend:

```
http://localhost:8000
```

---

# Frontend Setup

Navigate to frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create `.env`

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Run frontend:

```bash
npm run dev
```

Frontend:

```
http://localhost:5173
```

---

# API Endpoints

## Authentication

```
POST /api/v1/auth/register

POST /api/v1/auth/login

GET /api/v1/auth/me
```

---

## Healthcare Professionals

```
GET /api/v1/hcps

POST /api/v1/hcps

PUT /api/v1/hcps/{id}

DELETE /api/v1/hcps/{id}
```

---

## Interactions

```
GET /api/v1/interactions

POST /api/v1/interactions

GET /api/v1/interactions/{id}

PUT /api/v1/interactions/{id}

DELETE /api/v1/interactions/{id}
```

---

## AI Agent

```
POST /api/v1/agent
```

---

# Example AI Input

```
Yesterday I met Dr. Sarah Johnson (sarah.johnson@apollo.com) at Apollo Hospital.

We discussed the launch of our new oncology therapy, reviewed clinical trial outcomes, shared product brochures, distributed 10 sample packs, and scheduled a follow-up visit next month.
```

---

# Example AI Output

```
Doctor:
Dr. Sarah Johnson

Interaction Type:
Meeting

Sentiment:
Positive

Topics:
Clinical Trial Results

Materials:
Product Brochure

Samples:
10 Packs

Follow-up:
Schedule Next Visit
```

---

# Future Improvements

- Voice-to-Text Meeting Capture
- Calendar Integration
- AI Reminder System
- Email Integration
- Mobile Application
- Dashboard Analytics
- Offline Support
- OCR Support for Visiting Notes

---

# Assignment Requirements Covered

- React + Redux Frontend
- FastAPI Backend
- LangGraph Agent
- Groq LLM Integration
- MySQL Database
- Structured Form Logging
- Conversational AI Logging
- Five LangGraph Tools
- JWT Authentication
- HCP Management
- Interaction Management
- AI-Assisted CRM Workflow

---

# Author

**Rutvik Parit**

MCA Student | Full Stack Developer | AI Enthusiast

GitHub: git@github.com:Rutvikp-07/Rutvikp-07.git

LinkedIn:(https://www.linkedin.com/in/rutvik-parit-130b8132a?utm_source=share_via&utm_content=profile&utm_medium=member_ios)
