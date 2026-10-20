import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { basename, dirname } from 'path';
import { readFile } from 'fs/promises';
import pool from '../../db.js';
import authRouter from '../auth.js';
import warframesRouter from '../warframes.js';

vi.mock('../../db.js', () => ({ default: { query: vi.fn() } }));
vi.mock('fs/promises');

function buildAuthApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', authRouter);
  return app;
}

function buildWarframesApp() {
  const app = express();
  app.use('/api/warframes', warframesRouter);
  return app;
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('POST /api/register — validaciones propias del endpoint (más allá de lo que haga la DB)', () => {

  it('[gap conocido] no valida que los campos obligatorios estén presentes antes de llamar a la DB', async () => {
    // Si la capa de datos "aceptara" cualquier cosa, el endpoint no tiene
    // ningún chequeo propio de campos faltantes: los manda tal cual a la SP.
    pool.query.mockResolvedValue([{}]);

    const res = await request(buildAuthApp())
      .post('/api/register')
      .send({ username: 'sololoeso' }); // faltan nombre, apellido, email, contraseña

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(pool.query).toHaveBeenCalledWith(
      'CALL sp_registrar_usuario(?, ?, ?, ?, ?)',
      [undefined, undefined, 'sololoeso', undefined, undefined]
    );
  });

  it('[gap conocido] acepta un email sin "@" ni dominio (no valida formato)', async () => {
    pool.query.mockResolvedValue([{}]);

    const res = await request(buildAuthApp())
      .post('/api/register')
      .send({
        nombre: 'Ana', apellido: 'Gomez', username: 'ana2',
        email: 'esto-no-es-un-email', contraseña: '123',
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

});

describe('GET /api/warframes/:nombre — manejo de IDs inválidos', () => {

  it('[gap conocido / seguridad] un "nombre" con "../" permite leer archivos fuera de data/warframes', async () => {
    readFile.mockResolvedValue(JSON.stringify({ contenido: 'de otro archivo' }));

    // %2F se decodifica a "/" en el parámetro de ruta → nombre = "../secreto"
    const res = await request(buildWarframesApp()).get('/api/warframes/..%2Fsecreto');

    const rutaConsultada = readFile.mock.calls[0][0];
    // Si estuviera "enjaulado" dentro de data/warframes, la carpeta padre
    // del archivo leído seguiría siendo "warframes". No lo está.
    expect(basename(dirname(rutaConsultada))).not.toBe('warframes');
    expect(res.status).toBe(200); // el contenido se devuelve igual, sin detectar el intento
  });

  it('un nombre con espacios o mayúsculas no rompe la búsqueda (normaliza a minúsculas)', async () => {
    readFile.mockResolvedValue(JSON.stringify({ nombre: 'Wisp' }));

    const res = await request(buildWarframesApp()).get('/api/warframes/WISP');

    const rutaConsultada = readFile.mock.calls[0][0];
    // Solo el nombre del archivo se normaliza a minúsculas; el resto de la
    // ruta (carpetas del proyecto) conserva mayúsculas si el SO las tiene.
    expect(basename(rutaConsultada)).toBe('wisp.json');
    expect(res.status).toBe(200);
  });

});
