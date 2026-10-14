from fastapi import FastAPI
import os

app = FastAPI(
    title="Platform Lab API",
    description="A containerised API deployed using Terraform and GitHub Actions.",
    version="1.0.0",
)

@app.get("/")
def root():
    return {
        "service": "Platform Lab API",
        "status": "running",
        "message": "Hello from the Azure Platform Engineering Lab!",
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/version")
def version():
    return {
        "version": os.getenv("APP_VERSION", "1.0.0"),
        "environment": os.getenv("APP_ENV", "development"),
    }
