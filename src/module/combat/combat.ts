import { getGame } from '../helpers';
import { ID, KNSettings } from '../constants';

import { duplicateCombatant, getCombatantsSharingToken } from './helpers';

import type KerNethalasCombatant from './combatant';

export default class KerNethalasCombat extends Combat {
  async startCombat() {
    // Duplicates monsters with ruthlessness > 0.
    const duplicateMonstersOnStart = getGame().settings.get(ID, KNSettings.duplicateMonstersOnStart);
    if (!duplicateMonstersOnStart) {
      return super.startCombat();
    }

    this.getEmbeddedCollection('combatants').forEach(async (combatant: KerNethalasCombatant) => {
      const ruthlessnessValue = combatant.getRuthlessnessFromActor();
      if (ruthlessnessValue > 0) {
        // Duplicate combatant based on ruthlessness value
        const duplicates = getCombatantsSharingToken(combatant);
        const copyQty = ruthlessnessValue + 1 - duplicates.length;
        if (copyQty > 0) await duplicateCombatant(combatant, copyQty);
      }
    });

    return super.startCombat();
  }

  static async createCombatant(combatant: KerNethalasCombatant) {
    if (!getGame().user?.isGM) return;

    const duplicateMonstersOnStart = getGame().settings.get(ID, KNSettings.duplicateMonstersOnStart);
    if (!duplicateMonstersOnStart) {
      return;
    }

    // This handles cases where a combatant is added after combat started
    const {
      parent: { started },
    } = combatant;
    const ruthlessnessValue = combatant.getRuthlessnessFromActor();
    if (started && ruthlessnessValue > 0) {
      const duplicates = getCombatantsSharingToken(combatant);
      const copyQty = ruthlessnessValue + 1 - duplicates.length;
      if (copyQty > 0) await duplicateCombatant(combatant, copyQty);
    }
  }
}
