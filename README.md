# Herramienta Diapositivas Poli - Frontend

Aplicacion web desarrollada con React y Vite para crear, visualizar, editar y exportar presentaciones a partir de texto o archivos PDF. El proyecto incluye autenticacion de usuarios, gestion de presentaciones, editor visual de diapositivas y exportacion en formatos `PDF` y `PPTX`.

## Descripcion

Este frontend permite:

- Registrar e iniciar sesion de usuarios.
- Generar presentaciones a partir de texto o archivos PDF.
- Visualizar presentaciones creadas.
- Editar diapositivas y elementos dentro de cada presentacion.
- Presentar el contenido en modo reproduccion.
- Exportar las presentaciones a `PDF` y `PPTX`.

La aplicacion consume un backend HTTP disponible en `http://localhost:3000` por defecto y utiliza Supabase para integracion de autenticacion y almacenamiento.

## Tecnologias principales

- React 19
- Vite
- React Router DOM
- Zustand
- Axios
- Supabase
- html2canvas
- jsPDF
- PptxGenJS
- Lucide React
- Sonner

## Dependencias del proyecto

### Dependencias de produccion

- `@supabase/supabase-js`
- `axios`
- `html2canvas`
- `jspdf`
- `lucide-react`
- `pptxgenjs`
- `react`
- `react-colorful`
- `react-dom`
- `react-router-dom`
- `sonner`
- `zustand`

### Dependencias de desarrollo

- `@biomejs/biome`
- `@types/react`
- `@types/react-dom`
- `@vitejs/plugin-react-swc`
- `globals`
- `vite`

## Requisitos previos

Antes de iniciar el proyecto, asegurate de tener instalado:

- Node.js 20 o superior
- npm
- Un backend del proyecto ejecutandose en `http://localhost:3000`

## Variables de entorno

El proyecto usa variables de entorno para conectarse con Supabase. Crea un archivo `.env` en la raiz del proyecto con una estructura similar a esta:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
VITE_SUPABASE_BUCKET=nombre_del_bucket
VITE_BACKEND_URL=backend_url
```

## Instalacion

1. Clona el repositorio.
2. Entra a la carpeta del proyecto.
3. Instala las dependencias:

```bash
npm install
```

## Pasos para iniciar el proyecto

1. Verifica que el backend este corriendo en `http://localhost:3000`.
2. Configura el archivo `.env`.
3. Inicia el servidor de desarrollo:

```bash
npm run dev
```

4. Abre en el navegador la URL que muestre Vite, normalmente:

```text
http://localhost:5173
```

## Scripts disponibles

- `npm run dev`: inicia el proyecto en modo desarrollo.
- `npm run build`: genera la version de produccion en la carpeta `dist`.
- `npm run preview`: sirve localmente la build generada.
- `npm run lint`: ejecuta la validacion de codigo configurada para el proyecto.

## Estructura general

```text
src/
|-- components/   # Componentes reutilizables
|-- hooks/        # Hooks personalizados
|-- pages/        # Vistas principales
|-- services/     # Consumo de API y logica de datos
|-- store/        # Estado global con Zustand
|-- router/       # Proteccion y control de rutas
|-- lib/          # Configuracion de clientes externos
`-- utils/        # Utilidades del proyecto
```

## Colaboradores

- Miguel Angel Mejia Suarez - miguel_mejia82201@elpoli.edu.co
- Juan Jose Estrada Velez - juan_estrada82212@elpoli.edu.co
