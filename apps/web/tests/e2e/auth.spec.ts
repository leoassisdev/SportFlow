import { test, expect } from '@playwright/test';

test.describe('Auth flow', () => {
  test('landing tem CTA de cadastro', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Placar ao vivo');
    await expect(page.getByRole('link', { name: /Comecar teste gratis/i }).first()).toBeVisible();
  });

  test('login page mostra Google button + form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('google-login-btn')).toBeVisible();
    await expect(page.getByTestId('login-email')).toBeVisible();
    await expect(page.getByTestId('login-password')).toBeVisible();
  });

  test('register bloqueia sem aceite de privacidade', async ({ page }) => {
    await page.goto('/register');
    await page.getByTestId('register-name').fill('E2E User');
    await page.getByTestId('register-whatsapp').fill('11 90000-0000');
    await page.getByTestId('register-email').fill('e2e-notaccept@test.com');
    await page.getByTestId('register-password').fill('Senha123');
    await page.getByTestId('register-org').fill('E2E Liga');
    // Sem clicar em acceptPrivacy
    // Checkbox tem `required` no HTML, o browser bloqueia submit e mostra tooltip nativo.
    const cb = page.getByTestId('accept-privacy');
    await expect(cb).not.toBeChecked();
    await page.getByTestId('register-submit').click();
    // Continua na mesma pagina
    await expect(page).toHaveURL(/\/register/);
  });

  test('/dashboard sem cookie redireciona para login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('placar publico com token invalido mostra empty state', async ({ page }) => {
    await page.goto('/live/token-que-nao-existe-e2e');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/n[ãa]o encontrado/i);
  });
});
