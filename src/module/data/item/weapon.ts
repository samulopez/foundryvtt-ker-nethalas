import ItemDataModel from './item';

import type { ItemModelSchema } from './item';

const { NumberField } = foundry.data.fields;

const defineWeaponModel = () => ({
  // TODO: complete
  damage: new NumberField({ required: true, integer: true, positive: true, initial: 5 }),
});

type WeaponModelSchema = ReturnType<typeof defineWeaponModel> & ItemModelSchema;

export default class WeaponDataModel extends ItemDataModel {
  static defineSchema(): WeaponModelSchema {
    return { ...super.defineSchema(), ...defineWeaponModel() };
  }
}
