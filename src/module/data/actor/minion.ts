import { attributeField } from './helper';
import ActorDataModel from './actor';

import type { ActorDataModelSchema } from './actor';

const { NumberField, SchemaField } = foundry.data.fields;

const defineMinionModel = () => ({
  attributes: new SchemaField({
    health: attributeField(1),
    magicResistance: new NumberField({ required: true, integer: true, min: 0, initial: 20, max: 80 }),
  }),
  skills: new SchemaField({
    endurance: new NumberField({ required: true, integer: true, min: 0, initial: 0, max: 100 }),
    combat: new NumberField({ required: true, integer: true, min: 0, initial: 0, max: 100 }),
  }),
  // TODO: damage?
});

type MinionModelSchema = ReturnType<typeof defineMinionModel> & ActorDataModelSchema;

export default class MinionDataModel extends ActorDataModel {
  static defineSchema(): MinionModelSchema {
    return { ...super.defineSchema(), ...defineMinionModel() };
  }
}
