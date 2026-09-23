# Roadmap de implementación (MVP)

Orden de **construcción técnica**: cada fase habilita la siguiente. No saltar fases.

La unidad de trabajo es un **ítem**, no la fase. Al terminar: `- [ ]` → `- [x]`.

Cada ítem: nombre, criterio corto, rules/docs de guía. El producto detallado no se copia aquí.

Fuente de verdad: este roadmap, `data-model.md` y `.cursor/rules`.

---

## Fase 0 — Fundaciones del proyecto

Objetivo: env, Prisma, errores y convenciones listas para auth, sin dominio de negocio.

- [x] Validar env con Zod en `@/core/env.ts`
  Criterio: el arranque falla si falta una variable; ningún `process.env` suelto.
  Rules: `.cursor/rules/architecture.mdc` · `.cursor/rules/product-mvp.mdc`

- [x] Inicializar Prisma y cliente en `@/core/db`
  Criterio: `schema.prisma` vacío de dominio (o solo placeholder), `prisma generate` OK, export del client.
  Rules: `.cursor/rules/prisma.mdc` · `.cursor/rules/data-model.mdc` · `data-model.md`

- [x] Clases de error de dominio (`NotFoundError`, `ValidationError`, `UnauthorizedError`)
  Criterio: services pueden lanzarlas; no se usa `Error` genérico en esa capa.
  Rules: `.cursor/rules/errors-testing.mdc` · `.cursor/rules/typescript.mdc`

- [x] Confirmar arquitectura sin tenant
  Criterio: no existe `withTenantContext`; features previstas `profile`, `friends`, `plans`, `expenses`, `settlements`.
  Rules: `.cursor/rules/architecture.mdc`

---



## Fase 1 — Sistema de diseño

Objetivo: tokens teal, shadcn y tema claro/oscuro persistido, sin dominio de negocio.

- [x] Tokens CSS (claro/oscuro) y `next-themes`
  Criterio: `:root` y `.dark` con paleta teal + `success`/`warning`/`destructive`/`info`/`chart-1`…`8`; `class` en `<html>`; default `system`; persistencia `localStorage`. No pintar con `prefers-color-scheme`.
  Rules: `.cursor/rules/ui.mdc` · `.cursor/rules/product-mvp.mdc`

- [x] Inicializar shadcn (New York, zinc) en `/shared`
  Criterio: `components.json`, `cn()`, primitivos base (`Button`, `Input`, `Label`, `Card`, `Badge`, `Separator`, `Sheet`, `Sonner`). Features no duplican primitivos.
  Rules: `.cursor/rules/ui.mdc` · `.cursor/rules/architecture.mdc` · `.cursor/rules/naming.mdc`

- [x] `ThemeToggle` y `MoneyText` en `/shared`
  Criterio: toggle Claro / Oscuro / Sistema; `MoneyText` PEN `es-PE` `tabular-nums` y color `success`/`destructive`. El toggle se monta en `/perfil` (Fase 2).
  Rules: `.cursor/rules/ui.mdc` · `.cursor/rules/money.mdc` · `.cursor/rules/naming.mdc`

---



## Fase 2 — Auth y perfil

Objetivo: sesión Clerk + `User` + onboarding + perfil con CCI opcional.

- [x] Integrar Clerk (email/password y Google) y middleware
  Criterio: login/logout hosted; rutas de app protegidas; auth fuera del group `(app)`.
  Rules: `.cursor/rules/auth-onboarding.mdc` · `.cursor/rules/app-routing.mdc`

- [x] Schema `User` + migración
  Criterio: campos y uniques de `data-model.md` (`clerkUserId`, `usernameNormalized`, `phone`).
  Rules: `data-model.md` · `.cursor/rules/data-model.mdc` · `.cursor/rules/prisma.mdc`

- [x] Onboarding obligatorio (nombre, username, teléfono)
  Criterio: sin perfil completo no se entra a `/dashboard`; username y teléfono únicos.
  Rules: `.cursor/rules/auth-onboarding.mdc` · `.cursor/rules/naming.mdc`

- [x] Página `/perfil` (CCI/banco opcionales)
  Criterio: se edita cobro (banco, CCI, número de cuenta); sin CCI no hay acción de copiar CCI; sin cuenta no hay acción de copiar cuenta; sin QR. Incluye toggle de tema (Claro / Oscuro / Sistema).
  Rules: `.cursor/rules/auth-onboarding.mdc` · `.cursor/rules/product-mvp.mdc` · `.cursor/rules/app-routing.mdc` · `.cursor/rules/ui.mdc`

---



## Fase 3 — Shell de la app

Objetivo: rutas y layout autenticado; pantallas placeholder.

- [x] Groups de rutas y redirects de `/`
  Criterio: `/` reservada; logueado+onboarded → `/dashboard`; sin sesión → login Clerk.
  Rules: `.cursor/rules/app-routing.mdc`

- [x] Layout con nav Planes (subítems vacíos)
  Criterio: navega a `/planes`; desktop sidebar fija; mobile hamburger + `Sheet`; UI en español.
  Rules: `.cursor/rules/app-routing.mdc` · `.cursor/rules/architecture.mdc` · `.cursor/rules/product-mvp.mdc` · `.cursor/rules/ui.mdc`

