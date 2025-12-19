import re
from typing import Any
from jinja2 import Environment, BaseLoader


class TemplateCompiler:
    """Compiles JSON templates to HTML with data binding."""

    def __init__(self):
        self.env = Environment(loader=BaseLoader(), autoescape=True)
        # Register custom filters
        self.env.filters["currency"] = self._format_currency
        self.env.filters["date"] = self._format_date
        self.env.filters["number"] = self._format_number

    def compile(self, template_json: dict[str, Any], data: dict[str, Any]) -> str:
        """Compile a JSON template to HTML with data."""
        # Extract Craft.js serialized state if present
        editor_state = template_json.get("editorState")
        if editor_state and isinstance(editor_state, str):
            # Parse Craft.js JSON and convert to HTML
            import json

            try:
                nodes = json.loads(editor_state)
                body_html = self._compile_craft_nodes(nodes, data)
            except json.JSONDecodeError:
                body_html = "<p>Invalid template data</p>"
        else:
            # Simple template format
            body_html = self._compile_simple_template(template_json, data)

        # Build complete HTML document
        return self._wrap_html(body_html, template_json.get("pageSettings", {}))

    def _compile_craft_nodes(self, nodes: dict, data: dict) -> str:
        """Compile Craft.js node tree to HTML."""
        if not nodes or "ROOT" not in nodes:
            return ""

        root = nodes["ROOT"]
        return self._render_node(root, nodes, data)

    def _render_node(self, node: dict, all_nodes: dict, data: dict) -> str:
        """Recursively render a Craft.js node to HTML."""
        node_type = node.get("type", {})
        if isinstance(node_type, dict):
            resolved_name = node_type.get("resolvedName", "")
        else:
            resolved_name = str(node_type)

        props = node.get("props", {})

        # Render children
        children_html = ""
        if "nodes" in node:
            for child_id in node["nodes"]:
                if child_id in all_nodes:
                    children_html += self._render_node(all_nodes[child_id], all_nodes, data)

        # Also check linkedNodes (for Craft.js canvas elements)
        if "linkedNodes" in node:
            for linked_id in node["linkedNodes"].values():
                if linked_id in all_nodes:
                    children_html += self._render_node(all_nodes[linked_id], all_nodes, data)

        # Render based on component type
        if resolved_name == "TextBlock":
            return self._render_text_block(props, data)
        elif resolved_name == "ImageBlock":
            return self._render_image_block(props)
        elif resolved_name == "TableBlock":
            return self._render_table_block(props, data)
        elif resolved_name == "RowBlock":
            return self._render_row_block(props, children_html)
        elif resolved_name == "ColumnBlock":
            return self._render_column_block(props, children_html)
        elif resolved_name == "SpacerBlock":
            return self._render_spacer_block(props)
        elif resolved_name == "DividerBlock":
            return self._render_divider_block(props)
        elif resolved_name == "Container":
            return f"<div>{children_html}</div>"
        else:
            return children_html

    def _render_text_block(self, props: dict, data: dict) -> str:
        """Render a text block with data binding."""
        text = props.get("text", "")
        # Replace data bindings
        text = self._replace_bindings(text, data)

        style = f"""
            font-size: {props.get('fontSize', 16)}px;
            font-family: {props.get('fontFamily', 'sans-serif')};
            text-align: {props.get('textAlign', 'left')};
            color: {props.get('color', '#000000')};
            line-height: {props.get('lineHeight', 1.5)};
        """
        return f'<div style="{style}">{text}</div>'

    def _render_image_block(self, props: dict) -> str:
        """Render an image block."""
        src = props.get("src", "")
        alt = props.get("alt", "Image")
        fit = props.get("fit", "contain")
        width = props.get("width", "100%")
        height = props.get("height", "200px")
        border_radius = props.get("borderRadius", 0)

        if not src:
            return f'<div style="width: {width}; height: {height}; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #999;">No image</div>'

        style = f"width: {width}; height: {height}; object-fit: {fit}; border-radius: {border_radius}px;"
        return f'<img src="{src}" alt="{alt}" style="{style}" />'

    def _render_table_block(self, props: dict, data: dict) -> str:
        """Render a table block with data binding."""
        columns = props.get("columns", [])
        data_path = props.get("dataPath", "")
        header_bg = props.get("headerBg", "#f5f5f5")
        header_color = props.get("headerColor", "#000000")
        border_color = props.get("borderColor", "#e0e0e0")

        # Get table data from bindings
        table_data = self._get_bound_value(data_path, data)
        if not isinstance(table_data, list):
            table_data = []

        # Build table HTML
        html = f'<table style="width: 100%; border-collapse: collapse; border: 1px solid {border_color};">'

        # Header
        html += "<thead><tr>"
        for col in columns:
            html += f'<th style="background: {header_bg}; color: {header_color}; padding: 8px 12px; border-bottom: 1px solid {border_color}; text-align: {col.get("align", "left")}; width: {col.get("width", "auto")};">{col.get("header", "")}</th>'
        html += "</tr></thead>"

        # Body
        html += "<tbody>"
        for row in table_data:
            html += "<tr>"
            for col in columns:
                value = row.get(col.get("key", ""), "")
                # Apply formatting
                fmt = col.get("format", {})
                if fmt.get("type") == "currency":
                    value = self._format_currency(value)
                elif fmt.get("type") == "number":
                    value = self._format_number(value, fmt.get("decimals", 2))
                html += f'<td style="padding: 8px 12px; border-bottom: 1px solid {border_color}; text-align: {col.get("align", "left")};">{value}</td>'
            html += "</tr>"
        html += "</tbody></table>"

        return html

    def _render_row_block(self, props: dict, children: str) -> str:
        """Render a row layout block."""
        gap = props.get("gap", 16)
        alignment = props.get("alignment", "stretch")
        justify = props.get("justify", "start")

        justify_map = {
            "start": "flex-start",
            "center": "center",
            "end": "flex-end",
            "between": "space-between",
            "around": "space-around",
        }

        style = f"display: flex; flex-direction: row; gap: {gap}px; align-items: {alignment}; justify-content: {justify_map.get(justify, 'flex-start')};"
        return f'<div style="{style}">{children}</div>'

    def _render_column_block(self, props: dict, children: str) -> str:
        """Render a column layout block."""
        width = props.get("width", "50%")
        padding = props.get("padding", 8)
        background = props.get("background", "transparent")

        style = f"width: {width}; padding: {padding}px; background: {background};"
        return f'<div style="{style}">{children}</div>'

    def _render_spacer_block(self, props: dict) -> str:
        """Render a spacer block."""
        height = props.get("height", 40)
        return f'<div style="height: {height}px;"></div>'

    def _render_divider_block(self, props: dict) -> str:
        """Render a divider block."""
        thickness = props.get("thickness", 1)
        color = props.get("color", "#e0e0e0")
        style = props.get("style", "solid")
        margin = props.get("margin", 16)

        return f'<hr style="border: none; border-top: {thickness}px {style} {color}; margin: {margin}px 0;" />'

    def _compile_simple_template(self, template: dict, data: dict) -> str:
        """Compile a simple key-value template format."""
        content = template.get("content", "")
        if isinstance(content, str):
            return self._replace_bindings(content, data)
        return ""

    def _replace_bindings(self, text: str, data: dict) -> str:
        """Replace {{variable}} bindings with actual data."""

        def replace_match(match):
            expression = match.group(1).strip()
            # Handle pipes (filters)
            parts = expression.split("|")
            field_path = parts[0].strip()

            value = self._get_bound_value(f"{{{{{field_path}}}}}", data)

            # Apply filters
            for filter_part in parts[1:]:
                filter_name = filter_part.strip()
                if filter_name == "currency":
                    value = self._format_currency(value)
                elif filter_name == "uppercase":
                    value = str(value).upper()
                elif filter_name == "lowercase":
                    value = str(value).lower()

            return str(value) if value is not None else ""

        return re.sub(r"\{\{(.+?)\}\}", replace_match, text)

    def _get_bound_value(self, path: str, data: dict) -> Any:
        """Get a value from data using dot notation path."""
        # Remove {{ }} if present
        path = re.sub(r"^\{\{|\}\}$", "", path).strip()

        parts = path.split(".")
        value = data
        for part in parts:
            if isinstance(value, dict):
                value = value.get(part)
            else:
                return None
        return value

    def _wrap_html(self, body: str, page_settings: dict) -> str:
        """Wrap body content in a complete HTML document."""
        return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }}
        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            color: #1a1a1a;
        }}
        table {{
            border-collapse: collapse;
        }}
        img {{
            max-width: 100%;
        }}
    </style>
</head>
<body>
    {body}
</body>
</html>
"""

    @staticmethod
    def _format_currency(value: Any, symbol: str = "$") -> str:
        """Format a number as currency."""
        try:
            num = float(value)
            return f"{symbol}{num:,.2f}"
        except (ValueError, TypeError):
            return str(value)

    @staticmethod
    def _format_date(value: Any, fmt: str = "%B %d, %Y") -> str:
        """Format a date string."""
        from datetime import datetime

        try:
            if isinstance(value, str):
                dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
            else:
                dt = value
            return dt.strftime(fmt)
        except Exception:
            return str(value)

    @staticmethod
    def _format_number(value: Any, decimals: int = 2) -> str:
        """Format a number with specified decimal places."""
        try:
            num = float(value)
            return f"{num:,.{decimals}f}"
        except (ValueError, TypeError):
            return str(value)
