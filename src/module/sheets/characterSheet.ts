import { TEMPLATE_PATH, SKILLS } from '../constants';

import ActorSheetV2 = foundry.applications.sheets.ActorSheetV2;

const { HandlebarsApplicationMixin } = foundry.applications.api;

interface Context {
  leftSkills: Record<string, unknown>;
  rightSkills: Record<string, unknown>;
  enrichedPerksMadness: string;
  enrichedPerksPerks: string;
  enrichedPerksNotes: string;
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
      template: `${TEMPLATE_PATH}/character/header.hbs`,
    },
    tabs: {
      template: `templates/generic/tab-navigation.hbs`, // From FoundryVTT
    },
    skills: {
      template: `${TEMPLATE_PATH}/character/skills-tab.hbs`,
    },
    perks: {
      template: `${TEMPLATE_PATH}/character/perks-tab.hbs`,
    },
    inventory: {
      template: `${TEMPLATE_PATH}/character/inventory-tab.hbs`,
    },
    mechanics: {
      template: `${TEMPLATE_PATH}/character/mechanics-tab.hbs`,
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

    console.log('context', context);

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
}
