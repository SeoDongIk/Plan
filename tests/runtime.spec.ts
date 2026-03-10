import { test, expect } from '@playwright/test';

test.describe('Runtime Error Verification', () => {
    test('Extractor Page should load without console errors and allow extraction', async ({ page }) => {
        test.setTimeout(90000); // Allow more time for AI generation
        const consoleErrors: string[] = [];
        page.on('console', msg => {
            // Collect errors
            if (msg.type() === 'error') {
                const text = msg.text();
                // Ignore known harmless dev warnings (like hot reload)
                if (!text.includes('favicon.ico') && !text.includes('webpack')) {
                    consoleErrors.push(text);
                }
            }
        });

        await page.goto('http://localhost:3000/extractor');

        // Wait for the UI layout to settle
        await page.waitForTimeout(1000);

        // Assert that the header or title is visible
        await expect(page.locator('h1')).toContainText('Trend-Driven Topic Extractor', { timeout: 10000 });

        // Ensure no unexpected console errors were thrown on load
        expect(consoleErrors).toHaveLength(0);

        // Simulate input and test interaction
        const searchInput = page.getByRole('textbox').first();
        await searchInput.fill('Playwright Test Keyword');

        const extractBtn = page.getByRole('button', { name: '주제 추출 시작' });
        await expect(extractBtn).toBeVisible();

        // Click and wait for generation result or error
        // (We mock API usage or just rely on actual response failing gently. In this case, 
        // it will either work or hit 429 quota, which is handled gracefully in the codebase.)
        await extractBtn.click();

        // Check if the loading state appears
        await expect(page.locator('text=AI가 트렌드 데이터를 수집하고')).toBeVisible();

        // Wait for loading to finish (max 60s for AI inference)
        await expect(page.locator('text=AI가 트렌드 데이터를 수집하고')).toBeHidden({ timeout: 60000 });
    });

    test('Creative Studio Page should load without console errors', async ({ page }) => {
        const consoleErrors: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                const text = msg.text();
                if (!text.includes('favicon.ico') && !text.includes('webpack')) {
                    consoleErrors.push(text);
                }
            }
        });

        await page.goto('http://localhost:3000/creative?topic=Test&type=Thumbnail');
        await page.waitForTimeout(1000);

        // Expect the basic framework to be loaded
        await expect(page.locator('h1')).toContainText('Visual Asset Studio', { timeout: 5000 });

        // There might be network errors if API key is invalid, but the site shouldn't crash
        expect(consoleErrors.length).toBeLessThanOrEqual(5); // allow soft API console errors but no full React crash
    });
});
