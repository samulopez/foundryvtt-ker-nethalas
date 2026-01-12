import { getLocalization } from '../../helpers';
import { HIT_LOCATIONS, WEIGHT } from '../../constants';

import { attributeField, damageType, skillField } from './helper';

import type KerNethalasItem from '../../item/item';
import type KerNethalasActor from '../../actor/actor';

const { ArrayField, BooleanField, DocumentUUIDField, NumberField, SchemaField, StringField } = foundry.data.fields;

const defineCharacterModel = () => ({
  attributes: new SchemaField({
    health: attributeField(1),
    toughness: attributeField(1),
    aether: attributeField(1),
    sanity: attributeField(1),
    exhaustion: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
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
    medicine: skillField(0),
    perception: skillField(20),
    reason: skillField(0),
    scavenge: skillField(0),
    shaftedWeapons: skillField(0),
    stealth: skillField(0),
    thievery: skillField(0),
    unarmedCombat: skillField(0),
    custom1: new SchemaField({
      name: new StringField({ initial: '' }),
      value: new NumberField({ required: true, integer: true, min: 0, initial: 0, max: 80 }),
      markForImprovement: new BooleanField({ initial: false }),
      temporaryModifier: new NumberField({ integer: true }),
    }),
  }),
  resistances: new SchemaField({
    endurance: new NumberField({ required: true, integer: true, min: 0, initial: 0, max: 80 }),
    resolve: new NumberField({ required: true, integer: true, min: 0, initial: 0, max: 80 }),
    spellward: new NumberField({ required: true, integer: true, min: 0, initial: 0, max: 80 }),
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
  hitLocation: new StringField({
    choices: [HIT_LOCATIONS.humanoid],
    initial: HIT_LOCATIONS.humanoid,
  }),
  weakSpot: new StringField({ initial: 'head' }),
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
  equipment: new SchemaField({
    mainHand: new DocumentUUIDField({ type: 'Item', required: false }),
    offHand: new DocumentUUIDField({ type: 'Item', required: false }),
    armor: new SchemaField({
      head: new DocumentUUIDField({ type: 'Item', required: false }),
      torso: new DocumentUUIDField({ type: 'Item', required: false }),
      arms: new DocumentUUIDField({ type: 'Item', required: false }),
      legs: new DocumentUUIDField({ type: 'Item', required: false }),
    }),
    gloves: new DocumentUUIDField({ type: 'Item', required: false }),
    boots: new DocumentUUIDField({ type: 'Item', required: false }),
    amulet: new DocumentUUIDField({ type: 'Item', required: false }),
    ring1: new DocumentUUIDField({ type: 'Item', required: false }),
    ring2: new DocumentUUIDField({ type: 'Item', required: false }),
  }),
  beltList: new ArrayField(new DocumentUUIDField({ type: 'Item' })),
  gearList: new ArrayField(new DocumentUUIDField({ type: 'Item' })),
  backpackList: new ArrayField(new DocumentUUIDField({ type: 'Item' })),
  pouch1List: new ArrayField(new DocumentUUIDField({ type: 'Item' })),
  pouch2List: new ArrayField(new DocumentUUIDField({ type: 'Item' })),
  pouch3List: new ArrayField(new DocumentUUIDField({ type: 'Item' })),
});

type CharacterModelSchema = ReturnType<typeof defineCharacterModel>;

export default class CharacterDataModel extends foundry.abstract.TypeDataModel<
  CharacterModelSchema,
  KerNethalasActor<'character'>
> {
  static defineSchema(): CharacterModelSchema {
    return defineCharacterModel();
  }

  gearItems(): Item.Implementation[] {
    return this.parent.items.filter((item) => this.parent.system.gearList.includes(item.uuid));
  }

  backpackItems(): Item.Implementation[] {
    return this.parent.items.filter((item) => this.parent.system.backpackList.includes(item.uuid));
  }

  nonEncumberingItems(): Item.Implementation[] {
    return this.parent.items.filter((item) => item.system.weight === WEIGHT.nonEncumbering);
  }

  pouch1Items(): Item.Implementation[] {
    return this.parent.items.filter((item) => this.parent.system.pouch1List.includes(item.uuid));
  }

  pouch2Items(): Item.Implementation[] {
    return this.parent.items.filter((item) => this.parent.system.pouch2List.includes(item.uuid));
  }

  pouch3Items(): Item.Implementation[] {
    return this.parent.items.filter((item) => this.parent.system.pouch3List.includes(item.uuid));
  }

  beltItems(): Item.Implementation[] {
    return this.parent.items.filter((item) => this.parent.system.beltList.includes(item.uuid));
  }

  equipmentItems(): {
    mainHand: Item.Implementation | null;
    offHand: Item.Implementation | null;
    armor: {
      head: Item.Implementation | null;
      torso: Item.Implementation | null;
      arms: Item.Implementation | null;
      legs: Item.Implementation | null;
    };
    gloves: Item.Implementation | null;
    boots: Item.Implementation | null;
    amulet: Item.Implementation | null;
    ring1: Item.Implementation | null;
    ring2: Item.Implementation | null;
  } {
    return {
      mainHand: this.parent.items.find((item) => item.uuid === this.parent.system.equipment.mainHand) ?? null,
      offHand: this.parent.items.find((item) => item.uuid === this.parent.system.equipment.offHand) ?? null,
      armor: {
        head: this.parent.items.find((item) => item.uuid === this.parent.system.equipment.armor.head) ?? null,
        torso: this.parent.items.find((item) => item.uuid === this.parent.system.equipment.armor.torso) ?? null,
        arms: this.parent.items.find((item) => item.uuid === this.parent.system.equipment.armor.arms) ?? null,
        legs: this.parent.items.find((item) => item.uuid === this.parent.system.equipment.armor.legs) ?? null,
      },
      gloves: this.parent.items.find((item) => item.uuid === this.parent.system.equipment.gloves) ?? null,
      boots: this.parent.items.find((item) => item.uuid === this.parent.system.equipment.boots) ?? null,
      amulet: this.parent.items.find((item) => item.uuid === this.parent.system.equipment.amulet) ?? null,
      ring1: this.parent.items.find((item) => item.uuid === this.parent.system.equipment.ring1) ?? null,
      ring2: this.parent.items.find((item) => item.uuid === this.parent.system.equipment.ring2) ?? null,
    };
  }

  currentGearCapacity(): number {
    return this.gearItems().reduce((sum, item) => sum + item.system.slots(), 0);
  }

  currentBackpackCapacity(): number {
    return this.backpackItems().reduce((sum, item) => sum + item.system.slots(), 0);
  }

  currentPouch1Capacity(): number {
    return this.pouch1Items().reduce((sum, item) => sum + item.system.slots(), 0);
  }

  currentPouch2Capacity(): number {
    return this.pouch2Items().reduce((sum, item) => sum + item.system.slots(), 0);
  }

  currentPouch3Capacity(): number {
    return this.pouch3Items().reduce((sum, item) => sum + item.system.slots(), 0);
  }

  currentBeltCapacity(): number {
    return this.beltItems().length;
  }

  canAddToGearList(newSlots: number): boolean {
    return this.gearItems().reduce((sum, item) => sum + item.system.slots(), 0) + newSlots <= 10;
  }

  canAddToBackpackList(newSlots: number): boolean {
    return this.backpackItems().reduce((sum, item) => sum + item.system.slots(), 0) + newSlots <= 20;
  }

  canAddToPouch1(newSlots: number): boolean {
    return this.pouch1Items().reduce((sum, item) => sum + item.system.slots(), 0) + newSlots <= 5;
  }

  canAddToPouch2(newSlots: number): boolean {
    return this.pouch2Items().reduce((sum, item) => sum + item.system.slots(), 0) + newSlots <= 5;
  }

  canAddToPouch3(newSlots: number): boolean {
    return this.pouch3Items().reduce((sum, item) => sum + item.system.slots(), 0) + newSlots <= 5;
  }

  canAddToBeltList(): boolean {
    return this.beltItems().length < 4;
  }

  canEquipWeapon(item: KerNethalasItem): { result: boolean; message: string } {
    const { system } = item;
    if (!system.equippable) {
      return { result: false, message: getLocalization().localize('KN.Error.notEquippable') };
    }

    if (system.slots() > 1 && (this.parent.system.equipment.mainHand || this.parent.system.equipment.offHand)) {
      return {
        result: false,
        message: getLocalization().localize('KN.Error.twoHandedHandsOccupied'),
      };
    }

    const equipment = this.equipmentItems();
    if ((equipment.mainHand?.system.slots() ?? 0) > 1 || (equipment.offHand?.system.slots() ?? 0) > 1) {
      return {
        result: false,
        message: getLocalization().localize('KN.Error.twoHandedAlreadyEquipped'),
      };
    }

    return { result: true, message: '' };
  }

  async addItemToList(list: string, item: Item.Implementation) {
    const result = await this.parent.update({
      system: {
        [list]: [...this[list], item.uuid],
      },
    });
    return result ? item : null;
  }

  async moveItemToList(list: string, item: Item.Implementation) {
    await this.removeItemFromLists(item.uuid);

    const result = await this.parent.update({
      system: {
        [list]: [...this[list], item.uuid],
      },
    });

    return result ? item : null;
  }

  async removeItemFromLists(itemUUID: string) {
    return this.parent.update({
      system: {
        backpackList: this.backpackList.filter((id) => id !== itemUUID),
        gearList: this.gearList.filter((id) => id !== itemUUID),
        pouch1List: this.pouch1List.filter((id) => id !== itemUUID),
        pouch2List: this.pouch2List.filter((id) => id !== itemUUID),
        pouch3List: this.pouch3List.filter((id) => id !== itemUUID),
        beltList: this.beltList.filter((id) => id !== itemUUID),
        equipment: {
          mainHand: this.parent.system.equipment.mainHand === itemUUID ? null : this.parent.system.equipment.mainHand,
          offHand: this.parent.system.equipment.offHand === itemUUID ? null : this.parent.system.equipment.offHand,
          armor: {
            head: this.parent.system.equipment.armor.head === itemUUID ? null : this.parent.system.equipment.armor.head,
            torso:
              this.parent.system.equipment.armor.torso === itemUUID ? null : this.parent.system.equipment.armor.torso,
            arms: this.parent.system.equipment.armor.arms === itemUUID ? null : this.parent.system.equipment.armor.arms,
            legs: this.parent.system.equipment.armor.legs === itemUUID ? null : this.parent.system.equipment.armor.legs,
          },
          gloves: this.parent.system.equipment.gloves === itemUUID ? null : this.parent.system.equipment.gloves,
          boots: this.parent.system.equipment.boots === itemUUID ? null : this.parent.system.equipment.boots,
          amulet: this.parent.system.equipment.amulet === itemUUID ? null : this.parent.system.equipment.amulet,
          ring1: this.parent.system.equipment.ring1 === itemUUID ? null : this.parent.system.equipment.ring1,
          ring2: this.parent.system.equipment.ring2 === itemUUID ? null : this.parent.system.equipment.ring2,
        },
      },
    });
  }

  async addToMainHand(item: Item.Implementation) {
    await this.removeItemFromLists(item.uuid);

    const result = await this.parent.update({
      system: {
        equipment: {
          mainHand: item.uuid,
        },
      },
    });

    return result ? item : null;
  }

  async addToOffHand(item: Item.Implementation) {
    await this.removeItemFromLists(item.uuid);

    const result = await this.parent.update({
      system: {
        equipment: {
          offHand: item.uuid,
        },
      },
    });

    return result ? item : null;
  }

  async swapMainToOffHand() {
    const currentMainHand = this.parent.system.equipment.mainHand;
    const currentOffHand = this.parent.system.equipment.offHand;

    await this.parent.update({
      system: {
        equipment: {
          mainHand: currentOffHand,
          offHand: currentMainHand,
        },
      },
    });
  }

  async addItemToEquipment(equipment: string, item: Item.Implementation) {
    await this.removeItemFromLists(item.uuid);

    const result = await this.parent.update({
      system: {
        equipment: {
          [equipment]: item.uuid,
        },
      },
    });

    return result ? item : null;
  }
}
