import { getLocalization } from '../helpers';
import { HIT_LOCATIONS, TEMPLATES } from '../constants';

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
    },
    notes: {
      template: TEMPLATES.monster.notesTab,
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
          { value: 'rightRearLeg', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.rightRearLeg') },
          { value: 'leftRearLeg', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.leftRearLeg') },
          { value: 'rightMidLeg', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.rightMidLeg') },
          { value: 'leftMidLeg', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.leftMidLeg') },
          { value: 'rightForeLeg', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.rightForeLeg') },
          { value: 'leftForeLeg', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.leftForeLeg') },
          { value: 'abdomen', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.abdomen') },
          {
            value: 'rightFrontLeg',
            label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.rightFrontLeg'),
          },
          { value: 'leftFrontLeg', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.leftFrontLeg') },
          {
            value: 'cephalothorax',
            label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.cephalothorax'),
          },
        ];
        break;
      case HIT_LOCATIONS.humanoid:
        context.weakSpotOptions = [
          { value: 'none', label: '' },
          { value: 'rightLeg', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.rightLeg') },
          { value: 'leftLeg', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.leftLeg') },
          { value: 'abdomen', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.abdomen') },
          { value: 'chest', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.chest') },
          { value: 'leftArm', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.leftArm') },
          { value: 'rightArm', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.rightArm') },
          { value: 'head', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.head') },
        ];
        break;
      case HIT_LOCATIONS.insectoid:
        context.weakSpotOptions = [
          { value: 'none', label: '' },
          { value: 'rightRearLeg', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.rightRearLeg') },
          { value: 'leftRearLeg', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.leftRearLeg') },
          { value: 'rightMidLeg', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.rightMidLeg') },
          { value: 'leftMidLeg', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.leftMidLeg') },
          { value: 'abdomen', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.abdomen') },
          { value: 'thorax', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.thorax') },
          {
            value: 'rightFrontLeg',
            label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.rightFrontLeg'),
          },
          { value: 'leftFrontLeg', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.leftFrontLeg') },
          { value: 'head', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.head') },
        ];
        break;
      case HIT_LOCATIONS.quadruped:
        context.weakSpotOptions = [
          { value: 'none', label: '' },
          { value: 'rightHindLeg', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.rightHindLeg') },
          { value: 'leftHindLeg', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.leftHindLeg') },
          { value: 'hindquarters', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.hindquarters') },
          { value: 'forequarters', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.forequarters') },
          {
            value: 'rightFrontLeg',
            label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.rightFrontLeg'),
          },
          { value: 'leftFrontLeg', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.leftFrontLeg') },
          { value: 'head', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.head') },
        ];
        break;
      case HIT_LOCATIONS.serpentoid:
        context.weakSpotOptions = [
          { value: 'none', label: '' },
          { value: 'body', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.body') },
          { value: 'head', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.head') },
        ];
        break;
      case HIT_LOCATIONS.winged:
        context.weakSpotOptions = [
          { value: 'none', label: '' },
          { value: 'rightLeg', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.rightLeg') },
          { value: 'leftLeg', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.leftLeg') },
          { value: 'abdomen', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.abdomen') },
          { value: 'chest', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.chest') },
          { value: 'rightWing', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.rightWing') },
          { value: 'leftWing', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.leftWing') },
          { value: 'rightArm', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.rightArm') },
          { value: 'leftArm', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.leftArm') },
          { value: 'head', label: getLocalization().localize('KN.Monster.Sheet.weakSpot.option.head') },
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
}
