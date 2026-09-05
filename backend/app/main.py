from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.collection import router as collection_router
from app.api.heatmap import router as heatmap_router
from app.api.index import router as index_router
from app.api.quotes import router as quotes_router
from app.api.routes import router as routes_router

app = FastAPI(title="AIR-FARE-INDEX API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(quotes_router, prefix="/api/v1")
app.include_router(routes_router, prefix="/api/v1")
app.include_router(index_router, prefix="/api/v1")
app.include_router(heatmap_router, prefix="/api/v1")
app.include_router(collection_router, prefix="/api/v1")
