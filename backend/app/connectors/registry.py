from typing import Type, Any

from app.connectors.base import BaseConnector


class ConnectorRegistry:
    """Registry for data source connectors using the plugin pattern."""

    _connectors: dict[str, Type[BaseConnector]] = {}

    @classmethod
    def register(cls, connector_type: str):
        """
        Decorator to register a connector class.

        Usage:
            @ConnectorRegistry.register("hubspot")
            class HubSpotConnector(BaseConnector):
                ...
        """

        def decorator(connector_class: Type[BaseConnector]):
            cls._connectors[connector_type] = connector_class
            return connector_class

        return decorator

    @classmethod
    def get(cls, connector_type: str) -> Type[BaseConnector]:
        """Get a connector class by type."""
        if connector_type not in cls._connectors:
            raise ValueError(f"Unknown connector type: {connector_type}")
        return cls._connectors[connector_type]

    @classmethod
    def create(cls, config: dict[str, Any]) -> BaseConnector:
        """
        Factory method to create a connector instance from config.

        Args:
            config: Data source configuration from database

        Returns:
            Instantiated connector
        """
        connector_type = config.get("type")
        if not connector_type:
            raise ValueError("Config must include 'type' field")

        connector_class = cls.get(connector_type)
        return connector_class(config)

    @classmethod
    def list_available(cls) -> list[str]:
        """List all registered connector types."""
        return list(cls._connectors.keys())
