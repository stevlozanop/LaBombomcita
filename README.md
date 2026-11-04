# La Bomboncita — Cevichería

Página web de la cevichería La Bomboncita, con carta, pedidos por WhatsApp y un panel de administración.

Hecha con Next.js 16, Tailwind CSS 4 y HeroUI v3.

## Qué incluye

- **Web pública (`/`)**: portada con fotos del local, carta por categorías, horario y ubicación.
- **Pedidos (`/pedir`)**: el cliente arma su pedido, se guarda en el panel y se envía por WhatsApp.
- **Panel (`/superadmindev`)**: pedidos en vivo, carta y precios, horario, datos del local, registro de actividad, respaldo y modo oscuro.

## Cómo ejecutarlo

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` como `.env.local` y pon tu usuario, contraseña y una clave secreta larga para el panel.

3. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   La web queda en http://localhost:3000 y el panel en http://localhost:3000/superadmindev.

## Datos

Los datos (carta, horario, pedidos) se guardan en `data/db.json`. Ese archivo se crea solo la primera vez a partir de `lib/seed.ts` y no se sube al repositorio porque contiene datos de clientes.

## Publicar en Vercel

En Vercel no se puede escribir en disco, así que los datos se guardan en **Upstash Redis**:

1. En el proyecto de Vercel: **Storage → Create Database → Upstash (Redis)** y conéctalo al proyecto. Vercel agrega solo las variables `KV_REST_API_URL` y `KV_REST_API_TOKEN`.
2. En **Settings → Environment Variables** agrega `ADMIN_USER`, `ADMIN_PASSWORD` y `SESSION_SECRET` (un texto aleatorio de al menos 32 caracteres; puedes generarlo con `openssl rand -hex 32`).
3. Vuelve a publicar desde **Deployments → Redeploy**.

La primera vez la base de datos se llena con los datos de `lib/seed.ts`. Si Redis no está conectado, la web se ve con esos datos pero el panel avisa que no se pueden guardar cambios.
