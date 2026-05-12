# Realtime And Sockets

## Estado actual

No se detecto integracion con:

- `Socket.IO`
- `WebSocket`
- `EventSource`
- cualquier otro canal realtime

La busqueda en el repositorio no encontro clientes, providers, hooks ni servicios relacionados con sockets.

## Implicaciones

Todo el frontend opera bajo modelo request/response:

- autenticacion por HTTP
- carga y guardado de presentaciones por HTTP
- uploads de archivos por HTTP
- reorder y actualizacion de slides por HTTP
- exportacion completamente local en el navegador

## Sincronizacion de UI

La UI se sincroniza mediante:

- recarga puntual desde backend (`getPresentation`, `getPresentations`, `getUserImages`)
- actualizacion optimista o local tras operaciones del usuario
- store temporal en `presentationStore`

No existe colaboracion multiusuario en tiempo real ni invalidacion reactiva de datos.

## Riesgos funcionales derivados de la ausencia de realtime

| Riesgo | Descripcion |
| --- | --- |
| edicion concurrente | dos usuarios podrian sobrescribirse sin enterarse |
| datos stale | la app no recibe eventos de cambios remotos |
| biblioteca desincronizada | imagenes o presentaciones creadas en otro cliente solo aparecen tras recarga o nuevo fetch |

## Si el proyecto necesitara realtime

Recomendaciones de entrada:

1. Definir primero los eventos de dominio: presentacion actualizada, slide creada, slide reordenada, imagen subida.
2. Separar estado remoto del estado de UI para evitar mezclar sincronizacion con controles locales del editor.
3. Resolver versionado o locking de elementos antes de habilitar coedicion.
