import { attributeField } from './helper';

const { SchemaField } = foundry.data.fields;

const defineMonsterModel = () => ({
  // TODO: complete
  attributes: new SchemaField({
    health: attributeField(1),
  }),
});

type MonsterModelSchema = ReturnType<typeof defineMonsterModel>;

export default class MonsterDataModel extends foundry.abstract.TypeDataModel<MonsterModelSchema, Actor.Implementation> {
  static defineSchema(): MonsterModelSchema {
    return defineMonsterModel();
  }
}
