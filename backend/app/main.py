from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.pdf.engine import PDFEngine
from app.dependencies import set_pdf_engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan - initialize and cleanup resources."""
    # Startup: Initialize PDF engine with Playwright
    pdf_engine = PDFEngine()
    await pdf_engine.initialize()
    set_pdf_engine(pdf_engine)
    print("PDF Engine initialized")

    yield

    # Shutdown: Cleanup
    await pdf_engine.shutdown()
    print("PDF Engine shutdown complete")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="PDF Generator API",
        description="Generate professional PDFs with dynamic data from multiple sources",
        version="0.1.0",
        lifespan=lifespan,
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Import and include API routes here to avoid circular imports
    from app.api.v1.router import api_router
    app.include_router(api_router, prefix="/api/v1")

    @app.get("/health")
    async def health_check():
        from app.dependencies import get_pdf_engine
        try:
            get_pdf_engine()
            return {"status": "healthy", "pdf_engine": True}
        except RuntimeError:
            return {"status": "degraded", "pdf_engine": False}

    return app


app = create_app()
