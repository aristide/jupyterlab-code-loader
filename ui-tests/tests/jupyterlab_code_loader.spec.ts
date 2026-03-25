import { test, expect } from '@playwright/test';

/**
 * Verify the extension registers the sidebar panel.
 */
test('should register the code loader sidebar panel', async ({ page }) => {
  await page.goto('/lab');
  // The sidebar tab should be visible
  const tab = page.getByRole('tab', { name: 'Code & Snippets' });
  await expect(tab).toBeVisible({ timeout: 60000 });
});

test('should open the sidebar panel on click', async ({ page }) => {
  await page.goto('/lab');
  // Click the sidebar tab
  const tab = page.getByRole('tab', { name: 'Code & Snippets' });
  await tab.click();

  // The sidebar content should be visible
  const sidebar = page.locator('#jupyterlab-code-loader-sidebar');
  await expect(sidebar).toBeVisible();
});
