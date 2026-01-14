import { getLocalization } from '../helpers';
import { HIT_LOCATIONS, HIT_LOCATION_TABLES, TEMPLATES } from '../constants';

import type KerNethalasActor from '../actor/actor';

import ActorSheetV2 = foundry.applications.sheets.ActorSheetV2;

const { HandlebarsApplicationMixin } = foundry.applications.api;

interface Context {
  enrichedDescription: string;
  enrichedNotes: string;
  enrichedLevelAdaptation: string;
  weakSpotOptions: { value: string; label: string }[];
  showWeakSpotInput: boolean;
  actions: {
    startDie: number;
    endDie: number;
    name: string;
    description: string;
    enrichedDescription: string;
  }[];
}

export default class MonsterSheet<
  RenderContext extends ActorSheetV2.RenderContext & Context,
  Configuration extends ActorSheetV2.Configuration = ActorSheetV2.Configuration,
  RenderOptions extends ActorSheetV2.RenderOptions = ActorSheetV2.RenderOptions,
> extends HandlebarsApplicationMixin(ActorSheetV2)<RenderContext, Configuration, RenderOptions> {
  static DEFAULT_OPTIONS = {
    window: { resizable: true },
    position: { width: 750, height: 770 },
    classes: ['actor', 'monster'],
    form: { submitOnChange: true },
    tag: 'form',
    actions: {
      addAction: this.#addAction,
      deleteAction: this.#deleteAction,
      rollActions: this.#rollActions,
      rollAttribute: this.#rollAttribute,
      rollHitLocation: this.#rollHitLocation,
    },
  };

  static TABS = {
    primary: {
      initial: 'details',
      labelPrefix: 'KN.Monster.Tabs',
      tabs: [{ id: 'details' }, { id: 'notes' }],
    },
  };

  static PARTS = {
    header: {
      template: TEMPLATES.monster.header,
    },
    tabs: {
      template: `templates/generic/tab-navigation.hbs`, // From FoundryVTT
    },
    details: {
      template: TEMPLATES.monster.detailsTab,
      scrollable: [''], // needed to keep scroll position when re-rendering
    },
    notes: {
      template: TEMPLATES.monster.notesTab,
      scrollable: [''], // needed to keep scroll position when re-rendering
    },
  };

  override get document(): KerNethalasActor<'monster'> {
    if (!super.document.isMonster()) {
      throw new Error('Actor is not a monster');
    }
    return super.document;
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.document.system.description,
      {
        secrets: this.document.isOwner,
        relativeTo: this.document,
      },
    );

    context.enrichedNotes = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.document.system.notes,
      {
        secrets: this.document.isOwner,
        relativeTo: this.document,
      },
    );

    context.enrichedLevelAdaptation = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.document.system.levelAdaptation,
      {
        secrets: this.document.isOwner,
        relativeTo: this.document,
      },
    );

    context.actions = await Promise.all(
      this.document.system.actions.map(async (action) => ({
        name: action.name,
        description: action.description,
        startDie: action.startDie ?? 1,
        endDie: action.endDie ?? 2,
        enrichedDescription: await foundry.applications.ux.TextEditor.implementation.enrichHTML(action.description, {
          secrets: this.document.isOwner,
          relativeTo: this.document,
        }),
      })),
    );

    switch (this.document.system.hitLocation) {
      case HIT_LOCATIONS.arachnid:
        context.weakSpotOptions = [
          { value: 'none', label: '' },
          ...HIT_LOCATION_TABLES[HIT_LOCATIONS.arachnid].map((hl) => ({
            value: hl.location,
            label: getLocalization().localize(`KN.Monster.Sheet.weakSpot.option.${hl.location}`),
          })),
        ];
        break;
      case HIT_LOCATIONS.humanoid:
        context.weakSpotOptions = [
          { value: 'none', label: '' },
          ...HIT_LOCATION_TABLES[HIT_LOCATIONS.humanoid].map((hl) => ({
            value: hl.location,
            label: getLocalization().localize(`KN.Monster.Sheet.weakSpot.option.${hl.location}`),
          })),
        ];
        break;
      case HIT_LOCATIONS.insectoid:
        context.weakSpotOptions = [
          { value: 'none', label: '' },
          ...HIT_LOCATION_TABLES[HIT_LOCATIONS.insectoid].map((hl) => ({
            value: hl.location,
            label: getLocalization().localize(`KN.Monster.Sheet.weakSpot.option.${hl.location}`),
          })),
        ];
        break;
      case HIT_LOCATIONS.quadruped:
        context.weakSpotOptions = [
          { value: 'none', label: '' },
          ...HIT_LOCATION_TABLES[HIT_LOCATIONS.quadruped].map((hl) => ({
            value: hl.location,
            label: getLocalization().localize(`KN.Monster.Sheet.weakSpot.option.${hl.location}`),
          })),
        ];
        break;
      case HIT_LOCATIONS.serpentoid:
        context.weakSpotOptions = [
          { value: 'none', label: '' },
          ...HIT_LOCATION_TABLES[HIT_LOCATIONS.serpentoid].map((hl) => ({
            value: hl.location,
            label: getLocalization().localize(`KN.Monster.Sheet.weakSpot.option.${hl.location}`),
          })),
        ];
        break;
      case HIT_LOCATIONS.winged:
        context.weakSpotOptions = [
          { value: 'none', label: '' },
          ...HIT_LOCATION_TABLES[HIT_LOCATIONS.winged].map((hl) => ({
            value: hl.location,
            label: getLocalization().localize(`KN.Monster.Sheet.weakSpot.option.${hl.location}`),
          })),
        ];
        break;
      default:
        context.weakSpotOptions = [];
        return context;
    }

    context.showWeakSpotInput = true;

    return context;
  }

  static async #addAction(this, event: PointerEvent) {
    event.preventDefault();
    await this.actor.system.addAction();
  }

  static async #deleteAction(this, event: PointerEvent) {
    event.preventDefault();
    const button = event.target as HTMLElement;
    const { index } = button.dataset;
    if (!index) {
      return;
    }
    await this.actor.system.deleteAction(index);
  }

  static async #rollActions(this, event: PointerEvent) {
    event.preventDefault();
    await this.actor.rollActions();
  }

  static async #rollHitLocation(this, event: PointerEvent) {
    event.preventDefault();
    await this.actor.rollHitLocation();
  }

  static async #rollAttribute(this, event: PointerEvent) {
    event.preventDefault();
    const button = event.target as HTMLElement;
    const { key } = button.dataset;
    if (!key) {
      return;
    }

    if (!event.ctrlKey && !event.shiftKey) {
      await this.actor.rollAttribute(key, 0);
      return;
    }

    const content = await foundry.applications.handlebars.renderTemplate(TEMPLATES.modifyRoll, {
      originalValue: this.actor.system.attributes[key],
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
          await this.actor.rollAttribute(key, Number(value));
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
              await this.actor.rollAttribute(key, 0);
              return;
            }
            await this.actor.rollAttribute(key, Number(`${plusOrMinus}${valueModifier}`));
          },
        },
      ],
    }).render({ force: true });
  }
}
