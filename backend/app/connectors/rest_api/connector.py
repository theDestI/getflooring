from typing import Any
import httpx

from app.connectors.base import BaseConnector
from app.connectors.registry import ConnectorRegistry
from app.schemas import DataResult


@ConnectorRegistry.register("rest_api")
class RESTAPIConnector(BaseConnector):
    """Generic REST API connector for custom data sources."""

    def __init__(self, config: dict[str, Any]):
        super().__init__(config)
        self._client: httpx.AsyncClient | None = None
        self.base_url = self.settings.get("base_url", "")
        self.auth_type = self.settings.get("auth_type", "none")  # none, bearer, api_key
        self.auth_value = self.settings.get("auth_value", "")
        self.headers = self.settings.get("headers", {})
        self.timeout = self.settings.get("timeout", 30)

    async def connect(self) -> None:
        """Initialize HTTP client."""
        headers = dict(self.headers)

        # Add authentication
        if self.auth_type == "bearer":
            headers["Authorization"] = f"Bearer {self.auth_value}"
        elif self.auth_type == "api_key":
            api_key_header = self.settings.get("api_key_header", "X-API-Key")
            headers[api_key_header] = self.auth_value

        self._client = httpx.AsyncClient(
            base_url=self.base_url,
            headers=headers,
            timeout=self.timeout,
        )

    async def disconnect(self) -> None:
        """Close HTTP client."""
        if self._client:
            await self._client.aclose()
            self._client = None

    async def validate_credentials(self) -> bool:
        """Test the API connection."""
        try:
            await self.connect()
            if self._client:
                # Try a simple GET request to the base URL
                response = await self._client.get("/")
                return response.status_code < 500
        except Exception:
            pass
        finally:
            await self.disconnect()
        return False

    async def fetch_data(self, query: dict[str, Any]) -> DataResult:
        """
        Fetch data from the REST API.

        Query format:
        {
            "endpoint": "/api/v1/customers",
            "method": "GET",
            "params": {"status": "active"},
            "body": null,
            "response_path": "data.items"  # JSONPath to extract data
        }
        """
        try:
            await self.connect()
            if not self._client:
                return DataResult(
                    success=False,
                    data={},
                    source_type="rest_api",
                    errors=["Failed to initialize HTTP client"],
                )

            endpoint = query.get("endpoint", "/")
            method = query.get("method", "GET").upper()
            params = query.get("params")
            body = query.get("body")
            response_path = query.get("response_path")

            # Make the request
            response = await self._client.request(
                method=method,
                url=endpoint,
                params=params,
                json=body if body else None,
            )
            response.raise_for_status()

            data = response.json()

            # Extract data using response_path if provided
            if response_path:
                data = self._extract_path(data, response_path)

            # Apply field mappings
            if isinstance(data, dict):
                data = self.apply_field_mappings(data)
            elif isinstance(data, list):
                data = [self.apply_field_mappings(item) for item in data]

            return DataResult(success=True, data=data, source_type="rest_api")

        except httpx.HTTPStatusError as e:
            return DataResult(
                success=False,
                data={},
                source_type="rest_api",
                errors=[f"HTTP {e.response.status_code}: {e.response.text}"],
            )
        except httpx.RequestError as e:
            return DataResult(
                success=False,
                data={},
                source_type="rest_api",
                errors=[f"Request error: {str(e)}"],
            )
        except Exception as e:
            return DataResult(
                success=False,
                data={},
                source_type="rest_api",
                errors=[str(e)],
            )
        finally:
            await self.disconnect()

    def _extract_path(self, data: Any, path: str) -> Any:
        """Extract nested data using dot notation path."""
        parts = path.split(".")
        result = data
        for part in parts:
            if isinstance(result, dict):
                result = result.get(part)
            elif isinstance(result, list) and part.isdigit():
                idx = int(part)
                result = result[idx] if idx < len(result) else None
            else:
                return None
        return result


@ConnectorRegistry.register("manual")
class ManualDataConnector(BaseConnector):
    """Connector for manually entered/uploaded data."""

    async def connect(self) -> None:
        pass

    async def disconnect(self) -> None:
        pass

    async def validate_credentials(self) -> bool:
        return True

    async def fetch_data(self, query: dict[str, Any]) -> DataResult:
        """
        Return data from the connector's config.

        The 'sample_data' field in config contains the manual data.
        """
        data = self.settings.get("sample_data", {})

        if isinstance(data, dict):
            data = self.apply_field_mappings(data)
        elif isinstance(data, list):
            data = [self.apply_field_mappings(item) for item in data]

        return DataResult(success=True, data=data, source_type="manual")
