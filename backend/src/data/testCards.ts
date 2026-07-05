// ── Pasarela de pago SIMULADA ─────────────────────────────────────────────────
// No hay integración real. Solo estas 3 tarjetas se consideran válidas.
// Al "procesar" cualquiera de ellas, el usuario queda suscrito al plan elegido.

export interface TestCard {
  number: string;   // número normalizado (sin espacios)
  brand: string;
  label: string;    // formato visible con espacios
}

export const TEST_CARDS: TestCard[] = [
  { number: '4242424242424242', brand: 'Visa',       label: '4242 4242 4242 4242' },
  { number: '5555555555554444', brand: 'Mastercard', label: '5555 5555 5555 4444' },
  { number: '378282246310005',  brand: 'Amex',        label: '3782 822463 10005'  },
];

/** Normaliza un número de tarjeta quitando espacios y guiones. */
export function normalizeCard(input: string): string {
  return (input ?? '').replace(/[\s-]/g, '');
}

/** Devuelve true solo si el número coincide con una de las tarjetas de prueba. */
export function isValidTestCard(input: string): boolean {
  const n = normalizeCard(input);
  return TEST_CARDS.some((c) => c.number === n);
}

/** Últimos 4 dígitos de un número de tarjeta (para mostrar en admin). */
export function cardLast4(input: string): string {
  const n = normalizeCard(input);
  return n.slice(-4);
}