- [x] Placeholders `/dashboard`, `/planes`, `/amigos`, `/amigos/solicitudes`
  Criterio: las cuatro rutas renderizan dentro del shell autenticado.
  Rules: `.cursor/rules/app-routing.mdc` · `.cursor/rules/naming.mdc`

---



## Fase 4 — Amigos

Objetivo: buscar, solicitar, aceptar/rechazar, listar; email Resend.

- [x] Schema `FriendRequest` y `Friendship` + migración
  Criterio: uniques y estados según `data-model.md`.
  Rules: `data-model.md` · `.cursor/rules/data-model.mdc` · `.cursor/rules/prisma.mdc`

- [x] Enviar solicitud por username o email exacto
  Criterio: toast si no existe; bloqueo si pending A↔B o ya amigos.
  Rules: `.cursor/rules/friends.mdc` · `.cursor/rules/errors-testing.mdc`

- [ ] Bandeja `/amigos/solicitudes` (enviadas y recibidas)
  Criterio: aceptar crea `Friendship`; rechazar permite reenviar después.
  Rules: `.cursor/rules/friends.mdc` · `.cursor/rules/app-routing.mdc`

- [ ] Email Resend al recibir solicitud
  Criterio: el correo incluye link a `/amigos/solicitudes`.
  Rules: `.cursor/rules/friends.mdc` · `.cursor/rules/architecture.mdc` · `.cursor/rules/product-mvp.mdc`

- [ ] Listado `/amigos` y eliminar amistad
  Criterio: unfriend no altera planes; se puede volver a enviar solicitud.
  Rules: `.cursor/rules/friends.mdc`

---



## Fase 5 — Planes e integrantes

Objetivo: CRUD de plan en Activo, miembros amigos/fantasmas, transiciones de fase sin gastos ni pagos reales.

- [ ] Schema `Plan` y `PlanMember` + migración
  Criterio: `phase`, `icon` como categoría, fantasma vs `userId`, uniques de nombre fantasma.
  Rules: `data-model.md` · `.cursor/rules/data-model.mdc` · `.cursor/rules/prisma.mdc` · `.cursor/rules/expenses.mdc`

- [ ] Crear/editar plan (nombre, ícono) y listar los del usuario
  Criterio: creador persistido; ícono del set de categorías; solo fase Activo edita metadatos.
  Rules: `.cursor/rules/plan-permissions.mdc` · `.cursor/rules/expenses.mdc` · `.cursor/rules/naming.mdc`

- [ ] Agregar amigo al plan (alta inmediata)
  Criterio: solo amigos; aparece en el dashboard del agregado; no se agrega un no-amigo.
  Rules: `.cursor/rules/friends.mdc` · `.cursor/rules/plan-permissions.mdc`

- [ ] Crear fantasma (nombre único por plan)
  Criterio: UI “Invitado”; conflicto de nombre (case-insensitive) rechazado.
  Rules: `.cursor/rules/expenses.mdc` · `.cursor/rules/plan-permissions.mdc` · `data-model.md`

- [ ] UserPlus entre co-miembros registrados no amigos
  Criterio: dispara el mismo flujo de solicitud; fantasmas sin ícono.
  Rules: `.cursor/rules/friends.mdc`

- [ ] Salir / quitar miembro (sin gastos aún)
  Criterio: creador no sale; quitar solo creador; se borra el `PlanMember`.
  Rules: `.cursor/rules/plan-permissions.mdc`

- [ ] Transición Activo → Balance (guardas de miembros; gastos llegan en Fase 6)
  Criterio: cualquier registrado; bloqueado con < 2 miembros; modal: no se editarán gastos ni integrantes hasta volver.
  Rules: `.cursor/rules/plan-permissions.mdc`

- [ ] Volver a Activo con 0 pagos y Completado readonly (cáscara)
  Criterio: 0 pagos → cualquiera; Completado no muta. Wipe de pagos y Completar plan se cierran en Fase 7.
  Rules: `.cursor/rules/plan-permissions.mdc`

- [ ] Borrar plan en cascada (creador, cualquier fase)
  Criterio: desaparecen members y el plan; acción en `/planes`.
  Rules: `.cursor/rules/plan-permissions.mdc` · `.cursor/rules/app-routing.mdc` · `.cursor/rules/prisma.mdc`

---



## Fase 6 — Gastos

Objetivo: split igualitario, exclusión, tardío, gráfica; habilita la guarda “≥ 1 gasto”.

- [ ] Schema `Expense` y `ExpenseShare` + migración
  Criterio: pagador, shares con `shareAmount`, suma = monto.
  Rules: `data-model.md` · `.cursor/rules/data-model.mdc` · `.cursor/rules/prisma.mdc`

- [ ] Util de split + redondeo (mayor resto) con tests
  Criterio: tests unitarios; suma de cuotas = monto; empate por `id`.
  Rules: `.cursor/rules/money.mdc` · `.cursor/rules/errors-testing.mdc` · `.cursor/rules/typescript.mdc`

