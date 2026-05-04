from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ✅ هنا كتضيف CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# routes ديالك
from app.routes import router
app.include_router(router)