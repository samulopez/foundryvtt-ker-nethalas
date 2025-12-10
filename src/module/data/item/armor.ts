import ItemDataModel from './item';

import type { ItemModelSchema } from './item';

const { NumberField } = foundry.data.fields;

const defineArmorModel = () => ({
  // TODO: complete
  armor: new NumberField({ required: true, integer: true, positive: true, initial: 5 }),
});

type ArmorModelSchema = ReturnType<typeof defineArmorModel> & ItemModelSchema;

export default class ArmorDataModel extends ItemDataModel {
  static defineSchema(): ArmorModelSchema {
    return { ...super.defineSchema(), ...defineArmorModel() };
  }
}
