from fastapi import APIRouter, HTTPException, Depends
from uuid import uuid4

from app.schemas import GenerateRequest, GenerateResponse, PDFOptions
from app.db.supabase import get_supabase_client
from app.dependencies import get_pdf_engine
from app.templates.compiler import TemplateCompiler
from app.connectors.registry import ConnectorRegistry

router = APIRouter()


@router.post("/", response_model=GenerateResponse)
async def generate_pdf(
    request: GenerateRequest,
):
    """Generate a PDF from a template with data."""
    client = get_supabase_client()
    pdf_engine = get_pdf_engine()
    compiler = TemplateCompiler()

    # 1. Get template
    template_response = (
        client.table("templates").select("*").eq("id", request.template_id).single().execute()
    )
    if not template_response.data:
        raise HTTPException(status_code=404, detail="Template not found")

    template = template_response.data

    # 2. Resolve data
    data = request.data or {}

    if request.datasource_id:
        # Fetch data from connector
        datasource_response = (
            client.table("data_sources")
            .select("*")
            .eq("id", request.datasource_id)
            .single()
            .execute()
        )
        if datasource_response.data:
            connector = ConnectorRegistry.create(datasource_response.data)
            result = await connector.fetch_data(request.datasource_query or {})
            if result.success:
                data = result.data if isinstance(result.data, dict) else {"items": result.data}

    # 3. Compile template to HTML
    html_content = compiler.compile(template["template_json"], data)

    # 4. Generate PDF
    options = request.options or PDFOptions()
    pdf_bytes = await pdf_engine.generate_pdf(html_content, options)

    # 5. Upload to Supabase Storage
    job_id = str(uuid4())
    file_path = f"pdfs/{job_id}.pdf"

    storage_response = client.storage.from_("generated-pdfs").upload(
        file_path, pdf_bytes, {"content-type": "application/pdf"}
    )

    # Get public URL
    download_url = client.storage.from_("generated-pdfs").get_public_url(file_path)

    # 6. Record in database
    client.table("generated_pdfs").insert(
        {
            "id": job_id,
            "user_id": "demo-user",  # TODO: Get from auth
            "template_id": request.template_id,
            "data_source_id": request.datasource_id,
            "storage_path": file_path,
            "status": "completed",
            "input_data": data,
            "pdf_options": options.model_dump(),
        }
    ).execute()

    return GenerateResponse(job_id=job_id, status="completed", download_url=download_url)


@router.post("/preview")
async def preview_template(
    request: GenerateRequest,
):
    """Generate HTML preview of a template."""
    client = get_supabase_client()
    compiler = TemplateCompiler()

    # Get template
    template_response = (
        client.table("templates").select("*").eq("id", request.template_id).single().execute()
    )
    if not template_response.data:
        raise HTTPException(status_code=404, detail="Template not found")

    template = template_response.data
    data = request.data or {}

    # Compile to HTML
    html_content = compiler.compile(template["template_json"], data)

    return {"html": html_content}
