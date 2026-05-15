# Styles

## Stack de estilos

El proyecto usa CSS global tradicional importado desde componentes y paginas. No se detectaron:

- Tailwind CSS
- CSS Modules
- Styled Components
- Material UI
- Chakra UI
- SCSS/Sass

## Archivos de estilos

| Archivo | Alcance principal |
| --- | --- |
| `src/styles/home.css` | landing, navbar y branding base |
| `src/styles/login.css` | login y register |
| `src/styles/auth.css` | forgot/reset password |
| `src/styles/dashboard.css` | dashboard y grid de presentaciones |
| `src/styles/preview.css` | preview, player, editor y canvas |
| `src/styles/addElementPanel.css` | panel lateral del editor |
| `src/styles/slideSidebar.css` | sidebar de slides |
| `src/styles/footer.css` | footer institucional |

Notas:

- `src/index.css` esta vacio.
- `src/App.css` esta vacio.

## Sistema visual detectado

Caracteristicas:

- paleta dominante verde/blanco
- fondos con imagenes remotas alojadas en Supabase
- superficies translucidas con `backdrop-filter`
- layouts basados en `flex` y `grid`
- iconografia `lucide-react`

## Responsive design

Se detectaron `@media` especialmente en:

- `home.css`
- `dashboard.css`
- `footer.css`
- `preview.css`

Patrones de responsive:

- columnas del grid se reducen en dashboard
- wrappers del preview/editor cambian a flujo vertical en anchos pequenos
- slides se escalan con `ResizeObserver` en `ResponsivePreviewSlide` y `ResponsiveEditCanvas`

## Theming

No existe un sistema de theming centralizado.

Hallazgos:

- no hay archivo de tokens
- casi no hay CSS custom properties globales
- las variables CSS se usan de forma puntual para altura del canvas y progreso de upload
- varias URLs visuales estan hard-coded en CSS y componentes

## Estrategias visuales por feature

| Feature | Estrategia |
| --- | --- |
| Landing/Auth | overlays, fondos fotografiados, cards centradas |
| Dashboard | fondo fijo con blur y card de generacion |
| Preview/Editor | foco en canvas 16:9 y paneles laterales |
| Biblioteca de imagenes | cards compactas con acciones overlay |

## Fortalezas

- El editor responsive esta bien resuelto con escalado del canvas en lugar de remaquetar todos los elementos.
- El proyecto mantiene estilos por feature, no un unico archivo gigante.
- La UI tiene una identidad consistente entre home, dashboard, auth y editor.

## Deuda tecnica

| Hallazgo | Impacto |
| --- | --- |
| CSS global sin namespacing fuerte | mayor riesgo de colisiones a futuro |
| ausencia de tokens | dificulta mantener colores, spacing y tipografia |
| imagenes de marca hard-coded | acoplamiento a URLs externas |
| estilos inline en componentes | `confirmToast`, partes del canvas y toolbar mezclan logica y estilo |

## Recomendaciones

1. Crear una capa de design tokens (`:root`) para colores, sombras, radios y spacing.
2. Definir una estrategia clara para assets visuales institucionales.
3. Reducir estilos inline donde sea posible.
4. Mantener el enfoque de archivos por feature, pero con convenciones de nombres mas estrictas.
