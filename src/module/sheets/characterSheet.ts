import { getLocalization } from '../helpers';
import { TEMPLATES, SKILL_DISPLAY, WEIGHT } from '../constants';

import type KerNethalasItem from '../item/item';
import type KerNethalasActor from '../actor/actor';

import ActorSheetV2 = foundry.applications.sheets.ActorSheetV2;

const { HandlebarsApplicationMixin } = foundry.applications.api;

interface Context {
  skillRows: unknown[];
  enrichedPerksMadness: string;
  enrichedPerksPerks: string;
  enrichedPerksNotes: string;
  enrichedMechanicsActiveEvents: string;
  enrichedMechanicsOverseerInfluence: string;
  enrichedMechanicsNotes: string;
  currentGearCapacity: number;
  currentBackpackCapacity: number;
  currentPouch1Capacity: number;
  currentPouch2Capacity: number;
  currentPouch3Capacity: number;
  currentBeltCapacity: number;
  gearList: Item.Implementation[];
  backpackList: Item.Implementation[];
  nonEncumberingList: Item.Implementation[];
  gemList: Item.Implementation[];
  pouch1List: Item.Implementation[];
  pouch2List: Item.Implementation[];
  pouch3List: Item.Implementation[];
  beltList: Item.Implementation[];
  equipment: {
    mainHand: Item.Implementation | null;
    offHand: Item.Implementation | null;
  };
  totalCoinsAndGems: number;
  itemSlotsCoinsAndGems: number;
}

export default class CharacterSheet<
  RenderContext extends ActorSheetV2.RenderContext & Context,
  Configuration extends ActorSheetV2.Configuration = ActorSheetV2.Configuration,
  RenderOptions extends ActorSheetV2.RenderOptions = ActorSheetV2.RenderOptions,
