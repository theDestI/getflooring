from typing import Any
from hubspot import HubSpot
from hubspot.crm.contacts import ApiException

from app.connectors.base import BaseConnector
from app.connectors.registry import ConnectorRegistry
from app.schemas import DataResult


@ConnectorRegistry.register("hubspot")
class HubSpotConnector(BaseConnector):
    """Connector for HubSpot CRM data."""

    def __init__(self, config: dict[str, Any]):
        super().__init__(config)
        self._client: HubSpot | None = None
        self.access_token = self.settings.get("access_token", "")

    async def connect(self) -> None:
        """Initialize HubSpot client."""
        self._client = HubSpot(access_token=self.access_token)

    async def disconnect(self) -> None:
        """Clean up - no persistent connection to close."""
        self._client = None

    async def validate_credentials(self) -> bool:
        """Test if the access token is valid."""
        try:
            await self.connect()
            if self._client:
                # Try to fetch a single contact to verify
                self._client.crm.contacts.basic_api.get_page(limit=1)
                return True
        except Exception:
            pass
        return False

    async def fetch_data(self, query: dict[str, Any]) -> DataResult:
        """
        Fetch data from HubSpot.

        Query format:
        {
            "object_type": "contacts" | "companies" | "deals",
            "properties": ["email", "firstname", "lastname"],
            "record_id": "optional-specific-id",
            "limit": 100
        }
        """
        try:
            await self.connect()
            if not self._client:
                return DataResult(
                    success=False,
                    data={},
                    source_type="hubspot",
                    errors=["Failed to initialize HubSpot client"],
                )

            object_type = query.get("object_type", "contacts")
            properties = query.get("properties", [])
            record_id = query.get("record_id")
            limit = query.get("limit", 100)

            if record_id:
                # Fetch single record
                data = await self._fetch_single(object_type, record_id, properties)
            else:
                # Fetch list of records
                data = await self._fetch_list(object_type, properties, limit)

            # Apply field mappings
            if isinstance(data, dict):
                data = self.apply_field_mappings(data)
            elif isinstance(data, list):
                data = [self.apply_field_mappings(item) for item in data]

            return DataResult(success=True, data=data, source_type="hubspot")

        except ApiException as e:
            return DataResult(
                success=False,
                data={},
                source_type="hubspot",
                errors=[f"HubSpot API error: {e.reason}"],
            )
        except Exception as e:
            return DataResult(
                success=False,
                data={},
                source_type="hubspot",
                errors=[str(e)],
            )

    async def _fetch_single(
        self, object_type: str, record_id: str, properties: list[str]
    ) -> dict[str, Any]:
        """Fetch a single record by ID."""
        api = self._get_api(object_type)
        result = api.basic_api.get_by_id(
            record_id, properties=properties if properties else None
        )
        return result.properties

    async def _fetch_list(
        self, object_type: str, properties: list[str], limit: int
    ) -> list[dict[str, Any]]:
        """Fetch a list of records."""
        api = self._get_api(object_type)
        result = api.basic_api.get_page(
            limit=limit, properties=properties if properties else None
        )
        return [r.properties for r in result.results]

    def _get_api(self, object_type: str):
        """Get the appropriate HubSpot API for the object type."""
        if not self._client:
            raise RuntimeError("Client not initialized")

        api_map = {
            "contacts": self._client.crm.contacts,
            "companies": self._client.crm.companies,
            "deals": self._client.crm.deals,
            "tickets": self._client.crm.tickets,
        }

        if object_type not in api_map:
            raise ValueError(f"Unknown HubSpot object type: {object_type}")

        return api_map[object_type]

    def get_available_fields(self) -> list[str]:
        """Return common HubSpot fields."""
        return [
            "contacts.email",
            "contacts.firstname",
            "contacts.lastname",
            "contacts.phone",
            "contacts.company",
            "companies.name",
            "companies.domain",
            "companies.industry",
            "deals.dealname",
            "deals.amount",
            "deals.closedate",
            "deals.dealstage",
        ]
