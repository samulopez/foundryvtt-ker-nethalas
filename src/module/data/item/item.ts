import { WEIGHT } from '../../constants';

const { BooleanField, NumberField, StringField } = foundry.data.fields;

export const defineItemModel = () => ({
  cost: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
  weight: new StringField({
    required: true,
    choices: [WEIGHT.nonEncumbering, WEIGHT.light, WEIGHT.normal, WEIGHT.heavy],
    initial: WEIGHT.normal,
  }),
  description: new StringField({ initial: '' }),
  notes: new StringField({ initial: '' }),
  quantity: new NumberField({ required: true, integer: true, min: 1, initial: 1 }),
  equippable: new BooleanField({ required: true, initial: false }),
});

export type ItemModelSchema = ReturnType<typeof defineItemModel>;

export default class ItemDataModel extends foundry.abstract.TypeDataModel<ItemModelSchema, Item.Implementation> {
  static defineSchema(): ItemModelSchema {
    return defineItemModel();
  }

  slots(): number {
    switch (this.parent.system.weight) {
      case WEIGHT.nonEncumbering:
        return 0;
      case WEIGHT.light:
        return 1;
      case WEIGHT.normal:
        return 1;
      case WEIGHT.heavy:
        return 2;
      default:
        return 0;
    }
  }
}