- [ ] CRUD de gasto en Activo
  Criterio: ≥ 2 miembros; pagador = todos los integrantes default sesión; exclusión; 8 categorías; sin “Yo”.
  Rules: `.cursor/rules/expenses.mdc` · `.cursor/rules/plan-permissions.mdc` · `.cursor/rules/naming.mdc`

- [ ] Recálculo al editar/borrar gasto
  Criterio: shares coherentes; solo fase Activo.
  Rules: `.cursor/rules/money.mdc` · `.cursor/rules/plan-permissions.mdc`

- [ ] Integrante tardío opciones A y B
  Criterio: A no toca gastos viejos; B entra en todos (respetando excluidos ajenos) y recalcula.
  Rules: `.cursor/rules/plan-permissions.mdc` · `.cursor/rules/expenses.mdc` · `.cursor/rules/money.mdc`

- [ ] Salir/quitar con gastos
  Criterio: se borran gastos que pagó; unsplit + recálculo en los demás; se borra el miembro.
  Rules: `.cursor/rules/plan-permissions.mdc` · `.cursor/rules/money.mdc`

- [ ] Total y gráfica de dona por integrante; CTA Balance exige ≥ 1 gasto
  Criterio: dona del reparto; botón bloqueado con 0 gastos; ≥ 2 miembros.
  Rules: `.cursor/rules/plan-permissions.mdc` · `.cursor/rules/app-routing.mdc` · `.cursor/rules/expenses.mdc`

---



## Fase 7 — Liquidación

Objetivo: payments, tope, greedy, anular, cierre de creador.

- [ ] Schema `Payment` + migración
  Criterio: `from`/`to`/`amount`/`recordedBy`/`kind` según `data-model.md`.
  Rules: `data-model.md` · `.cursor/rules/data-model.mdc` · `.cursor/rules/prisma.mdc`

- [ ] Cálculo de saldos restantes + tests
  Criterio: neto gastos − payments; clasifica deudor/acreedor/cero.
  Rules: `.cursor/rules/money.mdc` · `.cursor/rules/errors-testing.mdc`

- [ ] Greedy de transferencias mínimas + tests
  Criterio: sobre restantes; empate = primera solución; se recalcula tras cada pago.
  Rules: `.cursor/rules/money.mdc` · `.cursor/rules/errors-testing.mdc`

- [ ] Sheet registrar pago (parciales y tope)
  Criterio: botón en acreedor; CTA Registrar; select solo deudores ≠ acreedor; default sesión si es deudor; tope `min`; badges verde/rojo.
  Rules: `.cursor/rules/money.mdc` · `.cursor/rules/plan-permissions.mdc` · `.cursor/rules/auth-onboarding.mdc`

- [ ] Anular pago
  Criterio: cualquier registrado en Balance; prohibido en Completado.
  Rules: `.cursor/rules/plan-permissions.mdc` · `.cursor/rules/money.mdc`

- [ ] Completar pagos (solo creador)
  Criterio: asientos `MANUAL_CLOSE` en historial; saldos 0; el plan sigue en Balance; destacar si hay un solo registrado.
  Rules: `.cursor/rules/plan-permissions.mdc` · `.cursor/rules/money.mdc` · `data-model.md`

- [ ] Completar plan y wipe de pagos para volver a Activo
  Criterio: Completar plan solo creador con saldos 0 → Completado. Wipe: solo creador, borra payments, vuelve a Activo.
  Rules: `.cursor/rules/plan-permissions.mdc`

- [ ] Historial de pagos y gastos readonly en Balance/Completado
  Criterio: gastos en vista secundaria; Completado sin mutaciones.
  Rules: `.cursor/rules/plan-permissions.mdc` · `.cursor/rules/expenses.mdc`

---



## Fase 8 — Cierre de superficie MVP

Objetivo: dashboard real, listado `/planes`, WhatsApp, nav con planes vivos.

- [ ] Dashboard: KPIs, 10 amigos, planes Activo/Balance, CTA crear
  Criterio: saldo neto del usuario en planes Balance; badge de solicitudes.
  Rules: `.cursor/rules/app-routing.mdc` · `.cursor/rules/friends.mdc` · `.cursor/rules/money.mdc`

- [ ] Nav: subítems de planes Activo y Balance
  Criterio: Completado no aparece; clic va a `/planes/[id]`. Mismos datos en sidebar desktop y Sheet mobile.
  Rules: `.cursor/rules/app-routing.mdc` · `.cursor/rules/ui.mdc`

- [ ] `/planes`: filtros fase, nombre, rango `createdAt`; ver y eliminar
  Criterio: eliminar solo creador, cualquier fase, cascade.
  Rules: `.cursor/rules/app-routing.mdc` · `.cursor/rules/plan-permissions.mdc`

- [ ] Compartir WhatsApp (texto de balance + URL del plan)
  Criterio: Balance y Completado; `wa.me` o Share API; el link exige login (fantasmas no entran).
  Rules: `.cursor/rules/app-routing.mdc` · `.cursor/rules/money.mdc` · `.cursor/rules/product-mvp.mdc`

