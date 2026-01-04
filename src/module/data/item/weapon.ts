import { SKILLS, WEIGHT } from '../../constants';

import { defineItemModel } from './item';

import type { ItemModelSchema } from './item';

const { BooleanField, NumberField, SchemaField, StringField } = foundry.data.fields;

const defineWeaponModel = () => ({
  speed: new NumberField({ required: true, integer: true, initial: 0 }),
  skill: new StringField({
    required: true,
    choices: [SKILLS.bladedWeapons, SKILLS.bludgeoningWeapons, SKILLS.unarmedCombat, SKILLS.shaftedWeapons],
    initial: SKILLS.unarmedCombat,
  }),
  broken: new BooleanField({ required: true, initial: false }),
  traits: new SchemaField({
    defensive: new BooleanField({ required: true, initial: false }),
    quick: new BooleanField({ required: true, initial: false }),
    parrying: new BooleanField({ required: true, initial: false }),
    powerful: new BooleanField({ required: true, initial: false }),
    simple: new BooleanField({ required: true, initial: false }),
    twoHanded: new BooleanField({ required: true, initial: false }),
    versatile: new BooleanField({ required: true, initial: false }),
  }),
});

type WeaponModelSchema = ReturnType<typeof defineWeaponModel> & ItemModelSchema;

type WeaponDataModelType = foundry.abstract.TypeDataModel<WeaponModelSchema, Item.Implementation>;

export default class WeaponDataModel extends foundry.abstract.TypeDataModel<WeaponModelSchema, Item.Implementation> {
  static defineSchema(): WeaponModelSchema {
    return { ...defineItemModel(), ...defineWeaponModel() };
  }

  _preUpdate: WeaponDataModelType['_preUpdate'] = async (changed, options, user) => {
    if (changed.system?.traits?.twoHanded !== undefined) {
      const { twoHanded } = changed.system.traits;
      if (twoHanded) {
        // eslint-disable-next-line no-param-reassign
        changed.system.weight = WEIGHT.heavy;
      } else {
        // eslint-disable-next-line no-param-reassign
        changed.system.weight = WEIGHT.normal;
      }
    }
    return super._preUpdate(changed, options, user);
  };

  slots(): number {
    return this.parent.system.traits?.twoHanded ? 2 : 1;
  }
}
