import { test, expect } from '@jupyterlab/galata';

/**
 * Verify the extension registers the sidebar panel.
 */
test('should register the code loader sidebar panel', async ({ page }) => {
  // The sidebar tab should be visible
  const tab = page.getByRole('tab', { name: 'Examples & Snippets' });
  await expect(tab).toBeVisible({ timeout: 60000 });
});

test('should open the sidebar panel on click', async ({ page }) => {
  // Click the sidebar tab
  const tab = page.getByRole('tab', { name: 'Examples & Snippets' });
  await tab.click();

  // The sidebar content should be visible
  const sidebar = page.locator('#jupyterlab-code-loader-sidebar');
  await expect(sidebar).toBeVisible();
});
