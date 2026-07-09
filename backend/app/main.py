from fastapi import FastAPI

app = FastAPI(
    title="AI-First CRM Backend",
    description="Backend Starter Template for AI-First CRM (Healthcare Professional Module)",
    version="0.1.0"
)

@app.get("/")
def read_root():
    """
    Root endpoint to verify backend status.
    """
    return {"message": "AI First CRM Backend Running"}
