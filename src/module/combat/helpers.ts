export async function duplicateCombatant(combatant: Combatant, qty = 1) {
  const c = combatant.toObject();
  const combatants = Array.from<typeof c>({ length: qty }).fill(c);
  return combatant.parent.createEmbeddedDocuments('Combatant', combatants);
}

export function getCombatantsSharingToken(combatant: Combatant) {
  const combatantTokenIds = combatant.actor?.getActiveTokens(false, true).map((t) => t.id) ?? [];
  return combatant.parent.combatants.filter((c) => combatantTokenIds.includes(c.tokenId));
}
