import ActorDataModel from './actor';

import type { ActorDataModelSchema } from './actor';

export default class NPCDataModel extends ActorDataModel {
  static defineSchema(): ActorDataModelSchema {
    return super.defineSchema();
  }
}
