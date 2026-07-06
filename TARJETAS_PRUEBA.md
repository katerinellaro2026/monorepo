# Tarjetas de prueba — Pasarela simulada

La pasarela de pago es una **simulación** (no hay integración real ni cobro).
Solo estas 3 tarjetas se consideran válidas al suscribirse a un plan. Cualquier
otro número es rechazado con `HTTP 402 — Tarjeta no válida`.

| Marca       | Número                | Formato sin espacios |
|-------------|-----------------------|----------------------|
| Visa        | `4242 4242 4242 4242` | `4242424242424242`   |
| Mastercard  | `5555 5555 5555 4444` | `5555555555554444`   |
| Amex        | `3782 822463 10005`   | `378282246310005`    |

- **Vencimiento y CVV:** cualquier valor (ej. `12/28` y `123`). No se validan.
- **Nombre en la tarjeta:** cualquier texto.

## Dónde está definido en el código

- **Backend (fuente de verdad):** [backend/src/data/testCards.ts](backend/src/data/testCards.ts)
  - `TEST_CARDS`, `isValidTestCard()`, `cardLast4()`
- **Validación al suscribir:** [backend/src/routes/subscriptions.ts](backend/src/routes/subscriptions.ts) → `POST /api/subscriptions/subscribe`

Para cambiar las tarjetas válidas, edita `TEST_CARDS` en `backend/src/data/testCards.ts`.
