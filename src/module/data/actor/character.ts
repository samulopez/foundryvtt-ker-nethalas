import { attributeField, damageType, skillField } from './helper';

const { ArrayField, BooleanField, DocumentUUIDField, NumberField, SchemaField, StringField } = foundry.data.fields;

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
  mechanics: new SchemaField({
    tensionDie: new NumberField({ required: true, integer: true, min: 4, initial: 8, max: 8 }),
    lairDie: new NumberField({ required: true, integer: true, min: 4, initial: 10, max: 10 }),
    overseerFound: new BooleanField({ initial: false }),
    domainExitDie: new NumberField({ required: true, integer: true, min: 2, initial: 8, max: 8 }),
    activeEvents: new StringField({ initial: '' }),
    overseer: new StringField({ initial: '' }),
    overseerInfluence: new StringField({ initial: '' }),
    notes: new StringField({ initial: '' }),
  }),
  gearList: new ArrayField(new DocumentUUIDField({ type: 'Item' })),
  backpackList: new ArrayField(new DocumentUUIDField({ type: 'Item' })),
});

type CharacterModelSchema = ReturnType<typeof defineCharacterModel>;

export default class CharacterDataModel extends foundry.abstract.TypeDataModel<
  CharacterModelSchema,
  Actor.Implementation
> {
  static defineSchema(): CharacterModelSchema {
    return defineCharacterModel();
  }

  gearItems(): Item.Implementation[] {
    return this.parent.items.filter((item) => {
      const id = item.getRelativeUUID(this.parent);
      if (id.startsWith('.')) {
        return this.parent.system.gearList?.includes(id.substring(1));
      }
      return this.parent.system.gearList?.includes(id);
    });
  }

  backpackItems(): Item.Implementation[] {
    return this.parent.items.filter((item) => {
      const id = item.getRelativeUUID(this.parent);
      if (id.startsWith('.')) {
        return this.parent.system.backpackList?.includes(id.substring(1));
      }
      return this.parent.system.backpackList?.includes(id);
    });
  }

  nonEncumberingItems(): Item.Implementation[] {
    return this.parent.items.filter((item) => item.system.weight === 'nonEncumbering');
  }

  currentGearCapacity(): number {
    return this.gearItems().reduce((sum, item) => sum + item.system.slots(), 0);
  }

  currentBackpackCapacity(): number {
    return this.backpackItems().reduce((sum, item) => sum + item.system.slots(), 0);
  }

  canAddToGearList(newSlots: number): boolean {
    return this.gearItems().reduce((sum, item) => sum + item.system.slots(), 0) + newSlots <= 10;
  }

  canAddToBackpackList(newSlots: number): boolean {
    return this.backpackItems().reduce((sum, item) => sum + item.system.slots(), 0) + newSlots <= 20;
  }

  async addToGearList(item: Item.Implementation) {
    const result = await this.parent.update({
      system: {
        gearList: [...this.gearList, item.id],
      },
    });

    return result ? item : null;
  }

  async addToBackpackList(item: Item.Implementation) {
    const result = await this.parent.update({
      system: {
        backpackList: [...this.backpackList, item.id],
      },
    });
    return result ? item : null;
  }

  async removeItemFromLists(itemId: string) {
    return this.parent.update({
      system: {
        backpackList: this.backpackList.filter((id) => id !== itemId),
        gearList: this.gearList.filter((id) => id !== itemId),
      },
    });
  }
}
