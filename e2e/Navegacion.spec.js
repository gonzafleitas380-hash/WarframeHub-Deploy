import { test, expect } from '@playwright/test';
import { usuarioDePrueba, registrar, login } from './helpers.js';
 
test.describe('Navegación entre pantallas', () => {
 
  test('Home → Catálogo: el CTA "Explorar Warframes" navega a /catalogo', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Explorar Warframes' }).click();
    await expect(page).toHaveURL('/catalogo');
  });
 
  test('Home → Login: el botón "Iniciar sesión" navega a /login', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL('/login');
  });
 
  test('Home → Registro: el botón "Registrarse" navega a /registro', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Registrarse' }).click();
    await expect(page).toHaveURL('/registro');
  });
 
  test('Login → Registro: el botón del panel brand alterna sin cambiar de URL', async ({ page }) => {
    await page.goto('/login');
    const card = page.locator('.wf-card');
    await expect(card).not.toHaveClass(/wf-card--register/);
 
    await page.getByRole('button', { name: 'REGISTRARSE' }).click();
 
    await expect(card).toHaveClass(/wf-card--register/);
    await expect(page).toHaveURL('/login'); // la URL no cambia, solo el estado visual
  });
 
  test('Login recuerda la pantalla de origen y vuelve a ella tras loguearse', async ({ page, request }) => {
    const usuario = usuarioDePrueba();
    await registrar(request, usuario);
 
    // Simula llegar a /login desde el botón de Home, que guarda location.state.from
    await page.goto('/');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL('/login');
 
    await login(page, usuario);
 
    // Como "from" era "/", debe volver a Home logueado
    await expect(page).toHaveURL('/');
  });
 
  test('Header → Perfil propio: el dropdown de usuario navega a /perfil', async ({ page, request }) => {
    const usuario = usuarioDePrueba();
    await registrar(request, usuario);
    await login(page, usuario);
    await expect(page).toHaveURL('/');
 
    await page.locator('.profile-wrapper').hover();
    await page.locator('.profile-dropdown').getByText(usuario.username).click();
 
    await expect(page).toHaveURL('/perfil');
  });
 
  test('Búsqueda de usuario → Perfil ajeno: seleccionar un resultado navega a /perfil/:username', async ({ page, request }) => {
    const buscador = usuarioDePrueba();
    const buscado   = usuarioDePrueba();
    await registrar(request, buscador);
    await registrar(request, buscado);
 
    await login(page, buscador);
    await page.getByPlaceholder('Buscar usuario...').fill(buscado.username);
    await page.getByText(`@${buscado.username}`).click();
 
    await expect(page).toHaveURL(`/perfil/${buscado.username}`);
  });
 
  test('Perfil ajeno → Botón "Volver" regresa a la pantalla anterior', async ({ page, request }) => {
    const buscador = usuarioDePrueba();
    const buscado   = usuarioDePrueba();
    await registrar(request, buscador);
    await registrar(request, buscado);
 
    await login(page, buscador);
    await expect(page).toHaveURL('/');
 
    await page.goto(`/perfil/${buscado.username}`);
    await page.getByRole('button', { name: /Volver/ }).click();
 
    await expect(page).toHaveURL('/'); // vuelve a Home, que era la pantalla anterior
  });
 
  test('Perfil ajeno inexistente muestra "Usuario no encontrado" en vez de romper la página', async ({ page }) => {
    await page.goto('/perfil/usuario_que_no_existe_12345');
    await expect(page.getByText('Usuario no encontrado.')).toBeVisible();
  });
 
  test('[gap conocido] una ruta que no existe no muestra una página 404', async ({ page }) => {
    const respuesta = await page.goto('/esta-ruta-no-existe');
    // React Router no tiene ruta catch-all ("*") definida en App.jsx:
    // no hay redirección ni mensaje, la pantalla queda en blanco.
    await expect(page.locator('#page-content, .pf-root, .wf-root')).toHaveCount(0);
  });
 
});