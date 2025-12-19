from abc import ABC, abstractmethod
from typing import Any

from app.schemas import DataResult


class BaseConnector(ABC):
    """Abstract base class for all data source connectors."""

    def __init__(self, config: dict[str, Any]):
        """
        Initialize the connector with configuration.

        Args:
            config: The data source configuration from the database
        """
        self.config = config
        self.name = config.get("name", "Unknown")
        self.settings = config.get("config", {})
        self.field_mappings = config.get("field_mappings", [])

    @abstractmethod
    async def connect(self) -> None:
        """Initialize connection to the data source."""
        pass

    @abstractmethod
    async def disconnect(self) -> None:
        """Clean up connection resources."""
        pass

    @abstractmethod
    async def fetch_data(self, query: dict[str, Any]) -> DataResult:
        """
        Fetch data from the source based on the query.

        Args:
            query: Query parameters specific to this connector type

        Returns:
            DataResult with the fetched data or errors
        """
        pass

    @abstractmethod
    async def validate_credentials(self) -> bool:
        """
        Validate that the stored credentials are working.

        Returns:
            True if credentials are valid, False otherwise
        """
        pass

    def get_available_fields(self) -> list[str]:
        """
        Return list of fields this connector can provide.
        Override in subclasses for connector-specific fields.
        """
        return []

    def apply_field_mappings(self, data: dict[str, Any]) -> dict[str, Any]:
        """
        Apply field mappings to transform source data to template fields.

        Args:
            data: Raw data from the source

        Returns:
            Transformed data with mapped field names
        """
        if not self.field_mappings:
            return data

        mapped = {}
        for mapping in self.field_mappings:
            source_field = mapping.get("sourceField")
            template_field = mapping.get("templateField")
            if source_field and template_field:
                value = self._get_nested_value(data, source_field)
                self._set_nested_value(mapped, template_field, value)

        return mapped

    @staticmethod
    def _get_nested_value(data: dict, path: str) -> Any:
        """Get a value from nested dict using dot notation."""
        parts = path.split(".")
        value = data
        for part in parts:
            if isinstance(value, dict):
                value = value.get(part)
            elif isinstance(value, list) and part.isdigit():
                value = value[int(part)] if int(part) < len(value) else None
            else:
                return None
        return value

    @staticmethod
    def _set_nested_value(data: dict, path: str, value: Any) -> None:
        """Set a value in nested dict using dot notation."""
        parts = path.split(".")
        current = data
        for part in parts[:-1]:
            if part not in current:
                current[part] = {}
            current = current[part]
        current[parts[-1]] = value
