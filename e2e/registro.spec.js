import { test, expect } from '@playwright/test';
import { usuarioDePrueba, registrar, login } from './helpers.js';

// Completa el formulario de registro (panel derecho de /registro) y envía.
async function completarFormularioRegistro(page, usuario) {
  const panel = page.locator('.wf-panel--register');
  await panel.getByPlaceholder('Nombre').fill(usuario.nombre);
  await panel.getByPlaceholder('Apellido').fill(usuario.apellido);
  await panel.getByPlaceholder('tu_username').fill(usuario.username);
  await panel.getByPlaceholder('tu@email.com').fill(usuario.email);
  await panel.getByPlaceholder('••••••••').fill(usuario.contraseña);
  await panel.getByRole('button', { name: 'REGISTRARSE' }).click();
}

test.describe('Registro de cuenta', () => {

  test('registro exitoso: crea la cuenta y permite loguearse con esas credenciales', async ({ page }) => {
    const usuario = usuarioDePrueba();

    await page.goto('/registro');
    await completarFormularioRegistro(page, usuario);

    // Registro OK: no queda ningún error visible y el brand panel vuelve a
    // cubrir el registro (deja de tener la clase wf-card--register).
    await expect(page.locator('.wf-panel--register .wf-alert--error')).toHaveCount(0);
    await expect(page.locator('.wf-card')).not.toHaveClass(/wf-card--register/);

    // La cuenta realmente quedó creada en la base: nos logueamos con ella.
    await login(page, usuario);
    await expect(page).toHaveURL('/');
    await page.locator('.profile-wrapper').hover();
    await expect(page.locator('.profile-dropdown').getByText(usuario.username)).toBeVisible();
  });

  test('registro con campos vacíos muestra el error de validación y no llama a la API', async ({ page }) => {
    await page.goto('/registro');
    const panel = page.locator('.wf-panel--register');

    let llamoALaApi = false;
    await page.route('**/api/register', route => {
      llamoALaApi = true;
      route.continue();
    });

    await panel.getByRole('button', { name: 'REGISTRARSE' }).click();

    await expect(panel.getByText('Completá todos los campos.')).toBeVisible();
    expect(llamoALaApi).toBe(false);
  });

  test('registro con username ya existente muestra el error del backend', async ({ page, request }) => {
    const existente = usuarioDePrueba();
    await registrar(request, existente);

    const nuevo = usuarioDePrueba();
    nuevo.username = existente.username; // mismo username, email distinto

    await page.goto('/registro');
    await completarFormularioRegistro(page, nuevo);

    await expect(
      page.locator('.wf-panel--register').getByText('Ese username ya está en uso.')
    ).toBeVisible();
  });

  test('registro con email ya existente muestra el error del backend', async ({ page, request }) => {
    const existente = usuarioDePrueba();
    await registrar(request, existente);

    const nuevo = usuarioDePrueba();
    nuevo.email = existente.email; // mismo email, username distinto

    await page.goto('/registro');
    await completarFormularioRegistro(page, nuevo);

    await expect(
      page.locator('.wf-panel--register').getByText('Ese email ya está registrado.')
    ).toBeVisible();
  });

  // --- Casos que documentan gaps reales frente a la especificación (README) ---
  // No son "tests que deberían fallar": reflejan el comportamiento actual de
  // la app, que hoy no valida lo que pide el README (RN-02). Sirven como
  // evidencia para el informe de testing.

  test('[gap conocido] un email sin formato válido es aceptado (no hay validación de formato)', async ({ page }) => {
    const usuario = usuarioDePrueba();
    usuario.email = `no-es-un-email-${Date.now()}`; // sin "@" ni dominio

    await page.goto('/registro');
    await completarFormularioRegistro(page, usuario);

    // Se esperaría un error de formato inválido; hoy el registro se completa igual.
    await expect(page.locator('.wf-panel--register .wf-alert--error')).toHaveCount(0);
    await expect(page.locator('.wf-card')).not.toHaveClass(/wf-card--register/);
  });

  test('[gap conocido] una contraseña de menos de 8 caracteres es aceptada (RN-02 no se cumple)', async ({ page }) => {
    const usuario = usuarioDePrueba();
    usuario.contraseña = '123'; // RN-02 pide mínimo 8 caracteres

    await page.goto('/registro');
    await completarFormularioRegistro(page, usuario);

    // Se esperaría un error de contraseña débil; hoy el registro se completa igual.
    await expect(page.locator('.wf-panel--register .wf-alert--error')).toHaveCount(0);
    await expect(page.locator('.wf-card')).not.toHaveClass(/wf-card--register/);
  });

});