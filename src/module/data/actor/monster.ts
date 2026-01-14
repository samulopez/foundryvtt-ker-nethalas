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
    custom: new StringField({ initial: '' }),
  }),
  armor: new SchemaField({
    rightRearLeg: new NumberField({ integer: true, min: 0, initial: 0 }),
    leftRearLeg: new NumberField({ integer: true, min: 0, initial: 0 }),
    rightMidLeg: new NumberField({ integer: true, min: 0, initial: 0 }),
    leftMidLeg: new NumberField({ integer: true, min: 0, initial: 0 }),
    rightForeLeg: new NumberField({ integer: true, min: 0, initial: 0 }),
    leftForeLeg: new NumberField({ integer: true, min: 0, initial: 0 }),
    abdomen: new NumberField({ integer: true, min: 0, initial: 0 }),
    rightFrontLeg: new NumberField({ integer: true, min: 0, initial: 0 }),
    leftFrontLeg: new NumberField({ integer: true, min: 0, initial: 0 }),
    cephalothorax: new NumberField({ integer: true, min: 0, initial: 0 }),
    rightLeg: new NumberField({ integer: true, min: 0, initial: 0 }),
    leftLeg: new NumberField({ integer: true, min: 0, initial: 0 }),
    chest: new NumberField({ integer: true, min: 0, initial: 0 }),
    leftArm: new NumberField({ integer: true, min: 0, initial: 0 }),
    rightArm: new NumberField({ integer: true, min: 0, initial: 0 }),
    head: new NumberField({ integer: true, min: 0, initial: 0 }),
    thorax: new NumberField({ integer: true, min: 0, initial: 0 }),
    rightHindLeg: new NumberField({ integer: true, min: 0, initial: 0 }),
    leftHindLeg: new NumberField({ integer: true, min: 0, initial: 0 }),
    hindquarters: new NumberField({ integer: true, min: 0, initial: 0 }),
    forequarters: new NumberField({ integer: true, min: 0, initial: 0 }),
    body: new NumberField({ integer: true, min: 0, initial: 0 }),
    rightWing: new NumberField({ integer: true, min: 0, initial: 0 }),
    leftWing: new NumberField({ integer: true, min: 0, initial: 0 }),
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

type MonsterModelType = foundry.abstract.TypeDataModel<MonsterModelSchema, KerNethalasActor<'monster'>>;

export default class MonsterDataModel extends foundry.abstract.TypeDataModel<
  MonsterModelSchema,
  KerNethalasActor<'monster'>
> {
  static defineSchema(): MonsterModelSchema {
    return defineMonsterModel();
  }

  _preUpdate: MonsterModelType['_preUpdate'] = async (changed, options, user) => {
    if (changed.system?.hitLocation !== undefined && this.parent.system.hitLocation !== changed.system.hitLocation) {
      // eslint-disable-next-line no-param-reassign
      changed.system.armor = {
        rightRearLeg: 0,
        leftRearLeg: 0,
        rightMidLeg: 0,
        leftMidLeg: 0,
        rightForeLeg: 0,
        leftForeLeg: 0,
        abdomen: 0,
        rightFrontLeg: 0,
        leftFrontLeg: 0,
        cephalothorax: 0,
        rightLeg: 0,
        leftLeg: 0,
        chest: 0,
        leftArm: 0,
        rightArm: 0,
        head: 0,
        thorax: 0,
        rightHindLeg: 0,
        leftHindLeg: 0,
        hindquarters: 0,
        forequarters: 0,
        body: 0,
        rightWing: 0,
        leftWing: 0,
      };
    }
    return super._preUpdate(changed, options, user);
  };

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
