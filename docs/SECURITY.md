# Security

## Resumen

El frontend muestra buenas decisiones en algunos frentes, especialmente al no almacenar tokens manualmente en el navegador. Sin embargo, tambien expone riesgos operativos y de hardening que conviene corregir.

## Manejo de sesion y tokens

### Fortalezas

- `axios` usa `withCredentials: true`, lo que sugiere uso de cookies y no de tokens guardados manualmente.
- No hay uso de `localStorage`, `sessionStorage` ni `document.cookie`.
- Existe intento de refresh de sesion cuando el backend responde `401`.

### Limitaciones

- El comportamiento exacto de cookies (`httpOnly`, `secure`, `sameSite`) no puede confirmarse desde este repositorio frontend.
- El interceptor no fuerza logout centralizado si el refresh falla.

## Proteccion de rutas

| Mecanismo | Estado |
| --- | --- |
| `ProtectedRoute` | implementado |
| `SesionRoute` | implementado |
| ruta 404 | ausente |
| validacion de permisos por rol | no detectada |

Importante:

- La proteccion frontend mejora UX, pero la seguridad real depende del backend.

## Sanitizacion e inyeccion

### Lo que reduce riesgo

- React escapa texto por defecto.
- No se detecto `dangerouslySetInnerHTML`.
- El contenido textual de slides se renderiza como texto normal en `h2`, `p`, `li`, `textarea` e `input`.

### Riesgos remanentes

- La app renderiza URLs externas en `img` y `backgroundImage`.
- Si el backend no valida bien `resolvedImage` o fondos, podria existir carga de recursos no confiables.
- No se observan politicas de CSP ni controles de origen desde frontend.

## Variables de entorno y secretos

Hallazgo relevante:

- El archivo `.env` esta versionado y contiene valores reales para endpoints y configuracion.

Matiz:

- La clave Supabase detectada es de tipo publicable/anon, por lo que no equivale a un secreto backend.
- Aun asi, versionar `.env` reales sigue siendo mala practica operacional.

## Riesgos en pruebas

Hallazgo critico:

- `cypress/support/commands.js` contiene credenciales hard-coded de acceso.

Impacto:

- exposicion de cuentas de prueba
- riesgo de uso accidental contra entornos compartidos
- acoplamiento fuerte de QA a un usuario especifico

## Riesgos funcionales de seguridad

| Riesgo | Descripcion |
| --- | --- |
| operaciones optimistas sin confirmacion | la UI puede asumir exito antes de terminar el request |
| ausencia de manejo central de sesion expirada | posible estado inconsistente si refresh falla |
| recursos remotos hard-coded | dependencia de terceros y superficie de tracking |
| falta de validaciones fuertes para imagenes | el backend debe cubrir tipo, tamaño y contenido |

## Recomendaciones priorizadas

1. Sacar credenciales hard-coded de Cypress y moverlas a variables de entorno del runner.
2. Dejar de versionar `.env` reales y publicar `env.example`.
3. Centralizar el manejo de refresh fallido con limpieza de estado y redirect controlado.
4. Documentar expectativas de cookies seguras entre frontend y backend.
5. Agregar validacion cliente de imagenes y contratos estrictos para URLs remotas.
6. Considerar CSP y listas permitidas de origen para recursos externos.
