from pydantic import BaseModel
from datetime import datetime
from typing import Any


class TemplateBase(BaseModel):
    name: str
    description: str | None = None
    template_json: dict[str, Any]


class TemplateCreate(TemplateBase):
    pass


class TemplateUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    template_json: dict[str, Any] | None = None


class TemplateResponse(TemplateBase):
    id: str
    user_id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PDFOptions(BaseModel):
    page_size: str = "A4"
    orientation: str = "portrait"
    margin_top: str = "40px"
    margin_bottom: str = "40px"
    margin_left: str = "40px"
    margin_right: str = "40px"


class GenerateRequest(BaseModel):
    template_id: str
    data: dict[str, Any] | None = None
    datasource_id: str | None = None
    datasource_query: dict[str, Any] | None = None
    options: PDFOptions | None = None


class GenerateResponse(BaseModel):
    job_id: str
    status: str
    download_url: str | None = None


class DataSourceBase(BaseModel):
    name: str
    type: str  # 'hubspot', 'rest_api', 'ai_tool', 'manual'
    config: dict[str, Any]
    field_mappings: list[dict[str, Any]] = []


class DataSourceCreate(DataSourceBase):
    pass


class DataSourceResponse(DataSourceBase):
    id: str
    user_id: str
    is_active: bool
    last_synced_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True


class DataResult(BaseModel):
    success: bool
    data: dict[str, Any] | list[dict[str, Any]]
    source_type: str
    errors: list[str] = []
