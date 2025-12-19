from fastapi import APIRouter

from app.api.v1 import templates, generation, datasources

api_router = APIRouter()

api_router.include_router(templates.router, prefix="/templates", tags=["templates"])
api_router.include_router(generation.router, prefix="/generate", tags=["generation"])
api_router.include_router(datasources.router, prefix="/datasources", tags=["datasources"])
