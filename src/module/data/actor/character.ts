import { attributeField, damageType, skillField } from './helper';

const { BooleanField, NumberField, SchemaField, StringField } = foundry.data.fields;

const defineCharacterModel = () => ({
  attributes: new SchemaField({
    health: attributeField(11),
    toughness: attributeField(23),
    aether: attributeField(9),
    sanity: attributeField(11),
    magicResistance: new NumberField({ required: true, integer: true, min: 0, initial: 20, max: 80 }),
    exhaustion: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
    exhaustionResistance: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
    damageModifier: new StringField({ initial: '' }),
  }),
  level: new NumberField({ required: true, integer: true, min: 1, initial: 1 }),
  experience: new NumberField({ required: true, integer: true, min: 0, initial: 0, max: 1000 }),
  personalGoal: new StringField({ initial: '' }),
  personalGoal2: new StringField({ initial: '' }),
  lightSource: new NumberField({ required: true, integer: true, min: 0, initial: 0, max: 20 }),
  skills: new SchemaField({
    acrobatics: skillField(10),
    athletics: skillField(10),
    bladedWeapons: skillField(0),
    bludgeoningWeapons: skillField(0),
    dodge: skillField(10),
    endurance: skillField(0),
    medicine: skillField(0),
    perception: skillField(20),
    resolve: skillField(10),
    reason: skillField(0),
    scavenge: skillField(0),
    shaftedWeapons: skillField(0),
    stealth: skillField(0),
    thievery: skillField(0),
    unarmedCombat: skillField(0),
    custom1: new SchemaField({
      name: new StringField({ initial: '' }),
      value: new NumberField({ required: true, integer: true, min: 0, initial: 0, max: 100 }),
      markForImprovement: new BooleanField({ initial: false }),
    }),
    custom2: new SchemaField({
      name: new StringField({ initial: '' }),
      value: new NumberField({ required: true, integer: true, min: 0, initial: 0, max: 100 }),
      markForImprovement: new BooleanField({ initial: false }),
    }),
    custom3: new SchemaField({
      name: new StringField({ initial: '' }),
      value: new NumberField({ required: true, integer: true, min: 0, initial: 0, max: 100 }),
      markForImprovement: new BooleanField({ initial: false }),
    }),
    custom4: new SchemaField({
      name: new StringField({ initial: '' }),
      value: new NumberField({ required: true, integer: true, min: 0, initial: 0, max: 100 }),
      markForImprovement: new BooleanField({ initial: false }),
    }),
    custom5: new SchemaField({
      name: new StringField({ initial: '' }),
      value: new NumberField({ required: true, integer: true, min: 0, initial: 0, max: 100 }),
      markForImprovement: new BooleanField({ initial: false }),
    }),
  }),
  masteries: new SchemaField({
    mastery1: new SchemaField({
      name: new StringField({ initial: '' }),
      passive: new StringField({ initial: '' }),
      tier1: new StringField({ initial: '' }),
      tier2: new StringField({ initial: '' }),
      tier3: new StringField({ initial: '' }),
      tier4: new StringField({ initial: '' }),
      tier5: new StringField({ initial: '' }),
    }),
    mastery2: new SchemaField({
      name: new StringField({ initial: '' }),
      passive: new StringField({ initial: '' }),
      tier1: new StringField({ initial: '' }),
      tier2: new StringField({ initial: '' }),
      tier3: new StringField({ initial: '' }),
      tier4: new StringField({ initial: '' }),
      tier5: new StringField({ initial: '' }),
    }),
    mastery3: new SchemaField({
      name: new StringField({ initial: '' }),
      passive: new StringField({ initial: '' }),
      tier1: new StringField({ initial: '' }),
      tier2: new StringField({ initial: '' }),
      tier3: new StringField({ initial: '' }),
      tier4: new StringField({ initial: '' }),
      tier5: new StringField({ initial: '' }),
    }),
  }),
  perks: new SchemaField({
    madness: new StringField({ initial: '' }),
    perks: new StringField({ initial: '' }),
    notes: new StringField({ initial: '' }),
  }),
  damages: new SchemaField({
    acid: damageType(),
    arcane: damageType(),
    bludgeoning: damageType(),
    cold: damageType(),
    fire: damageType(),
    force: damageType(),
    holy: damageType(),
    infernal: damageType(),
    lightning: damageType(),
    necrotic: damageType(),
    piercing: damageType(),
    poison: damageType(),
    psychic: damageType(),
    slashing: damageType(),
  }),
});

type CharacterModelSchema = ReturnType<typeof defineCharacterModel>;

export default class CharacterDataModel extends foundry.abstract.TypeDataModel<
  CharacterModelSchema,
  Actor.Implementation
> {
  static defineSchema(): CharacterModelSchema {
    return defineCharacterModel();
  }
}
