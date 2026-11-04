// Datos iniciales del local. Se editan en lib/seed.json.
// Se usan la primera vez que arranca la web (para crear la base de datos)
// y, en Vercel sin Redis, cada vez que el servidor se reinicia.

import type { Db } from "./types";
import data from "./seed.json";

export const seed = data as Db;
