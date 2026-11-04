// Formatos compartidos (servidor y navegador). Zona horaria fija para que
// ambos muestren lo mismo.
export const TZ = "America/Lima";

export const money = (n: number, currency = "S/") => `${currency} ${n.toFixed(2)}`;

export const dayKey = (d: Date | string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(d));

export const time = (d: string) =>
  new Intl.DateTimeFormat("es-PE", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(new Date(d));

export const dateTime = (d: string) =>
  new Intl.DateTimeFormat("es-PE", {
    timeZone: TZ,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));

export const weekday = (d: Date) =>
  new Intl.DateTimeFormat("es-PE", { timeZone: TZ, weekday: "short" }).format(d);

/** Los últimos n días (el último es hoy). */
export const lastDays = (n: number) =>
  Array.from({ length: n }, (_, i) => new Date(Date.now() - (n - 1 - i) * 86400000));
