import { getLocalization } from '../helpers';
import { TEMPLATES, SKILL_DISPLAY } from '../constants';

import type KerNethalasItem from '../item/item';

import ActorSheetV2 = foundry.applications.sheets.ActorSheetV2;

const { HandlebarsApplicationMixin } = foundry.applications.api;

interface Context {
  leftSkills: Record<string, unknown>;
  rightSkills: Record<string, unknown>;
  enrichedPerksMadness: string;
  enrichedPerksPerks: string;
  enrichedPerksNotes: string;
  enrichedMechanicsActiveEvents: string;
  enrichedMechanicsOverseerInfluence: string;
  enrichedMechanicsNotes: string;
  lairDomainExitDie: number;
  currentGearCapacity: number;
  currentBackpackCapacity: number;
  currentPouch1Capacity: number;
  currentPouch2Capacity: number;
  currentPouch3Capacity: number;
  currentBeltCapacity: number;
  gearList: Item.Implementation[];
  backpackList: Item.Implementation[];
  nonEncumberingList: Item.Implementation[];
  pouch1List: Item.Implementation[];
  pouch2List: Item.Implementation[];
  pouch3List: Item.Implementation[];
  beltList: Item.Implementation[];
  equipment: {
    mainHand: Item.Implementation | null;
    offHand: Item.Implementation | null;
  };
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
      rollTensionDie: this.#rollTensionDie,
      resetTensionDie: this.#resetTensionDie,
      rollLairDomainExitDie: this.#rollLairDomainExitDie,
      resetLairDomainExitDie: this.#resetLairDomainExitDie,
      markOverseerFound: this.#markOverseerFound,
      removeItem: this.#removeItem,
      increaseQuantityItem: this.#increaseQuantityItem,
      decreaseQuantityItem: this.#decreaseQuantityItem,
      toggleExpand: this.#toggleExpand,
      editItem: this.#editItem,
      equipWeapon: this.#equipWeapon,
      swapWeapons: this.#swapWeapons,
    },
    dragDrop: [
      {
        dropSelector: '.gear-list, .backpack-list, .pouch1-list, .pouch2-list, .pouch3-list, .main-hand, .off-hand',
      },
    ],
  };

  static TABS = {
    primary: {
      initial: 'skills',
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

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.leftSkills = {};
    context.rightSkills = {};
    Object.entries(context.document.system.skills)
      .filter(([key, _value]) => SKILL_DISPLAY.left.includes(key))
      .forEach(([key, value]) => {
        context.leftSkills[key] = value;
      });

    Object.entries(context.document.system.skills)
      .filter(([key, _value]) => SKILL_DISPLAY.right.includes(key))
      .forEach(([key, value]) => {
        context.rightSkills[key] = value;
      });

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

    context.lairDomainExitDie = this.document.system.mechanics.lairDie ?? 0;
    if (this.document.system.mechanics.overseerFound) {
      context.lairDomainExitDie = this.document.system.mechanics.domainExitDie ?? 0;
    }

    context.gearList = this.actor.system.gearItems();
    context.backpackList = this.actor.system.backpackItems();
    context.pouch1List = this.actor.system.pouch1Items();
    context.pouch2List = this.actor.system.pouch2Items();
    context.pouch3List = this.actor.system.pouch3Items();
    context.beltList = this.actor.system.beltItems();
    // TODO V2: count coins, gems and special supplies
    context.currentGearCapacity = this.actor.system.currentGearCapacity();
    context.currentBackpackCapacity = this.actor.system.currentBackpackCapacity();
    context.nonEncumberingList = this.actor.system.nonEncumberingItems();
    context.currentPouch1Capacity = this.actor.system.currentPouch1Capacity();
    context.currentPouch2Capacity = this.actor.system.currentPouch2Capacity();
    context.currentPouch3Capacity = this.actor.system.currentPouch3Capacity();
    context.currentBeltCapacity = this.actor.system.currentBeltCapacity();

    context.equipment = this.actor.system.equipmentItems();

    return context;
  }

  async _onDragStart(event) {
    const target = event.currentTarget as HTMLElement;
    const row = target.closest<HTMLElement>('[data-uuid]');
    const itemId = row?.dataset.itemId ?? target.dataset.key;
    if (itemId && event.dataTransfer) {
      const item = this.actor.items.get(itemId);
      if (item) {
        const dragData = item.toDragData ? item.toDragData() : { type: 'Item', uuid: item.uuid };
        event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
      }
    }
    super._onDragStart(event);
  }

  // TODO: ?
  // async _onDrop(event) {
  //   const data = foundry.applications.ux.TextEditor.getDragEventData(event);
  //   if (!data) return;
  //   console.log('CharacterSheet _onDrop', event, data);

  //   // data.type = 'something';
  //   super._onDrop(event);

  //   // // If alt key is held down, we will delete the original document.
  //   // if (event.altKey) {
  //   //   // This is from Foundry. It will get the item data from the event.
  //   //   const TextEditor = foundry.applications.ux.TextEditor.implementation;
  //   //   const dragData = TextEditor.getDragEventData(event);
  //   //   // Make sure that we are dragging an item, otherwise this doesn't make sense.
  //   //   if (dragData.type === "Item") {
  //   //     const item = fromUuidSync(dragData.uuid);
  //   //     await item.delete();
  //   //   }
  //   // }
  // }

  async _onDropItem(event: DragEvent, item: KerNethalasItem) {
    const dropInGearList = !!(event.target as HTMLElement).closest('.gear-list');
    const dropInBackpackList = !!(event.target as HTMLElement).closest('.backpack-list');
    const dropInPouch1List = !!(event.target as HTMLElement).closest('.pouch1-list');
    const dropInPouch2List = !!(event.target as HTMLElement).closest('.pouch2-list');
    const dropInPouch3List = !!(event.target as HTMLElement).closest('.pouch3-list');
    const dropInBeltList = !!(event.target as HTMLElement).closest('.belt-list');
    const dropInMainHand = !!(event.target as HTMLElement).closest('.main-hand');
    const dropInOffHand = !!(event.target as HTMLElement).closest('.off-hand');

    const droppingOnHands = dropInMainHand || dropInOffHand;

    const sameActorItem = item?.parent?.id === this.actor.id;

    if (sameActorItem) {
      if (droppingOnHands) {
        const { result, message } = this.actor.system.canEquipWeapon(item);
        if (!result) {
          ui.notifications?.warn(message);
          return null;
        }

        if (dropInMainHand && this.actor.system.equipment.offHand === item.uuid) {
          await this.actor.update({ system: { equipment: { offHand: null } } });
        }

        if (dropInOffHand && this.actor.system.equipment.mainHand === item.uuid) {
          await this.actor.update({ system: { equipment: { mainHand: null } } });
        }

        const targetHand = dropInMainHand ? this.actor.system.equipment.mainHand : this.actor.system.equipment.offHand;
        if (targetHand && targetHand !== item.uuid) {
          ui.notifications?.warn(getLocalization().localize('KN.Error.handAlreadyOccupied'));
          return null;
        }

        return dropInMainHand ? this.actor.system.addToMainHand(item) : this.actor.system.addToOffHand(item);
      }

      if (item.system.weight === 'nonEncumbering') {
        ui.notifications?.warn(getLocalization().localize('KN.Error.nonEncumberingMoveSameActor'));
        return null;
      }

      if (dropInBackpackList) {
        if (!this.actor.system.canAddToBackpackList(item.system.slots())) {
          ui.notifications?.warn(getLocalization().localize('KN.Error.backpackCapacity'));
          return null;
        }
        return this.actor.system.moveItemToBackpack(item);
      }

      if (dropInGearList) {
        if (!this.actor.system.canAddToGearList(item.system.slots())) {
          ui.notifications?.warn(getLocalization().localize('KN.Error.gearCapacity'));
          return null;
        }
        return this.actor.system.moveItemToGear(item);
      }

      if (dropInPouch1List) {
        if (!this.actor.system.canAddToPouch1(item.system.slots())) {
          ui.notifications?.warn(getLocalization().localize('KN.Error.pouchCapacity'));
          return null;
        }
        return this.actor.system.moveItemToPouch1(item);
      }

      if (dropInPouch2List) {
        if (!this.actor.system.canAddToPouch2(item.system.slots())) {
          ui.notifications?.warn(getLocalization().localize('KN.Error.pouchCapacity'));
          return null;
        }
        return this.actor.system.moveItemToPouch2(item);
      }

      if (dropInPouch3List) {
        if (!this.actor.system.canAddToPouch3(item.system.slots())) {
          ui.notifications?.warn(getLocalization().localize('KN.Error.pouchCapacity'));
          return null;
        }
        return this.actor.system.moveItemToPouch3(item);
      }

      if (dropInBeltList) {
        if (!this.actor.system.canAddToBeltList()) {
          ui.notifications?.warn(getLocalization().localize('KN.Error.beltCapacity'));
          return null;
        }
        return this.actor.system.moveItemToBelt(item);
      }

      return null;
    }

    if (item.system.weight === 'nonEncumbering') {
      return super._onDropItem(event, item);
    }

    if (droppingOnHands) {
      const targetHand = dropInMainHand ? this.actor.system.equipment.mainHand : this.actor.system.equipment.offHand;
      if (targetHand) {
        ui.notifications?.warn(getLocalization().localize('KN.Error.handAlreadyOccupied'));
        return null;
      }

      const { result, message } = this.actor.system.canEquipWeapon(item);
      if (!result) {
        ui.notifications?.warn(message);
        return null;
      }

      const newItem = await super._onDropItem(event, item);
      if (!newItem) {
        return null;
      }

      return dropInMainHand ? this.actor.system.addToMainHand(newItem) : this.actor.system.addToOffHand(newItem);
    }

    if (dropInGearList) {
      return this._onDropGearList(event, item);
    }

    if (dropInBackpackList) {
      return this._onDropBackpackList(event, item);
    }

    if (dropInPouch1List) {
      return this._onDropPouch1(event, item);
    }

    if (dropInPouch2List) {
      return this._onDropPouch2(event, item);
    }

    if (dropInPouch3List) {
      return this._onDropPouch3(event, item);
    }

    if (dropInBeltList) {
      return this._onDropBelt(event, item);
    }

    // TODO: inventory ui
    // TODO: equip other items on hands
    // TODO V2: sorting
    // TODO: add armor
    // TODO: translations

    return null;
  }

  async _onDropGearList(event, item) {
    if (!this.actor.system.canAddToGearList(item.system.slots())) {
      ui.notifications?.warn(getLocalization().localize('KN.Error.gearCapacity'));
      return null;
    }
    const newItem = await super._onDropItem(event, item);
    if (!newItem) {
      return null;
    }
    return this.actor.system.addToGearList(newItem);
  }

  async _onDropBackpackList(event, item) {
    if (!this.actor.system.canAddToBackpackList(item.system.slots())) {
      ui.notifications?.warn(getLocalization().localize('KN.Error.backpackCapacity'));
      return null;
    }
    const newItem = await super._onDropItem(event, item);
    if (!newItem) {
      return null;
    }
    return this.actor.system.addToBackpackList(newItem);
  }

  async _onDropPouch1(event, item) {
    if (!this.actor.system.canAddToPouch1(item.system.slots())) {
      ui.notifications?.warn(getLocalization().localize('KN.Error.pouchCapacity'));
      return null;
    }
    const newItem = await super._onDropItem(event, item);
    if (!newItem) {
      return null;
    }
    return this.actor.system.addToPouch1(newItem);
  }

  async _onDropPouch2(event, item) {
    if (!this.actor.system.canAddToPouch2(item.system.slots())) {
      ui.notifications?.warn(getLocalization().localize('KN.Error.pouchCapacity'));
      return null;
    }
    const newItem = await super._onDropItem(event, item);
    if (!newItem) {
      return null;
    }
    return this.actor.system.addToPouch2(newItem);
  }

  async _onDropPouch3(event, item) {
    if (!this.actor.system.canAddToPouch3(item.system.slots())) {
      ui.notifications?.warn(getLocalization().localize('KN.Error.pouchCapacity'));
      return null;
    }
    const newItem = await super._onDropItem(event, item);
    if (!newItem) {
      return null;
    }
    return this.actor.system.addToPouch3(newItem);
  }

  async _onDropBelt(event, item) {
    if (!this.actor.system.canAddToBeltList()) {
      ui.notifications?.warn(getLocalization().localize('KN.Error.beltCapacity'));
      return null;
    }
    const newItem = await super._onDropItem(event, item);
    if (!newItem) {
      return null;
    }
    return this.actor.system.addToBeltList(newItem);
  }

  static async #rollTensionDie(this, event, _target) {
    event.preventDefault();
    await this.actor.rollTensionDie();
  }

  static async #resetTensionDie(this, event, _target) {
    event.preventDefault();
    await this.actor.resetTensionDie();
  }

  static async #rollLairDomainExitDie(this, event, _target) {
    event.preventDefault();
    await this.actor.rollLairDomainExitDie();
  }

  static async #resetLairDomainExitDie(this, event, _target) {
    event.preventDefault();
    await this.actor.resetLairDomainExitDie();
  }

  static async #markOverseerFound(this, event, _target) {
    event.preventDefault();
    const checkbox = event.currentTarget as HTMLInputElement;
    await this.actor.markOverseerFound(checkbox.checked);
  }

  static async #rollSkill(this, event: PointerEvent) {
    event.preventDefault();
    const button = event.target as HTMLElement;
    const { key } = button.dataset;
    if (!key) {
      return;
    }

    if (!event.ctrlKey && !event.shiftKey) {
      await this.actor.rollSkill(key, 0);
      return;
    }

    const content = await foundry.applications.handlebars.renderTemplate(TEMPLATES.modifyRoll, {
      originalValue: this.actor.system.skills[key].value,
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
          await this.actor.rollSkill(key, Number(value));
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
              await this.actor.rollSkill(key, 0);
              return;
            }
            await this.actor.rollSkill(key, Number(`${plusOrMinus}${valueModifier}`));
          },
        },
      ],
    }).render({ force: true });
  }

  static async #removeItem(this, event, target) {
    event.preventDefault();
    const { key } = target.dataset;
    const item = this.actor.getEmbeddedDocument('Item', key, {});
    if (!item) {
      return;
    }
    await this.actor.system.removeItemFromLists(item.uuid);
    await this.actor.deleteEmbeddedDocuments('Item', [key]);
  }

  static async #increaseQuantityItem(this, event, target) {
    event.preventDefault();
    const { key } = target.dataset;
    const item = this.actor.getEmbeddedDocument('Item', key, {});
    if (!item || item.system.quantity === 10) {
      return;
    }
    const newQuantity = (item.system.quantity ?? 0) + 1;
    await item.update({ system: { quantity: newQuantity } });
  }

  static async #decreaseQuantityItem(this, event, target) {
    event.preventDefault();
    const { key } = target.dataset;
    const item = this.actor.getEmbeddedDocument('Item', key, {});
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
    const item = this.actor.getEmbeddedDocument('Item', key, {});
    if (!item) {
      return;
    }
    item.sheet?.render(true);
  }

  static async #equipWeapon(this, event: PointerEvent, target: HTMLElement) {
    event.preventDefault();
    const { key } = target.dataset;
    if (!key) {
      return;
    }
    const item = this.actor.getEmbeddedDocument('Item', key, {});
    if (!item) {
      return;
    }

    const { result, message } = this.actor.system.canEquipWeapon(item);
    if (!result) {
      ui.notifications?.warn(message);
      return;
    }

    if (!this.actor.system.equipment.mainHand) {
      await this.actor.system.addToMainHand(item);
      return;
    }

    if (!this.actor.system.equipment.offHand) {
      await this.actor.system.addToOffHand(item);
      return;
    }

    ui.notifications?.warn(getLocalization().localize('KN.Error.bothHandsEquipped'));
  }

  static async #swapWeapons(this, event, _target) {
    event.preventDefault();
    await this.actor.system.swapMainToOffHand();
  }
}
