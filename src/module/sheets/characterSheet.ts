import { TEMPLATES, SKILLS } from '../constants';

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
}

// TODO: complete
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
      roll: this.onRoll,
      rollTensionDie: this.#rollTensionDie,
      resetTensionDie: this.#resetTensionDie,
      rollLairDomainExitDie: this.#rollLairDomainExitDie,
      resetLairDomainExitDie: this.#resetLairDomainExitDie,
      markOverseerFound: this.#markOverseerFound,
    },
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

  static onRoll(event: PointerEvent) {
    event.preventDefault();
    console.log('event', event);
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.leftSkills = {};
    context.rightSkills = {};
    Object.entries(context.document.system.skills)
      .filter(([key, _value]) => SKILLS.left.includes(key))
      .forEach(([key, value]) => {
        context.leftSkills[key] = value;
      });

    Object.entries(context.document.system.skills)
      .filter(([key, _value]) => SKILLS.right.includes(key))
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

    console.log('context', context, this.actor);

    // // Prepare items.
    // this._prepareCharacterItems(context);

    // context.showHyperGeometrySection = this.shouldShowHyperGeometrySection(
    //   this.actor,
    // );

    // // Prepare subname info placeholder.
    // context.subnameInfoPlaceholder = this._prepareSubnameInfoPlaceholder();

    // // Prepare descriptions for each sheet.
    // context.enrichedDescription = await this._prepareDescriptions();

    // // Early return if this is a vehicle.
    // if (this.actor.type === "vehicle") return context;

    // // Provide the sheet context sorted skills.
    // this._sortSkills();
    // this._sortCustomSkills();

    // // Wether to hide skill tooltips
    // context.hideSkillTooltips = game.settings.get(
    //   "deltagreen",
    //   "hideSkillTooltips",
    // );

    // if (!context.hideSkillTooltips) {
    //   // Setup tooltips
    //   this._prepareSkillTooltips();
    // }

    // // Handle private sanity setting, override for GMs.
    // const keepSanityPrivate = game.settings.get(
    //   "deltagreen",
    //   "keepSanityPrivate",
    // );
    // const hideSan = keepSanityPrivate && !game.user.isGM;

    // context.maxSan = hideSan ? "???" : this.actor.system.sanity.max;
    // context.currentSan = hideSan ? "???" : this.actor.system.sanity.value;
    // context.keepSanityPrivate = keepSanityPrivate;

    // // Set sanity block per actor type.
    // context.sanityInputs = await foundry.applications.handlebars.renderTemplate(
    //   `${DGActorSheet.TEMPLATE_PATH}/partials/sanity-${this.actor.type}.html`,
    //   context,
    // );

    // // Set title for Physical Attributes.
    // context.physicalAttributesTitle = game.i18n.localize(
    //   "DG.Sheet.BlockHeaders.Statistics",
    // );

    // // Whether to append the notes section to the skills.
    // context.showNotesInSkills = this.actor.type !== "agent";

    return context;
  }

  static async #rollTensionDie(this, event, _target) {
    event.preventDefault();
    await this.actor.rollTensionDie();
    this.render();
  }

  static async #resetTensionDie(this, event, _target) {
    event.preventDefault();
    this.actor.resetTensionDie();
    this.render();
  }

  static async #rollLairDomainExitDie(this, event, _target) {
    event.preventDefault();
    await this.actor.rollLairDomainExitDie();
    this.render();
  }

  static async #resetLairDomainExitDie(this, event, _target) {
    event.preventDefault();
    this.actor.resetLairDomainExitDie();
    this.render();
  }

  static async #markOverseerFound(this, event, _target) {
    event.preventDefault();
    const checkbox = event.currentTarget as HTMLInputElement;
    this.actor.markOverseerFound(checkbox.checked);
    this.render();
  }
}
