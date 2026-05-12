# Contributing

## Objetivo

Esta guia resume como extender el frontend manteniendo la estructura actual y reduciendo deuda tecnica adicional.

## Requisitos para desarrollo

```bash
npm install
npm run dev
```

Si se requieren pruebas E2E:

```bash
npx cypress open
```

o

```bash
npx cypress run
```

## Convenciones observadas

| Area | Convencion actual |
| --- | --- |
| Componentes | archivos `PascalCase.jsx` |
| Hooks | archivos `useXxx.jsx` |
| Servicios | archivos `camelCaseService.js` |
| Stores | archivos `camelCaseStore.js` |
| Utilidades | archivos `camelCase.js` o `.jsx` |
| Estilos | CSS global por feature |

## Herramientas de calidad

Hallazgos:

- existe `biome.json` configurado
- el script `lint` en `package.json` apunta a `eslint .`, pero `eslint` no esta instalado

Recomendacion inmediata:

- decidir entre adoptar `Biome` como herramienta oficial o reinstalar/configurar `ESLint`

## Como agregar una nueva pagina

1. Crear el archivo en `src/pages/`.
2. Registrar la ruta en `src/App.jsx`.
3. Si requiere control de acceso, envolverla con `ProtectedRoute` o `SesionRoute`.
4. Crear CSS por feature solo si la pantalla lo necesita.

## Como agregar un nuevo servicio HTTP

1. Crear o extender un archivo en `src/services/`.
2. Reutilizar `src/api/axios.js`.
3. Mantener fuera de componentes la logica de endpoints y payloads.
4. Normalizar el manejo de errores y mensajes.

## Como agregar logica compleja

Preferir:

- hooks dedicados en `src/hooks/` para orquestacion
- componentes centrados en renderizado y eventos
- utilidades en `src/utils/` para reglas puras

Evitar:

- meter logica de red directamente en componentes visuales
- expandir aun mas `usePresentationEditor()` sin dividir responsabilidades

## Recomendaciones de estructura

| Si agregas... | Ubicalo en... |
| --- | --- |
| pantalla completa | `pages/` |
| widget reutilizable | `components/` |
| sincronizacion y side effects | `hooks/` |
| endpoint o integracion externa | `services/` o `lib/` |
| validacion o helper puro | `utils/` |

## Buenas practicas sugeridas

1. No introducir nuevas dependencias de estado global sin necesidad.
2. Reutilizar el cliente Axios compartido.
3. Mantener compatibilidad con el canvas 16:9 del editor y preview.
4. Documentar contratos de `slide`, `element`, `background` y `resolvedImage`.
5. Agregar pruebas E2E o al menos casos manuales cuando se toque auth, editor, exportacion o uploads.

## Checklist para nuevos cambios

- La ruta nueva esta protegida si corresponde.
- El servicio nuevo usa `api/axios.js`.
- Los errores se muestran al usuario de forma consistente.
- No se agregaron credenciales hard-coded.
- El cambio no rompe el flujo `dashboard -> preview -> edit`.
- Se considero comportamiento responsive.

## Mejoras de mantenimiento recomendadas

1. Crear `env.example`.
2. Agregar scripts npm para Cypress y calidad.
3. Introducir una convencion de tipos de dominio aunque el proyecto siga en JavaScript.
4. Reducir codigo legacy no utilizado.
