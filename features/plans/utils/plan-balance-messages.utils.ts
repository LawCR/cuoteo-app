const MAX_TITLES_IN_MESSAGE = 3;

export function formatExpensesMissingShareMembersMessage(
  titles: readonly string[],
): string {
  if (titles.length === 0) {
    return "Falta asignar al menos una persona a un gasto.";
  }

  if (titles.length === 1) {
    return `Falta asignar al menos una persona al gasto “${titles[0]}”.`;
  }

  const visibleTitles = titles.slice(0, MAX_TITLES_IN_MESSAGE);
  const quoted = visibleTitles.map((title) => `“${title}”`);
  const overflow = titles.length - visibleTitles.length;

  if (quoted.length === 2 && overflow === 0) {
    return `Falta asignar al menos una persona a los gastos ${quoted[0]} y ${quoted[1]}.`;
  }

  if (overflow === 0) {
    const last = quoted[quoted.length - 1];
    const rest = quoted.slice(0, -1).join(", ");
    return `Falta asignar al menos una persona a los gastos ${rest} y ${last}.`;
  }

  return `Falta asignar al menos una persona a los gastos ${quoted.join(", ")} y ${overflow} más.`;
}
