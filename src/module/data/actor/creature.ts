import { attributeField } from './helper';

const { SchemaField } = foundry.data.fields;

const defineCreatureModel = () => ({
  // TODO: complete
  attributes: new SchemaField({
    health: attributeField(1),
  }),
});

type CreatureModelSchema = ReturnType<typeof defineCreatureModel>;

export default class CreatureDataModel extends foundry.abstract.TypeDataModel<
  CreatureModelSchema,
  Actor.Implementation
> {
  static defineSchema(): CreatureModelSchema {
    return defineCreatureModel();
  }
}
