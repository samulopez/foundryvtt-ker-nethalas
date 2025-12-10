const { NumberField } = foundry.data.fields;

const defineItemModel = () => ({
  // TODO: complete
  price: new NumberField({ required: true, integer: true, min: 0, initial: 20 }),
});

export type ItemModelSchema = ReturnType<typeof defineItemModel>;

export default class ItemDataModel extends foundry.abstract.TypeDataModel<ItemModelSchema, Item.Implementation> {
  static defineSchema(): ItemModelSchema {
    return defineItemModel();
  }
}
