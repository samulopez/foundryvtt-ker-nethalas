const { NumberField, StringField } = foundry.data.fields;

export const defineItemModel = () => ({
  cost: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
  weight: new StringField({
    required: true,
    choices: ['nonEncumbering', 'light', 'normal', 'heavy'],
    initial: 'normal',
  }),
  description: new StringField({ initial: '' }),
  notes: new StringField({ initial: '' }),
  quantity: new NumberField({ required: true, integer: true, min: 1, initial: 1 }),
});

export type ItemModelSchema = ReturnType<typeof defineItemModel>;

export default class ItemDataModel extends foundry.abstract.TypeDataModel<ItemModelSchema, Item.Implementation> {
  static defineSchema(): ItemModelSchema {
    return defineItemModel();
  }

  slots(): number {
    switch (this.weight) {
      case 'nonEncumbering':
        return 0;
      case 'light':
        return 1;
      case 'normal':
        return 1;
      case 'heavy':
        return 2;
      default:
        return 0;
    }
  }
}
