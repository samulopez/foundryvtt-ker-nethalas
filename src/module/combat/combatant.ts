import { getCombatantsSharingToken } from './helpers';

export default class KerNethalasCombatant extends Combatant {
  getRuthlessnessFromActor() {
    if (!this.actor) return 0;
    const ruthlessness = (foundry.utils.getProperty(this.actor, 'system.traits.ruthlessness') as {
      value: number;
      active: boolean;
    }) ?? {
      value: 0,
      active: false,
    };
    if (!ruthlessness.active) return 0;
    return Number(ruthlessness.value);
  }

  updateResource() {
    const resource = super.updateResource();

    // updateResource() is only called on token.combatant, so if there are duplicate combatants
    // sharing the same token, we need to update their resource values as well.

    // Grab the superclass prototype (relative to this instance’s class)
    const superProto = Object.getPrototypeOf(Object.getPrototypeOf(this));
    const superUpdateResource = superProto.updateResource;

    getCombatantsSharingToken(this).forEach((c) => {
      if (c.id === this.id) return;
      superUpdateResource.call(c);
    });

    return resource;
  }
}
