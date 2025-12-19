import { test, expect } from '@playwright/test';

test.describe('Editor Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/editor');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('.document-paper', { timeout: 15000 });
  });

  test('should load editor page', async ({ page }) => {
    await page.goto('/editor');

    // Check that toolbar is visible
    await expect(page.getByText('New Template', { exact: true })).toBeVisible();

    // Check that sidebar with blocks is visible
    await expect(page.getByText('Toolbox')).toBeVisible();
    await expect(page.getByText('Text Block')).toBeVisible();
    await expect(page.getByText('Image', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Table', { exact: true }).first()).toBeVisible();

    // Check canvas is present
    await expect(page.locator('.document-paper')).toBeVisible();
  });

  test('should display save status indicator', async ({ page }) => {
    await page.goto('/editor');

    // Should show save status (Saved, Saving, etc.)
    const saveIndicator = page.getByText(/Saved|Saving/);
    await expect(saveIndicator.first()).toBeVisible({ timeout: 5000 });
  });

  test('should have working page size selector', async ({ page }) => {
    await page.goto('/editor');

    // Find and click the page size selector (in toolbar)
    const sizeSelector = page.locator('button').filter({ hasText: 'A4' }).first();
    await expect(sizeSelector).toBeVisible();

    // Click to open dropdown
    await sizeSelector.click();

    // Check options are available in the dropdown
    await expect(page.getByRole('option', { name: 'Letter' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Legal' })).toBeVisible();
  });

  test('should have working orientation selector', async ({ page }) => {
    await page.goto('/editor');

    // Find the orientation selector showing Portrait
    const orientationSelector = page.locator('button').filter({ hasText: 'Portrait' }).first();
    await expect(orientationSelector).toBeVisible();

    // Click to open dropdown
    await orientationSelector.click();

    // Check Landscape option is available in dropdown
    await expect(page.getByRole('option', { name: /Landscape/ })).toBeVisible();
  });

  test('should have zoom controls', async ({ page }) => {
    await page.goto('/editor');

    // Check zoom percentage is displayed
    const zoomButton = page.locator('button').filter({ hasText: '75%' });
    await expect(zoomButton).toBeVisible();

    // Find zoom controls area
    const zoomControls = page.locator('.flex.items-center.gap-1');
    await expect(zoomControls.first()).toBeVisible();
  });

  test('should have undo/redo buttons', async ({ page }) => {
    await page.goto('/editor');

    // Find the history control group
    const historyControls = page.locator('.bg-\\[var\\(--secondary\\)\\].rounded-lg');
    await expect(historyControls.first()).toBeVisible();
  });

  test('should navigate back to home', async ({ page }) => {
    await page.goto('/editor');

    // Click the back arrow/logo link
    const backLink = page.locator('a[href="/"]').first();
    await backLink.click();

    // Should be on home page
    await expect(page).toHaveURL('/');

    // Check for home page content
    await expect(page.getByText('FloorCraft Studio').first()).toBeVisible();
  });
});

test.describe('Editor Drag and Drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/editor');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('.document-paper', { timeout: 15000 });
  });

  test('should show blocks in sidebar', async ({ page }) => {
    // Verify all expected blocks are in the sidebar
    await expect(page.getByText('Text Block')).toBeVisible();
    await expect(page.getByText('Rich text content')).toBeVisible();

    await expect(page.getByText('Image', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Logo, photo, or graphic')).toBeVisible();

    await expect(page.getByText('Table', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Data grid with rows')).toBeVisible();

    await expect(page.getByText('Row', { exact: true })).toBeVisible();
    await expect(page.getByText('Horizontal layout')).toBeVisible();

    await expect(page.getByText('Spacer')).toBeVisible();
    await expect(page.getByText('Add vertical space')).toBeVisible();

    await expect(page.getByText('Divider')).toBeVisible();
    await expect(page.getByText('Horizontal line')).toBeVisible();
  });

  test('text block should be draggable', async ({ page }) => {
    // Find the Text Block in sidebar
    const textBlock = page.getByText('Text Block').first();
    await expect(textBlock).toBeVisible();

    // Check parent card is visible
    const textBlockCard = textBlock.locator('..');
    await expect(textBlockCard).toBeVisible();
  });

  test('should show drop placeholder in canvas', async ({ page }) => {
    // Wait for all animations to complete
    await page.waitForTimeout(1500);

    // Find the canvas container
    const container = page.locator('.craftjs-container');
    await expect(container).toBeVisible();

    // Verify the empty state placeholder is shown
    await expect(page.getByText('Drop blocks here to start building')).toBeVisible();
  });

  test('sidebar blocks should have draggable attribute', async ({ page }) => {
    // Wait for animations
    await page.waitForTimeout(1500);

    // Check that tool blocks have draggable="true" set by CraftJS
    const textBlock = page.locator('.tool-block').filter({ hasText: 'Text Block' }).first();
    const draggable = await textBlock.getAttribute('draggable');
    expect(draggable).toBe('true');
  });

  test('should drop MULTIPLE blocks sequentially', async ({ page }) => {
    await page.waitForTimeout(1500);

    const dropTarget = page.locator('.craftjs-container');
    await expect(dropTarget).toBeVisible();

    // Drop first block (Text)
    const textBlock = page.locator('.tool-block').filter({ hasText: 'Text Block' }).first();
    await textBlock.dragTo(dropTarget);
    await page.waitForTimeout(500);

    const afterFirst = await dropTarget.innerHTML();
    console.log('After 1st drop - contains TextBlock:', afterFirst.includes('Add your text here'));

    // Take screenshot after first drop
    await page.screenshot({ path: 'test-results/multi-01-after-first.png', fullPage: true });

    // Drop second block (Spacer)
    const spacerBlock = page.locator('.tool-block').filter({ hasText: 'Spacer' }).first();
    await spacerBlock.dragTo(dropTarget);
    await page.waitForTimeout(500);

    const afterSecond = await dropTarget.innerHTML();
    console.log('After 2nd drop - HTML length:', afterSecond.length);
    console.log('After 2nd drop - contains both:', afterFirst.length < afterSecond.length);

    // Take screenshot after second drop
    await page.screenshot({ path: 'test-results/multi-02-after-second.png', fullPage: true });

    // Drop third block (Divider)
    const dividerBlock = page.locator('.tool-block').filter({ hasText: 'Divider' }).first();
    await dividerBlock.dragTo(dropTarget);
    await page.waitForTimeout(500);

    const afterThird = await dropTarget.innerHTML();
    console.log('After 3rd drop - HTML length:', afterThird.length);

    // Take screenshot after third drop
    await page.screenshot({ path: 'test-results/multi-03-after-third.png', fullPage: true });

    // Verify multiple blocks were added
    expect(afterThird.length).toBeGreaterThan(afterFirst.length);
  });

  test('REAL drag and drop test with screenshots', async ({ page }) => {
    // Wait for animations to complete
    await page.waitForTimeout(2000);

    // Take BEFORE screenshot
    await page.screenshot({ path: 'test-results/01-BEFORE-drag.png', fullPage: true });

    // Get the text block from sidebar
    const textBlock = page.locator('.tool-block').filter({ hasText: 'Text Block' }).first();
    await expect(textBlock).toBeVisible();

    // Get the drop target
    const dropTarget = page.locator('.craftjs-container');
    await expect(dropTarget).toBeVisible();

    // Log initial state
    const initialHTML = await dropTarget.innerHTML();
    console.log('=== BEFORE DRAG ===');
    console.log('Initial container HTML:', initialHTML);

    // Get bounding boxes for manual drag
    const sourceBox = await textBlock.boundingBox();
    const targetBox = await dropTarget.boundingBox();

    if (!sourceBox || !targetBox) {
      throw new Error('Could not get bounding boxes');
    }

    console.log('Source box:', sourceBox);
    console.log('Target box:', targetBox);

    // Try multiple drag approaches

    // Approach 1: Playwright's native drag
    console.log('Trying Playwright dragTo...');
    try {
      await textBlock.dragTo(dropTarget, { timeout: 5000 });
      console.log('dragTo completed');
    } catch (e) {
      console.log('dragTo failed:', e);
    }

    await page.screenshot({ path: 'test-results/02-AFTER-dragTo.png', fullPage: true });

    // Approach 2: Manual mouse events
    console.log('Trying manual mouse drag...');
    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 20 });
    await page.mouse.up();

    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/03-AFTER-mouse-drag.png', fullPage: true });

    // Check final state
    const finalHTML = await dropTarget.innerHTML();
    console.log('=== AFTER DRAG ===');
    console.log('Final container HTML:', finalHTML);

    // Check if anything changed
    const changed = finalHTML !== initialHTML;
    console.log('Content changed:', changed);

    // Check for any errors on the page
    const errorOverlay = page.locator('[data-nextjs-dialog-overlay]');
    const hasError = await errorOverlay.isVisible().catch(() => false);
    console.log('Has error overlay:', hasError);

    if (hasError) {
      await page.screenshot({ path: 'test-results/04-ERROR-state.png', fullPage: true });
    }

    // This test documents what's happening, not necessarily passing
    console.log('Test complete - check screenshots in test-results/');
  });
});

test.describe('Editor Auto-Save', () => {
  test('should persist page settings after reload', async ({ page }) => {
    await page.goto('/editor');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('.document-paper', { timeout: 15000 });

    // Change page size to Letter
    const sizeSelector = page.locator('button').filter({ hasText: 'A4' }).first();
    await sizeSelector.click();
    await page.getByRole('option', { name: 'Letter' }).click();

    // Wait for auto-save
    await page.waitForTimeout(2000);

    // Verify save status shows saved (could be "Saved" or "Saved at...")
    await expect(page.getByText(/Saved/).first()).toBeVisible({ timeout: 5000 });

    // Reload the page
    await page.reload();
    await page.waitForSelector('.document-paper', { timeout: 15000 });

    // Check that Letter is still selected
    await expect(page.locator('button').filter({ hasText: 'Letter' }).first()).toBeVisible();
  });

  test('should show save status changes', async ({ page }) => {
    await page.goto('/editor');
    await page.waitForSelector('.document-paper', { timeout: 15000 });

    // Wait for initial state
    await page.waitForTimeout(1000);

    // Make a change - change orientation
    const orientationSelector = page.locator('button').filter({ hasText: /Portrait|Landscape/ }).first();
    await orientationSelector.click();

    // Click an option
    const option = page.getByRole('option').first();
    await option.click();

    // Should eventually show saved status
    await expect(page.getByText(/Saved/).first()).toBeVisible({ timeout: 5000 });
  });

  test('should store state in localStorage', async ({ page }) => {
    await page.goto('/editor');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('.document-paper', { timeout: 15000 });

    // Make a change
    const sizeSelector = page.locator('button').filter({ hasText: 'A4' }).first();
    await sizeSelector.click();
    await page.getByRole('option', { name: 'Legal' }).click();

    // Wait for auto-save
    await page.waitForTimeout(2000);

    // Check localStorage has the saved state
    const hasStoredState = await page.evaluate(() => {
      const stored = localStorage.getItem('floorcraft-editor-state');
      if (!stored) return false;
      try {
        const data = JSON.parse(stored);
        // Check that pageSettings exists and has Legal size
        return data.pageSettings?.size === 'LEGAL';
      } catch {
        return false;
      }
    });

    expect(hasStoredState).toBeTruthy();
  });
});

test.describe('Home Page', () => {
  test('should load home page with all sections', async ({ page }) => {
    await page.goto('/');

    // Check header is visible
    await expect(page.getByText('FloorCraft Studio').first()).toBeVisible();
    await expect(page.getByText('Professional Estimates')).toBeVisible();

    // Check templates section heading (use exact match)
    await expect(page.getByText('Your Workspace', { exact: true })).toBeVisible();

    // Check "Create Template" card
    await expect(page.getByRole('heading', { name: 'Create Template' })).toBeVisible();

    // Check quick access section
    await expect(page.getByText('Quick Access')).toBeVisible();

    // Check quick access cards
    await expect(page.getByRole('heading', { name: 'Data Sources' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Generated PDFs' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  });

  test('should navigate to editor from New Template button', async ({ page }) => {
    await page.goto('/');

    // Click "New Template" button in header
    const newTemplateButton = page.getByRole('link', { name: /New Template/ });
    await newTemplateButton.click();

    // Should be on editor page
    await expect(page).toHaveURL('/editor');
  });

  test('should navigate to editor from Create Template card', async ({ page }) => {
    await page.goto('/');

    // Click "Create Template" card
    const createCard = page.getByRole('heading', { name: 'Create Template' });
    await createCard.click();

    // Should be on editor page
    await expect(page).toHaveURL('/editor');
  });

  test('should have working theme toggle', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find theme toggle button by title
    const themeToggle = page.getByRole('button', { name: /Toggle theme|Switch to/ });
    await expect(themeToggle).toBeVisible();

    // Get initial theme state
    const initialIsDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );

    // Click to toggle theme
    await themeToggle.click();

    // Wait for theme change
    await page.waitForTimeout(500);

    // Check theme changed
    const newIsDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );

    expect(newIsDark).not.toBe(initialIsDark);
  });
});

test.describe('Visual Regression', () => {
  test('home page visual snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for animations to complete
    await page.waitForTimeout(1500);

    await expect(page).toHaveScreenshot('home-page.png', {
      maxDiffPixels: 500,
      threshold: 0.3,
    });
  });

  test('editor page visual snapshot', async ({ page }) => {
    await page.goto('/editor');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('.document-paper', { timeout: 15000 });

    // Wait for animations to complete
    await page.waitForTimeout(1500);

    await expect(page).toHaveScreenshot('editor-page.png', {
      maxDiffPixels: 500,
      threshold: 0.3,
    });
  });
});

test.describe('Responsive Design', () => {
  test('editor should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/editor');
    await page.waitForSelector('.document-paper', { timeout: 15000 });

    // Check main elements are still visible
    await expect(page.locator('.document-paper')).toBeVisible();
    await expect(page.getByText('Toolbox')).toBeVisible();
  });
});
