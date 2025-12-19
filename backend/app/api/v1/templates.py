from fastapi import APIRouter, HTTPException, Depends
from typing import Any

from app.schemas import TemplateCreate, TemplateUpdate, TemplateResponse
from app.db.supabase import get_supabase_client

router = APIRouter()


@router.get("/", response_model=list[TemplateResponse])
async def list_templates(
    user_id: str = "demo-user",  # TODO: Get from auth
):
    """List all templates for the current user."""
    client = get_supabase_client()
    response = client.table("templates").select("*").eq("user_id", user_id).execute()
    return response.data


@router.post("/", response_model=TemplateResponse)
async def create_template(
    template: TemplateCreate,
    user_id: str = "demo-user",  # TODO: Get from auth
):
    """Create a new template."""
    client = get_supabase_client()
    response = (
        client.table("templates")
        .insert(
            {
                "name": template.name,
                "description": template.description,
                "template_json": template.template_json,
                "user_id": user_id,
            }
        )
        .execute()
    )
    return response.data[0]


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(
    template_id: str,
    user_id: str = "demo-user",
):
    """Get a template by ID."""
    client = get_supabase_client()
    response = (
        client.table("templates")
        .select("*")
        .eq("id", template_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Template not found")
    return response.data


@router.put("/{template_id}", response_model=TemplateResponse)
async def update_template(
    template_id: str,
    template: TemplateUpdate,
    user_id: str = "demo-user",
):
    """Update a template."""
    client = get_supabase_client()
    update_data = template.model_dump(exclude_unset=True)
    response = (
        client.table("templates")
        .update(update_data)
        .eq("id", template_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Template not found")
    return response.data[0]


@router.delete("/{template_id}")
async def delete_template(
    template_id: str,
    user_id: str = "demo-user",
):
    """Delete a template."""
    client = get_supabase_client()
    response = (
        client.table("templates")
        .delete()
        .eq("id", template_id)
        .eq("user_id", user_id)
        .execute()
    )
    return {"deleted": True}
