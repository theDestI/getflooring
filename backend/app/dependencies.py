"""Shared dependencies for the application."""

from app.pdf.engine import PDFEngine

# Global PDF engine instance
_pdf_engine: PDFEngine | None = None


def set_pdf_engine(engine: PDFEngine) -> None:
    """Set the global PDF engine instance."""
    global _pdf_engine
    _pdf_engine = engine


def get_pdf_engine() -> PDFEngine:
    """Get the PDF engine instance."""
    if _pdf_engine is None:
        raise RuntimeError("PDF Engine not initialized")
    return _pdf_engine
