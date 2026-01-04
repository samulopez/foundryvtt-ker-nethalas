import { ARMOR, WEIGHT } from '../../constants';

import { defineItemModel } from './item';

import type { ItemModelSchema } from './item';

const { BooleanField, NumberField, StringField } = foundry.data.fields;

const defineArmorModel = () => ({
  broken: new BooleanField({ required: true, initial: false }),
  maxIntegrity: new NumberField({ required: true, integer: true, positive: true, min: 4, initial: 20, max: 20 }),
  currentIntegrity: new NumberField({ required: true, integer: true, positive: true, min: 4, initial: 20, max: 20 }),
  protection: new NumberField({ required: true, integer: true, initial: 0, min: 0 }),
  armorType: new StringField({
    required: true,
    choices: [ARMOR.shield, ARMOR.head, ARMOR.torso, ARMOR.arms, ARMOR.legs],
    initial: ARMOR.shield,
  }),
  decreasePerception: new NumberField({ required: true, integer: true, initial: 0, min: 0 }),
  decreaseManeuverability: new NumberField({ required: true, integer: true, initial: 0, min: 0 }),
  parryBonus: new NumberField({ required: true, integer: true, initial: 0, min: 0 }),
});

type ArmorModelSchema = ReturnType<typeof defineArmorModel> & ItemModelSchema;

type ArmorDataModelType = foundry.abstract.TypeDataModel<ArmorModelSchema, Item.Implementation>;

export default class ArmorDataModel extends foundry.abstract.TypeDataModel<ArmorModelSchema, Item.Implementation> {
  static defineSchema(): ArmorModelSchema {
    return { ...defineItemModel(), ...defineArmorModel() };
  }

  _preUpdate: ArmorDataModelType['_preUpdate'] = async (changed, options, user) => {
    if (
      changed.system?.maxIntegrity &&
      changed.system?.currentIntegrity &&
      changed.system.maxIntegrity < changed.system.currentIntegrity
    ) {
      // eslint-disable-next-line no-param-reassign
      changed.system.currentIntegrity = changed.system.maxIntegrity;
    }
    return super._preUpdate(changed, options, user);
  };

  slots(): number {
    return this.parent.system.weight === WEIGHT.heavy ? 2 : 1;
  }

  canEquipInSlot(slot: string): boolean {
    switch (slot) {
      case 'armor.torso':
        return this.parent.system.armorType === ARMOR.torso;
      case 'armor.arms':
        return this.parent.system.armorType === ARMOR.arms;
      case 'armor.legs':
        return this.parent.system.armorType === ARMOR.legs;
      case 'armor.head':
        return this.parent.system.armorType === ARMOR.head;
      case 'armor.shield':
        return this.parent.system.armorType === ARMOR.shield;
      default:
        return false;
    }
  }
}
