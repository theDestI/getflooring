from playwright.async_api import async_playwright, Browser, Playwright

from app.schemas import PDFOptions


class PDFEngine:
    """Playwright-based PDF generation engine."""

    def __init__(self):
        self._playwright: Playwright | None = None
        self._browser: Browser | None = None

    async def initialize(self):
        """Initialize the browser instance. Call once at application startup."""
        self._playwright = await async_playwright().start()
        self._browser = await self._playwright.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )

    async def shutdown(self):
        """Clean up resources. Call at application shutdown."""
        if self._browser:
            await self._browser.close()
        if self._playwright:
            await self._playwright.stop()

    async def generate_pdf(self, html_content: str, options: PDFOptions) -> bytes:
        """Generate a PDF from HTML content."""
        if not self._browser:
            raise RuntimeError("PDF Engine not initialized. Call initialize() first.")

        context = await self._browser.new_context()
        page = await context.new_page()

        try:
            # Set HTML content
            await page.set_content(html_content, wait_until="networkidle")

            # Generate PDF
            pdf_bytes = await page.pdf(
                format=options.page_size,
                landscape=options.orientation == "landscape",
                margin={
                    "top": options.margin_top,
                    "bottom": options.margin_bottom,
                    "left": options.margin_left,
                    "right": options.margin_right,
                },
                print_background=True,
            )

            return pdf_bytes
        finally:
            await context.close()

    async def generate_screenshot(self, html_content: str) -> bytes:
        """Generate a screenshot thumbnail of the HTML content."""
        if not self._browser:
            raise RuntimeError("PDF Engine not initialized")

        context = await self._browser.new_context(
            viewport={"width": 794, "height": 1123}  # A4 dimensions
        )
        page = await context.new_page()

        try:
            await page.set_content(html_content, wait_until="networkidle")
            screenshot = await page.screenshot(type="png")
            return screenshot
        finally:
            await context.close()
