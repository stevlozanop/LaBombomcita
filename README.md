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

Este almacenamiento funciona en local o en un servidor propio (VPS). En un hosting sin disco persistente, como Vercel, habría que cambiarlo por una base de datos (por ejemplo, Supabase).
