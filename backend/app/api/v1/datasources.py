from fastapi import APIRouter, HTTPException

from app.schemas import DataSourceCreate, DataSourceResponse, DataResult
from app.db.supabase import get_supabase_client
from app.connectors.registry import ConnectorRegistry

router = APIRouter()


@router.get("/", response_model=list[DataSourceResponse])
async def list_datasources(
    user_id: str = "demo-user",
):
    """List all data sources for the current user."""
    client = get_supabase_client()
    response = client.table("data_sources").select("*").eq("user_id", user_id).execute()
    return response.data


@router.post("/", response_model=DataSourceResponse)
async def create_datasource(
    datasource: DataSourceCreate,
    user_id: str = "demo-user",
):
    """Create a new data source."""
    client = get_supabase_client()
    response = (
        client.table("data_sources")
        .insert(
            {
                "name": datasource.name,
                "type": datasource.type,
                "config": datasource.config,
                "field_mappings": datasource.field_mappings,
                "user_id": user_id,
            }
        )
        .execute()
    )
    return response.data[0]


@router.get("/{datasource_id}", response_model=DataSourceResponse)
async def get_datasource(
    datasource_id: str,
    user_id: str = "demo-user",
):
    """Get a data source by ID."""
    client = get_supabase_client()
    response = (
        client.table("data_sources")
        .select("*")
        .eq("id", datasource_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Data source not found")
    return response.data


@router.post("/{datasource_id}/test", response_model=DataResult)
async def test_datasource(
    datasource_id: str,
    user_id: str = "demo-user",
):
    """Test a data source connection."""
    client = get_supabase_client()
    response = (
        client.table("data_sources")
        .select("*")
        .eq("id", datasource_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Data source not found")

    connector = ConnectorRegistry.create(response.data)
    is_valid = await connector.validate_credentials()

    return DataResult(
        success=is_valid,
        data={"connected": is_valid},
        source_type=response.data["type"],
        errors=[] if is_valid else ["Failed to connect"],
    )


@router.post("/{datasource_id}/fetch", response_model=DataResult)
async def fetch_from_datasource(
    datasource_id: str,
    query: dict = {},
    user_id: str = "demo-user",
):
    """Fetch data from a data source."""
    client = get_supabase_client()
    response = (
        client.table("data_sources")
        .select("*")
        .eq("id", datasource_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Data source not found")

    connector = ConnectorRegistry.create(response.data)
    result = await connector.fetch_data(query)

    return result


@router.delete("/{datasource_id}")
async def delete_datasource(
    datasource_id: str,
    user_id: str = "demo-user",
):
    """Delete a data source."""
    client = get_supabase_client()
    client.table("data_sources").delete().eq("id", datasource_id).eq(
        "user_id", user_id
    ).execute()
    return {"deleted": True}
