# AI-First CRM (Healthcare Professional Module) - Backend Starter Template

## Project Overview
This project is a production-ready backend starter template for the **AI-First CRM (Healthcare Professional Module)**. It provides a clean, scalable enterprise FastAPI scaffold designed with modular architecture, strict boundary concerns, and modern Python best practices. This scaffold is structured to facilitate seamless integration of database persistence, business logic, and advanced AI agents.

---

## Technology Stack
- **Python 3.12+**: Modern features and performance optimizations.
- **FastAPI**: A modern, high-performance, asynchronous web framework for building APIs.
- **SQLAlchemy (ORM)**: Object-Relational Mapper for robust database interaction.
- **MySQL**: The target database engine (managed using MySQL Workbench).
- **PyMySQL**: A pure-Python MySQL client library.
- **Pydantic**: Data validation and settings management using Python type annotations.
- **Python-dotenv**: Read key-value pairs from `.env` files and set them as environment variables.

---

## Folder Structure
```
backend/
├── app/
│   ├── api/          # API endpoints, routers, and request/response handlers
│   ├── core/         # Core application configurations, environment settings, and security controls
│   ├── database/     # Database engine, connection session setups, and declarative base
│   ├── models/       # Database ORM models (SQLAlchemy)
│   ├── schemas/      # Data transfer objects and validation schemas (Pydantic)
│   ├── services/     # Core business logic and database CRUD helpers
│   ├── agent/        # AI Agent orchestration models (e.g., LangGraph workflow boundaries)
│   ├── tools/        # Custom tools accessible to AI Agents
│   ├── utils/        # Common utility helper functions
│   ├── __init__.py
│   └── main.py       # FastAPI application entrypoint
│
├── tests/            # Test suite containing unit, integration, and mock tests
│
├── .env.example      # Reference configuration containing environment variable placeholders
├── .gitignore        # Professional Python-specific version control exclusions
├── requirements.txt  # Explicit Python dependency checklist
├── README.md         # Developer guidance and project overview documentation
└── pyproject.toml    # Modern build configuration and project metadata
```

---

## Setup Overview
To configure the project environment:
1. Copy the `.env.example` file to a new file named `.env` in the `backend/` directory.
2. Update the environment variables in the newly created `.env` file, specifically inserting your MySQL database credentials under `DATABASE_URL` and configuring your `SECRET_KEY` and `GROQ_API_KEY`.
3. Install the packages listed in `requirements.txt` into your local Python virtual environment.
4. Run the FastAPI development server pointing to `app.main:app`.

*Note: For security reasons, never check your active `.env` file into version control.*

---

## Future Modules
The codebase is structured to scale cleanly. Upcoming modules to be integrated include:
- **CRUD APIs**: Resource-specific routers within `app/api/` and services within `app/services/` to manage user profiles, interactions, and logs.
- **LangGraph Agent**: Dynamic, stateful multi-agent workflows defined within `app/agent/` to automate complex healthcare workflows.
- **AI Tools**: Modular tools inside `app/tools/` allowing agents to fetch medical databases, retrieve context, or interact with external resources.
- **Groq Integration**: High-performance Inference API integration using Llama-based models to enable natural language communication.
