# Modelo de datos (Prisma)

Especificación de persistencia del MVP. El schema en `prisma/schema.prisma` debe coincidir con este documento. Código en inglés; este archivo en español.

Convenciones: modelos `PascalCase` singular; campos `camelCase`; columnas `snake_case` con `@map`. Todo modelo: `id` (cuid), `createdAt`, `updatedAt`. Montos: `Decimal(12, 2)`. Fechas en UTC en DB; presentación `America/Lima`.

Writes multi-tabla con `$transaction`.

---

## Enums

```prisma
enum PlanPhase {
  ACTIVE
  BALANCE
  COMPLETED
}

enum ExpenseCategory {
  FOOD
  TRANSPORT
  LODGING
  ENTERTAINMENT
  SHOPPING
  HEALTH
  SERVICES
  OTHER
}

enum FriendRequestStatus {
  PENDING
  REJECTED
}

enum PaymentKind {
  TRANSFER
  MANUAL_CLOSE
}
```

Íconos de plan: el mismo valor que `ExpenseCategory` (un set).

---

## User

Perfil Cuoteo ligado a Clerk.

| Campo | Tipo | Notas |
| :--- | :--- | :--- |
| `id` | String | PK |
| `clerkUserId` | String | Unique |
| `email` | String | Email Clerk; unique |
| `name` | String | Nombre para mostrar |
| `username` | String | Unique; comparar case-insensitive (`usernameNormalized`) |
| `usernameNormalized` | String | Unique; `username.trim().toLowerCase()` |
| `phone` | String | Unique; E.164 `+51` + 9 dígitos |
| `bankName` | String? | Opcional |
| `cci` | String? | Opcional; 20 dígitos si está presente |
| `accountNumber` | String? | Opcional; 8–20 dígitos si está presente |
| `createdAt` / `updatedAt` | DateTime | |

Onboarding incompleto = no existe fila `User` o faltan `name` / `username` / `phone` (el gate no deja pasar al dashboard).

---

## FriendRequest

| Campo | Tipo | Notas |
| :--- | :--- | :--- |
| `fromUserId` | String | FK User |
| `toUserId` | String | FK User; ≠ `fromUserId` |
| `status` | FriendRequestStatus | `PENDING` o `REJECTED` |

Unique `(fromUserId, toUserId)`. No puede existir pending en **ningún** sentido a la vez (validar en service: ni A→B ni B→A pending). Aceptar: crear `Friendship` y borrar o archivar el request (recomendado: borrar requests entre el par). Al borrar `User`: `onDelete: Cascade` (solicitudes enviadas y recibidas).

---

## Friendship

Par no dirigido.

| Campo | Tipo | Notas |
| :--- | :--- | :--- |
| `userLowId` | String | FK User; el `id` menor lexicográfico |
| `userHighId` | String | FK User; el `id` mayor |

Unique `(userLowId, userHighId)`. Unfriend: borrar esta fila. No toca `PlanMember`. Al borrar `User`: `onDelete: Cascade` (amistades en ambos lados).

---

## Plan

| Campo | Tipo | Notas |
| :--- | :--- | :--- |
| `name` | String | |
| `icon` | ExpenseCategory | Mismo set que categorías |
| `phase` | PlanPhase | Default `ACTIVE` |
| `creatorUserId` | String | FK User; no se sale del plan |

Cascade al borrar: members, expenses, shares, payments.

---

## PlanMember

Registrado o fantasma.

| Campo | Tipo | Notas |
| :--- | :--- | :--- |
| `planId` | String | FK Plan |
| `userId` | String? | FK User; null = fantasma |
| `ghostName` | String? | Solo fantasma |
| `ghostNameNormalized` | String? | `trim.toLowerCase()` |

Reglas:

- Registrado: `userId` obligatorio; `ghostName` y `ghostNameNormalized` null. Unique `(planId, userId)`.
- Fantasma: `userId` null; `ghostName` y `ghostNameNormalized` obligatorios. Unique `(planId, ghostNameNormalized)`.
- Alta de registrado solo si existe `Friendship` con el creador o con quien agrega (amigo).

Al quitar/salir (solo `ACTIVE`): ver rule `plan-permissions.mdc` (borrar gastos pagados por él; unsplit + recálculo; borrar este row).

---

## Expense

Solo se crea/edita/borra en `Plan.phase = ACTIVE`.

| Campo | Tipo | Notas |
| :--- | :--- | :--- |
| `planId` | String | FK Plan |
| `title` | String | Concepto |
| `amount` | Decimal | PEN, > 0 |
| `category` | ExpenseCategory | |
| `paidByMemberId` | String | FK PlanMember del mismo plan |

`createdAt` = fecha del gasto. Sin comprobante. Requiere ≥ 2 `PlanMember` en el plan para crear.

---

## ExpenseShare

Quién participa del split (tras exclusión y recálculos).

| Campo | Tipo | Notas |
| :--- | :--- | :--- |
| `expenseId` | String | FK Expense |
| `memberId` | String | FK PlanMember |
| `shareAmount` | Decimal | Cuota ya redondeada |

Unique `(expenseId, memberId)`. N ≥ 1. Suma de `shareAmount` = `Expense.amount`.

Tardío opción B: insertar share en **todos** los expenses del plan y recalcular `shareAmount`. Opción A: no tocar expenses existentes.

---

## Payment

No muta expenses. Solo en fase `BALANCE` (anular/crear). Completado: inmutables.

| Campo | Tipo | Notas |
| :--- | :--- | :--- |
| `planId` | String | FK Plan |
| `fromMemberId` | String | Deudor; FK PlanMember |
| `toMemberId` | String | Acreedor; ≠ `fromMemberId` |
| `amount` | Decimal | `0 < amount ≤ min(\|restante from\|, \|restante to\|)` |
| `recordedByUserId` | String | FK User (sesión) |
| `kind` | PaymentKind | `TRANSFER` o `MANUAL_CLOSE` |

Saldo restante de un miembro = (suma `amount` donde pagó) − (suma `shareAmount`) − (suma payments `from`) + (suma payments `to`).

`MANUAL_CLOSE`: asientos de Completar pagos (creador); historial visible.

---

## Relaciones (resumen)

```
User 1—n Plan (creator)
User 1—n PlanMember (registrados)
User 1—n Payment (recordedBy)
User n—n User (Friendship, FriendRequest)
Plan 1—n PlanMember 1—n ExpenseShare
Plan 1—n Expense (paidBy PlanMember)
Plan 1—n Payment (from/to PlanMember)
```

---

## Índices útiles

- `Plan`: `creatorUserId`, `phase`, `createdAt`
- `PlanMember`: `planId`, `userId`
- `Expense`: `planId`
- `Payment`: `planId`
- `FriendRequest`: `toUserId` + `status` (bandeja recibidas)
