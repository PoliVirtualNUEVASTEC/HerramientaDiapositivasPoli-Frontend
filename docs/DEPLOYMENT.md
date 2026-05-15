# Deployment

## Resumen

La aplicacion esta preparada para compilarse con Vite y desplegarse como SPA. El repositorio incluye `vercel.json`, lo que indica soporte explicito para despliegue en Vercel.

## Build de produccion

Comando verificado:

```bash
npm run build
```

Resultado observado:

- compila correctamente
- genera salida en `dist/`
- reporta advertencia por chunks grandes, especialmente alrededor del bundle principal y librerias de exportacion

## Hosting detectado

| Pieza | Evidencia |
| --- | --- |
| Frontend SPA | `vercel.json` |
| Backend remoto | valor real de `VITE_BACKEND_URL` en `.env` apunta a Render |
| Dominio de pruebas E2E | `cypress.config.js` usa `https://presentai.juajsia.lat` |

## Configuracion de Vercel

Archivo: `vercel.json`

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

Proposito:

- redirigir cualquier ruta al `index.html`
- permitir deep links de `react-router-dom`

## Variables de entorno de despliegue

| Variable | Requerida en build/runtime |
| --- | --- |
| `VITE_BACKEND_URL` | si |
| `VITE_SUPABASE_URL` | si |
| `VITE_SUPABASE_ANON_KEY` | si |
| `VITE_SUPABASE_BUCKET` | recomendable |

Notas:

- Al ser variables `VITE_*`, quedan embebidas en el bundle cliente.
- Deben configurarse por ambiente desde la plataforma de despliegue.

## Flujo de despliegue recomendado

```mermaid
flowchart LR
    Dev[Repositorio] --> Install[npm install]
    Install --> Build[npm run build]
    Build --> Dist[dist/]
    Dist --> Host[Vercel u otro host SPA]
    Host --> Browser[Usuarios]
```

## Configuracion de dominios

Lo que el repositorio permite afirmar:

- existe al menos un dominio de pruebas o ambiente accesible desde Cypress: `presentai.juajsia.lat`
- no hay configuracion adicional de dominio custom dentro del repo aparte de `vercel.json`

No se detectaron:

- configuraciones Nginx
- Netlify config
- Dockerfile
- GitHub Actions de despliegue

## Riesgos operativos

| Riesgo | Impacto |
| --- | --- |
| `build` con chunks grandes | afecta primera carga y cache |
| sin `env.example` | onboarding y despliegue menos reproducibles |
| tests apuntando a dominio remoto | puede mezclar QA con entornos no aislados |
| `lint` roto | CI incompleta si se intenta agregar quality gate rapido |

## Recomendaciones

1. Agregar `env.example` sin secretos.
2. Incorporar code splitting adicional para rutas del editor/preview.
3. Crear scripts npm para `cypress:open`, `cypress:run` y `check`.
4. Definir pipeline CI/CD con al menos `install`, `build` y pruebas basicas.
