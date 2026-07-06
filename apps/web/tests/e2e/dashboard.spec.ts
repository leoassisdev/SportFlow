import { test, expect } from '@playwright/test';

const API = process.env.E2E_API_URL ?? 'http://localhost:3001';

test.describe('Dashboard logado (via dev-login)', () => {
  test('SuperAdmin auto-login e ve MRR', async ({ page }) => {
    await page.goto(`${API}/api/v1/auth/dev-login?next=/superadmin`);
    await expect(page).toHaveURL(/\/superadmin/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Painel operacional');
  });

  test('Owner auto-login e ve dashboard com campeonatos', async ({ page }) => {
    await page.goto(
      `${API}/api/v1/auth/dev-login?email=organizador@ligadobairro.com&next=/dashboard`,
    );
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Bem-vindo');
  });

  test('Owner lista campeonatos', async ({ page }) => {
    await page.goto(
      `${API}/api/v1/auth/dev-login?email=organizador@ligadobairro.com&next=/championships`,
    );
    await expect(page).toHaveURL(/\/championships/);
    await expect(page.locator('text=Interbairros 2026').first()).toBeVisible();
  });

  test('SuperAdmin: /tenants mostra pelo menos 1 tenant', async ({ page }) => {
    await page.goto(`${API}/api/v1/auth/dev-login?next=/superadmin/tenants`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Tenants');
    await expect(page.locator('table tbody tr')).toHaveCount(await page.locator('table tbody tr').count());
  });
});
