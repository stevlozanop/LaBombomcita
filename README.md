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

- **Datos iniciales:** están en `lib/seed.json` (carta, horario, datos del local). Puedes editar ese JSON directamente.
- **En tu computadora:** los cambios del panel y los pedidos se guardan en `data/db.json`, que se crea solo y no se sube al repositorio porque contiene datos de clientes.

## Publicar en Vercel

1. En **Settings → Environment Variables** agrega `ADMIN_USER`, `ADMIN_PASSWORD` y `SESSION_SECRET` (un texto aleatorio de al menos 32 caracteres; puedes generarlo con `openssl rand -hex 32`).
2. Vuelve a publicar desde **Deployments → Redeploy**.

Sin nada más, en Vercel los cambios se guardan en un JSON temporal del servidor: funcionan, pero se borran cuando Vercel reinicia el servidor y vuelven los datos de `lib/seed.json`. El panel lo avisa.

Para guardarlos para siempre, conecta **Storage → Create Database → Upstash (Redis)** al proyecto y vuelve a publicar. El código lo detecta solo.
