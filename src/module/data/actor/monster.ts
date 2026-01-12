import { HIT_LOCATIONS } from '../../constants';

import { attributeField, sortingField } from './helper';

import type KerNethalasActor from '../../actor/actor';

const { ArrayField, BooleanField, NumberField, SchemaField, StringField } = foundry.data.fields;

export const defineMonsterModel = () => ({
  attributes: new SchemaField({
    body: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
    mind: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
    combatSkill: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
    endurance: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
    health: attributeField(1),
    magicResistance: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
  }),
  type: new SchemaField({
    animal: new BooleanField({ initial: false }),
    astral: new BooleanField({ initial: false }),
    construct: new BooleanField({ initial: false }),
    demon: new BooleanField({ initial: false }),
    elemental: new BooleanField({ initial: false }),
    humanoid: new BooleanField({ initial: false }),
    plant: new BooleanField({ initial: false }),
    undead: new BooleanField({ initial: false }),
  }),
  hitLocation: new StringField({
    choices: [
      HIT_LOCATIONS.none,
      HIT_LOCATIONS.arachnid,
      HIT_LOCATIONS.humanoid,
      HIT_LOCATIONS.insectoid,
      HIT_LOCATIONS.quadruped,
      HIT_LOCATIONS.serpentoid,
      HIT_LOCATIONS.winged,
    ],
    initial: HIT_LOCATIONS.none,
  }),
  weakSpot: new StringField({ initial: '' }),
  traits: new SchemaField({
    alert: new BooleanField({ initial: false }),
    frightening: new BooleanField({ initial: false }),
    horrifying: new BooleanField({ initial: false }),
    pack: new BooleanField({ initial: false }),
    penetrating: new SchemaField({
      value: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      active: new BooleanField({ initial: false }),
    }),
    ruthlessness: new SchemaField({
      value: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      active: new BooleanField({ initial: false }),
    }),
    savage: new BooleanField({ initial: false }),
    swift: new BooleanField({ initial: false }),
    venomous: new BooleanField({ initial: false }),
  }),
  armor: new SchemaField({
    abdomen: new NumberField({ integer: true, min: 0, initial: 0 }),
    body: new NumberField({ integer: true, min: 0, initial: 0 }),
    chest: new NumberField({ integer: true, min: 0, initial: 0 }),
    forequarters: new NumberField({ integer: true, min: 0, initial: 0 }),
    head: new NumberField({ integer: true, min: 0, initial: 0 }),
  }),
  levelAdaptation: new StringField({ initial: '' }),
  actions: new ArrayField(
    new SchemaField({
      startDie: new NumberField({ integer: true, min: 0 }),
      endDie: new NumberField({ integer: true, min: 0 }),
      name: new StringField({ initial: '', required: true }),
      description: new StringField({ initial: '', required: true }),
    }),
  ),
  description: new StringField({ initial: '' }),
  notes: new StringField({ initial: '' }),
  ...sortingField(),
});

type MonsterModelSchema = ReturnType<typeof defineMonsterModel>;

export default class MonsterDataModel extends foundry.abstract.TypeDataModel<
  MonsterModelSchema,
  KerNethalasActor<'monster'>
> {
  static defineSchema(): MonsterModelSchema {
    return defineMonsterModel();
  }

  async addAction() {
    const actions = this.parent.system.actions.slice();
    const usedDie = new Set<number>();
    this.parent.system.actions.forEach((action) => {
      usedDie.add(action.startDie ?? 0);
      usedDie.add(action.endDie ?? 0);
    });
    let startDie = -1;
    let i = 1;
    while (startDie === -1) {
      if (!usedDie.has(i)) {
        startDie = i;
      }
      i += 1;
    }

    actions.splice(startDie - 1, 0, { name: 'New Action', description: '', startDie, endDie: startDie });
    await this.parent.update({ system: { actions } });
  }

  async deleteAction(actionIndex: number) {
    const actions = this.parent.system.actions.slice();
    actions.splice(actionIndex, 1);
    await this.parent.update({ system: { actions } });
  }
}
