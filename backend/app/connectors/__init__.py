from app.connectors.base import BaseConnector
from app.connectors.registry import ConnectorRegistry

# Import connectors to register them
from app.connectors.hubspot import connector as hubspot_connector
from app.connectors.rest_api import connector as rest_api_connector

__all__ = ["BaseConnector", "ConnectorRegistry"]