> extends HandlebarsApplicationMixin(ActorSheetV2)<RenderContext, Configuration, RenderOptions> {
  static DEFAULT_OPTIONS = {
    window: { resizable: true },
    position: { width: 750, height: 770 },
    classes: ['actor', 'character'],
    form: { submitOnChange: true },
    tag: 'form',
    actions: {
      rollSkill: this.#rollSkill,
      rollResistance: this.#rollResistance,
      rollArmorIntegrity: this.#rollArmorIntegrity,
      rollTensionDie: this.#rollTensionDie,
      rollLairDomainExitDie: this.#rollLairDomainExitDie,
      markOverseerFound: this.#markOverseerFound,
      removeItem: this.#removeItem,
      increaseQuantityItem: this.#increaseQuantityItem,
      decreaseQuantityItem: this.#decreaseQuantityItem,
      toggleExpand: this.#toggleExpand,
      editItem: this.#editItem,
      equipWeapon: this.#equipWeapon,
      equipArmor: this.#equipArmor,
      swapWeapons: this.#swapWeapons,
      rollHitLocation: this.#rollHitLocation,
      toggleSorting: this.#toggleSorting,
    },
    dragDrop: [
      {
        dropSelector: '.gear-list, .backpack-list, .pouch1-list, .pouch2-list, .pouch3-list, .main-hand, .off-hand',
      },
    ],
  };

  static TABS = {
    primary: {
      initial: 'inventory',
      labelPrefix: 'KN.Character.Tabs',
      tabs: [
        { id: 'skills', tooltip: 'KN.Character.Tabs.tooltip.skills' },
        { id: 'perks', tooltip: 'KN.Character.Tabs.tooltip.perks' },
        { id: 'inventory', tooltip: 'KN.Character.Tabs.tooltip.inventory' },
        { id: 'mechanics', tooltip: 'KN.Character.Tabs.tooltip.mechanics' },
      ],
    },
  };

  static PARTS = {
    header: {
      template: TEMPLATES.character.header,
    },
    tabs: {
      template: `templates/generic/tab-navigation.hbs`, // From FoundryVTT
    },
    skills: {
      template: TEMPLATES.character.skillsTab,
    },
    perks: {
      template: TEMPLATES.character.perksTab,
    },
    inventory: {
      template: TEMPLATES.character.inventoryTab,
    },
    mechanics: {
      template: TEMPLATES.character.mechanicsTab,
    },
  };

  get document(): KerNethalasActor<'character'> {
    if (!super.document.isCharacter()) {
      throw new Error('Actor is not a character');
    }
    return super.document;
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.skillRows = [
      {
        left: { ...this.document.system.skills[SKILL_DISPLAY.left[0]], id: SKILL_DISPLAY.left[0] },
        right: { ...this.document.system.skills[SKILL_DISPLAY.right[0]], id: SKILL_DISPLAY.right[0] },
      },
      {
        left: { ...this.document.system.skills[SKILL_DISPLAY.left[1]], id: SKILL_DISPLAY.left[1] },
        right: { ...this.document.system.skills[SKILL_DISPLAY.right[1]], id: SKILL_DISPLAY.right[1] },
      },
      {
        left: { ...this.document.system.skills[SKILL_DISPLAY.left[2]], id: SKILL_DISPLAY.left[2] },
        right: { ...this.document.system.skills[SKILL_DISPLAY.right[2]], id: SKILL_DISPLAY.right[2] },
      },
      {
        left: { ...this.document.system.skills[SKILL_DISPLAY.left[3]], id: SKILL_DISPLAY.left[3] },
        right: { ...this.document.system.skills[SKILL_DISPLAY.right[3]], id: SKILL_DISPLAY.right[3] },
      },
      {
        left: { ...this.document.system.skills[SKILL_DISPLAY.left[4]], id: SKILL_DISPLAY.left[4] },
        right: { ...this.document.system.skills[SKILL_DISPLAY.right[4]], id: SKILL_DISPLAY.right[4] },
      },
      {
        left: { ...this.document.system.skills[SKILL_DISPLAY.left[5]], id: SKILL_DISPLAY.left[5] },
        right: { ...this.document.system.skills[SKILL_DISPLAY.right[5]], id: SKILL_DISPLAY.right[5] },
      },
      {
        left: { ...this.document.system.skills[SKILL_DISPLAY.left[6]], id: SKILL_DISPLAY.left[6] },
        right: { ...this.document.system.skills.custom1, id: 'custom1', custom: true },
      },
    ];

    context.enrichedPerksMadness = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.document.system.perks.madness,
      {
        secrets: this.document.isOwner,
        relativeTo: this.document,
      },
    );

    context.enrichedPerksPerks = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.document.system.perks.perks,
      {
        secrets: this.document.isOwner,
        relativeTo: this.document,
      },
    );

    context.enrichedPerksNotes = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.document.system.perks.notes,
      {
        secrets: this.document.isOwner,
        relativeTo: this.document,
      },
    );

    context.enrichedMechanicsActiveEvents = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.document.system.mechanics.activeEvents,
      {
        secrets: this.document.isOwner,
        relativeTo: this.document,
      },
    );

    context.enrichedMechanicsOverseerInfluence = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.document.system.mechanics.overseerInfluence,
      {
        secrets: this.document.isOwner,
        relativeTo: this.document,
      },
    );

    context.enrichedMechanicsNotes = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.document.system.mechanics.notes,
      {
        secrets: this.document.isOwner,
        relativeTo: this.document,
      },
    );

    const sortedItems = this.document.system.sortedItems();
    context.gearList = this.document.system.gearItems(sortedItems);
    context.backpackList = this.document.system.backpackItems(sortedItems);
    context.pouch1List = this.document.system.pouch1Items(sortedItems);
    context.pouch2List = this.document.system.pouch2Items(sortedItems);
    context.pouch3List = this.document.system.pouch3Items(sortedItems);
    context.beltList = this.document.system.beltItems(sortedItems);

    context.currentGearCapacity = this.document.system.currentGearCapacity();
    context.currentBackpackCapacity = this.document.system.currentBackpackCapacity();
    context.nonEncumberingList = this.document.system.nonEncumberingItems(sortedItems);
    context.gemList = this.document.system.gemItems(sortedItems);
    context.currentPouch1Capacity = this.document.system.currentPouch1Capacity();
    context.currentPouch2Capacity = this.document.system.currentPouch2Capacity();
    context.currentPouch3Capacity = this.document.system.currentPouch3Capacity();
    context.currentBeltCapacity = this.document.system.currentBeltCapacity();

    context.equipment = this.document.system.equipmentItems();

    // TODO: add special supplies
    context.totalCoinsAndGems = (this.document.system.coins ?? 0) + this.document.system.numberGems();
    context.itemSlotsCoinsAndGems = this.document.system.itemSlotsCoinsAndGems();

    return context;
  }

  async _onDragStart(event) {
    const target = event.currentTarget as HTMLElement;
    const row = target.closest<HTMLElement>('[data-uuid]');
    const itemId = row?.dataset.itemId ?? target.dataset.key;
    if (itemId && event.dataTransfer) {
      const item = this.document.items.get(itemId);
      if (item) {
        const dragData = item.toDragData ? item.toDragData() : { type: 'Item', uuid: item.uuid };
        event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
      }
    }
    super._onDragStart(event);
  }

  _dropInEquipment(event: DragEvent): string {
    if ((event.target as HTMLElement).closest('.helmet')) {
      return 'armor.head';
    }
    if ((event.target as HTMLElement).closest('.armor-torso')) {
      return 'armor.torso';
    }
    if ((event.target as HTMLElement).closest('.armor-arms')) {
      return 'armor.arms';
    }
    if ((event.target as HTMLElement).closest('.armor-legs')) {
      return 'armor.legs';
    }
    if ((event.target as HTMLElement).closest('.gloves')) {
      return 'gloves';
    }
    if ((event.target as HTMLElement).closest('.boots')) {
      return 'boots';
    }
    if ((event.target as HTMLElement).closest('.amulet')) {
      return 'amulet';
    }
    if ((event.target as HTMLElement).closest('.ring1')) {
      return 'ring1';
    }
    if ((event.target as HTMLElement).closest('.ring2')) {
      return 'ring2';
    }
    return '';
  }

  _dropInList(event: DragEvent): string {
    const target = event.target as HTMLElement;
    if (target.closest('.gear-list')) {
      return 'gearList';
    }
    if (target.closest('.backpack-list')) {
      return 'backpackList';
    }
    if (target.closest('.pouch1-list')) {
      return 'pouch1List';
    }
    if (target.closest('.pouch2-list')) {
      return 'pouch2List';
    }
    if (target.closest('.pouch3-list')) {
      return 'pouch3List';
    }
    if (target.closest('.belt-list')) {
      return 'beltList';
    }

    return '';
  }

  async _onDropItem(event: DragEvent, item: KerNethalasItem) {
    const target = event.target as HTMLElement;
    const targetItem = target.closest<HTMLElement>('[data-item-id]');
    if (targetItem?.dataset.itemId === item.id) {
      // Don't sort the same item on itself
      return null;
    }
    const dropInMainHand = !!target.closest('.main-hand');
    const dropInOffHand = !!target.closest('.off-hand');
    const equipmentDropped = this._dropInEquipment(event);
    const listDropped = this._dropInList(event);
    const dropInNonEncumbering = !!target.closest('.non-encumbering-items-list');
    const dropInGem = !!target.closest('.gems-list');

    const droppingOnHands = dropInMainHand || dropInOffHand;

    const sameActorItem = item?.parent?.id === this.document.id;

    if (sameActorItem) {
      if (item.system.weight === WEIGHT.nonEncumbering) {
        if (!targetItem || !dropInNonEncumbering) {
          ui.notifications?.warn(getLocalization().localize('KN.Error.nonEncumberingMoveSameActor'));
        }
        await this._onSortItem(event, item);
        return null;
      }

      if (item.system.weight === WEIGHT.gem) {
        if (!targetItem || !dropInGem) {
          ui.notifications?.warn(getLocalization().localize('KN.Error.gemMoveSameActor'));
        }
        await this._onSortItem(event, item);
        return null;
      }

      if (droppingOnHands) {
        const { result, message } = this.document.system.canEquipWeapon(item);
        if (!result) {
          ui.notifications?.warn(message);
          return null;
        }

        if (dropInMainHand && this.document.system.equipment.offHand === item.uuid) {
          await this.document.update({ system: { equipment: { offHand: null } } });
        }

        if (dropInOffHand && this.document.system.equipment.mainHand === item.uuid) {
          await this.document.update({ system: { equipment: { mainHand: null } } });
        }

        const targetHand = dropInMainHand
          ? this.document.system.equipment.mainHand
          : this.document.system.equipment.offHand;
        if (targetHand && targetHand !== item.uuid) {
          ui.notifications?.warn(getLocalization().localize('KN.Error.handAlreadyOccupied'));
          return null;
        }

        return dropInMainHand ? this.document.system.addToMainHand(item) : this.document.system.addToOffHand(item);
      }

      if (equipmentDropped) {
        if (!item.system.equippable) {
          ui.notifications?.warn(getLocalization().localize('KN.Error.notEquippable'));
          return null;
        }
        if (item.type === 'armor' && item.system.canEquipInSlot && !item.system.canEquipInSlot(equipmentDropped)) {
          ui.notifications?.warn(getLocalization().localize('KN.Error.armorSlotMismatch'));
          return null;
        }
        if (this.document.system.equipment[equipmentDropped]) {
          ui.notifications?.warn(getLocalization().localize('KN.Error.equipmentSlotOccupied'));
          return null;
        }
        return this.document.system.addItemToEquipment(equipmentDropped, item);
      }

      if (listDropped) {
        if (this.document.system.isItemInList(listDropped, item)) {
          await this._onSortItem(event, item);
          return null;
        }
        if (!this.document.system.canAddToList(listDropped, item.system.slots())) {
          ui.notifications?.warn(getLocalization().localize(`KN.Error.${listDropped}Capacity`));
          return null;
        }
        return this.document.system.moveItemToList(listDropped, item);
      }

      return null;
    }

    if (item.system.weight === WEIGHT.nonEncumbering) {
      const newItem = await super._onDropItem(event, item);
      if (!newItem) {
        return null;
      }
      await this._onSortItem(event, newItem);
      return newItem;
    }

    if (item.system.weight === WEIGHT.gem) {
      const newItem = await super._onDropItem(event, item);
      if (!newItem) {
        return null;
      }
      await this._onSortItem(event, newItem);
      return newItem;
    }

    if (droppingOnHands) {
      const targetHand = dropInMainHand
        ? this.document.system.equipment.mainHand
        : this.document.system.equipment.offHand;
      if (targetHand) {
        ui.notifications?.warn(getLocalization().localize('KN.Error.handAlreadyOccupied'));
        return null;
      }

      const { result, message } = this.document.system.canEquipWeapon(item);
      if (!result) {
        ui.notifications?.warn(message);
        return null;
      }

      const newItem = await super._onDropItem(event, item);
      if (!newItem) {
        return null;
      }

      return dropInMainHand ? this.document.system.addToMainHand(newItem) : this.document.system.addToOffHand(newItem);
    }

    if (equipmentDropped) {
      if (!item.system.equippable) {
        ui.notifications?.warn(getLocalization().localize('KN.Error.notEquippable'));
        return null;
      }
      if (item.type === 'armor' && item.system.canEquipInSlot && !item.system.canEquipInSlot(equipmentDropped)) {
        ui.notifications?.warn(getLocalization().localize('KN.Error.armorSlotMismatch'));
        return null;
      }
      return this._onDropToEquipment(event, equipmentDropped, item);
    }

    if (listDropped) {
      if (!this.document.system.canAddToList(listDropped, item.system.slots())) {
        ui.notifications?.warn(getLocalization().localize(`KN.Error.${listDropped}Capacity`));
        return null;
      }
      const newItem = await super._onDropItem(event, item);
      if (!newItem) {
        return null;
      }
      await this._onSortItem(event, newItem);
      return this.document.system.addItemToList(listDropped, newItem);
    }

    return null;
  }

  async _onDropToEquipment(event, equipmentSlot, item) {
    if (this.document.system.equipment[equipmentSlot]) {
      ui.notifications?.warn(getLocalization().localize('KN.Error.equipmentSlotOccupied'));
      return null;
    }
    const newItem = await super._onDropItem(event, item);
    if (!newItem) {
      return null;
    }
    return this.document.system.addItemToEquipment(equipmentSlot, newItem);
  }

  static async #rollTensionDie(this, event, _target) {
    event.preventDefault();
    await this.document.rollTensionDie();
  }

  static async #rollLairDomainExitDie(this, event, _target) {
    event.preventDefault();
    await this.document.rollLairDomainExitDie();
  }

  static async #rollHitLocation(this, event: PointerEvent) {
    event.preventDefault();
    await this.document.rollHitLocation();
  }

  static async #markOverseerFound(this, event, _target) {
    event.preventDefault();
    const checkbox = event.target as HTMLInputElement;
    await this.document.markOverseerFound(checkbox.checked);
  }

  static async #rollArmorIntegrity(this, event: PointerEvent) {
    event.preventDefault();
    const button = event.target as HTMLElement;
    const { key } = button.dataset;
    if (!key) {
      return;
    }

    const item = this.document.getEmbeddedDocument('Item', key, {});
    if (!item) {
      return;
    }
    const result = await item.rollArmorIntegrity();
    if (result) {
      ui.notifications?.warn(result);
    }
  }

  static async #rollSkill(this, event: PointerEvent) {
    event.preventDefault();
    const button = event.target as HTMLElement;
    const { key } = button.dataset;
    if (!key) {
      return;
    }

    if (!event.ctrlKey && !event.shiftKey) {
      await this.document.rollSkill(key, 0);
      return;
    }

    const content = await foundry.applications.handlebars.renderTemplate(TEMPLATES.modifyRoll, {
      originalValue: this.document.system.skills[key].value,
    });

    new foundry.applications.api.DialogV2({
      window: { title: getLocalization().localize('KN.ModifySkillRollDialogue.title') },
      modal: true,
      classes: ['modify-roll-dialogue'],
      content,
      actions: {
        rollWithModifier: async (eventButton) => {
          const buttonSubmit = eventButton.target as HTMLButtonElement;
          const { value } = buttonSubmit.dataset;
          if (!value) {
            return;
          }
          await this.document.rollSkill(key, Number(value));
        },
      },
      buttons: [
        {
          default: true,
          action: 'roll',
          icon: 'fas fa-dice',
          label: getLocalization().localize('KN.ModifySkillRollDialogue.action'),
          callback: async (eventDialog, buttonDialog, dialog) => {
            const html = dialog.element;
            const plusOrMinus = html.querySelector('[name="plusOrMinus"]')?.value;
            const valueModifier = html.querySelector('[name="valueModifier"]')?.value;
            if (!valueModifier?.trim()) {
              await this.document.rollSkill(key, 0);
              return;
            }
            await this.document.rollSkill(key, Number(`${plusOrMinus}${valueModifier}`));
          },
        },
      ],
    }).render({ force: true });
  }

  static async #rollResistance(this, event: PointerEvent) {
    event.preventDefault();
    const button = event.target as HTMLElement;
    const { key } = button.dataset;
    if (!key) {
      return;
    }

    if (!event.ctrlKey && !event.shiftKey) {
      await this.document.rollResistance(key, 0);
      return;
    }

    const content = await foundry.applications.handlebars.renderTemplate(TEMPLATES.modifyRoll, {
      originalValue: this.document.system.resistances[key],
    });

    new foundry.applications.api.DialogV2({
      window: { title: getLocalization().localize('KN.ModifySkillRollDialogue.title') },
      modal: true,
      classes: ['modify-roll-dialogue'],
      content,
      actions: {
        rollWithModifier: async (eventButton) => {
          const buttonSubmit = eventButton.target as HTMLButtonElement;
          const { value } = buttonSubmit.dataset;
          if (!value) {
            return;
          }
          await this.document.rollResistance(key, Number(value));
        },
      },
      buttons: [
        {
          default: true,
          action: 'roll',
          icon: 'fas fa-dice',
          label: getLocalization().localize('KN.ModifySkillRollDialogue.action'),
          callback: async (eventDialog, buttonDialog, dialog) => {
            const html = dialog.element;
            const plusOrMinus = html.querySelector('[name="plusOrMinus"]')?.value;
            const valueModifier = html.querySelector('[name="valueModifier"]')?.value;
            if (!valueModifier?.trim()) {
              await this.document.rollResistance(key, 0);
              return;
            }
            await this.document.rollResistance(key, Number(`${plusOrMinus}${valueModifier}`));
          },
        },
      ],
    }).render({ force: true });
  }

  static async #removeItem(this, event, target) {
    event.preventDefault();
    const { key } = target.dataset;
    const item = this.document.getEmbeddedDocument('Item', key, {});
    if (!item) {
      return;
    }
    await this.document.system.removeItemFromLists(item.uuid);
    await this.document.deleteEmbeddedDocuments('Item', [key]);
  }

  static async #increaseQuantityItem(this, event, target) {
    event.preventDefault();
    const { key } = target.dataset;
    const item = this.document.getEmbeddedDocument('Item', key, {});
    if (!item || (item.system.quantity === 10 && item.system.weight !== WEIGHT.gem)) {
      return;
    }
    const newQuantity = (item.system.quantity ?? 0) + 1;
    await item.update({ system: { quantity: newQuantity } });
  }

  static async #decreaseQuantityItem(this, event, target) {
    event.preventDefault();
    const { key } = target.dataset;
    const item = this.document.getEmbeddedDocument('Item', key, {});
    if (!item || item.system.quantity === 1) {
      return;
    }
    const newQuantity = (item.system.quantity ?? 0) - 1;
    await item.update({ system: { quantity: newQuantity } });
  }

  static async #toggleExpand(event, target) {
    const icon = target.querySelector(':scope > i');
    const row = target.closest('[data-uuid]');
    const { uuid } = row.dataset;
    const item = await fromUuid(uuid);
    if (!item) return;

    const expanded = !row.classList.contains('collapsed');
    row.classList.toggle('collapsed', expanded);
    icon.classList.toggle('fa-compress', !expanded);
    icon.classList.toggle('fa-expand', expanded);
  }

  static async #editItem(this, event, target) {
    event.preventDefault();
    const { key } = target.dataset;
    const item = this.document.getEmbeddedDocument('Item', key, {});
    if (!item) {
      return;
    }
    item.sheet?.render(true);
  }

  static async #equipArmor(this, event: PointerEvent, target: HTMLElement) {
    event.preventDefault();
    const { key } = target.dataset;
    if (!key) {
      return;
    }
    const item = this.document.getEmbeddedDocument('Item', key, {});
    if (!item) {
      return;
    }

    if (!item.system.armorType) {
      return;
    }

    if (this.document.system.equipment.armor[item.system.armorType]) {
      ui.notifications?.warn(getLocalization().localize('KN.Error.equipmentSlotOccupied'));
      return;
    }

    await this.document.system.addItemToEquipment(`armor.${item.system.armorType}`, item);
  }

  static async #equipWeapon(this, event: PointerEvent, target: HTMLElement) {
    event.preventDefault();
    const { key } = target.dataset;
    if (!key) {
      return;
    }
    const item = this.document.getEmbeddedDocument('Item', key, {});
    if (!item) {
      return;
    }

    const { result, message } = this.document.system.canEquipWeapon(item);
    if (!result) {
      ui.notifications?.warn(message);
      return;
    }

    if (!this.document.system.equipment.mainHand) {
      await this.document.system.addToMainHand(item);
      return;
    }

    if (!this.document.system.equipment.offHand) {
      await this.document.system.addToOffHand(item);
      return;
    }

    ui.notifications?.warn(getLocalization().localize('KN.Error.bothHandsEquipped'));
  }

  static async #swapWeapons(this, event, _target) {
    event.preventDefault();
    await this.document.system.swapMainToOffHand();
  }

  static async #toggleSorting(this, event, _target) {
    event.preventDefault();

    await this.document.system.toggleSorting();
  }
}
