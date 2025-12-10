import { attributeField } from './helper';

const { SchemaField } = foundry.data.fields;

const defineActorModel = () => ({
  attributes: new SchemaField({
    health: attributeField(1),
  }),
});

export type ActorDataModelSchema = ReturnType<typeof defineActorModel>;

export default class ActorDataModel extends foundry.abstract.TypeDataModel<ActorDataModelSchema, Actor.Implementation> {
  static defineSchema(): ActorDataModelSchema {
    return defineActorModel();
  }
}
