import { WEIGHT } from '../../constants';

import type KerNethalasItem from '../../item/item';

const { BooleanField, NumberField, StringField } = foundry.data.fields;

export const defineItemModel = () => ({
  cost: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
  weight: new StringField({
    required: true,
    choices: [WEIGHT.gem, WEIGHT.nonEncumbering, WEIGHT.light, WEIGHT.normal, WEIGHT.heavy],
    initial: WEIGHT.normal,
  }),
  description: new StringField({ initial: '' }),
  notes: new StringField({ initial: '' }),
  quantity: new NumberField({ required: true, integer: true, min: 1, initial: 1 }),
  equippable: new BooleanField({ required: true, initial: false }),
});

export type ItemModelSchema = ReturnType<typeof defineItemModel>;

type ItemDataModelType = foundry.abstract.TypeDataModel<ItemModelSchema, KerNethalasItem<'item'>>;

export default class ItemDataModel extends foundry.abstract.TypeDataModel<ItemModelSchema, KerNethalasItem<'item'>> {
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

  _preUpdate: ItemDataModelType['_preUpdate'] = async (changed, options, user) => {
    if (changed.system?.weight !== undefined) {
      const { weight } = changed.system;
      switch (weight) {
        case WEIGHT.nonEncumbering:
        case WEIGHT.gem:
          // eslint-disable-next-line no-param-reassign
          changed.system.equippable = false;
          break;
        default:
      }
    }
    return super._preUpdate(changed, options, user);
  };
}
