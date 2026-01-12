import MonsterDataModel, { defineMonsterModel } from './monster';

type MinionModelSchema = ReturnType<typeof defineMonsterModel>;

export default class MinionDataModel extends MonsterDataModel {
  static defineSchema(): MinionModelSchema {
    return defineMonsterModel();
  }
}
