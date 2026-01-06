import { TEMPLATES } from '../constants';

import type KerNethalasItem from '../item/item';

import ItemSheetV2 = foundry.applications.sheets.ItemSheetV2;

const { HandlebarsApplicationMixin } = foundry.applications.api;

interface Context {
  enrichedDescription: string;
  enrichedNotes: string;
}

export default class KNArmorSheet<
  RenderContext extends ItemSheetV2.RenderContext & Context,
  Configuration extends ItemSheetV2.Configuration = ItemSheetV2.Configuration,
  RenderOptions extends ItemSheetV2.RenderOptions = ItemSheetV2.RenderOptions,
> extends HandlebarsApplicationMixin(ItemSheetV2)<RenderContext, Configuration, RenderOptions> {
  static DEFAULT_OPTIONS = {
    window: { resizable: true },
    position: { width: 520, height: 600 },
    classes: ['item', 'armor'],
    form: { submitOnChange: true },
    tag: 'form',
    actions: {},
  };

  static TABS = {
    primary: {
      initial: 'details',
      labelPrefix: 'KN.Item.Tabs',
      tabs: [{ id: 'details' }, { id: 'notes' }],
    },
  };

  static PARTS = {
    header: {
      template: TEMPLATES.armor.header,
    },
    tabs: {
      template: `templates/generic/tab-navigation.hbs`, // From FoundryVTT
    },
    details: {
      template: TEMPLATES.armor.detailsTab,
    },
    notes: {
      template: TEMPLATES.armor.notesTab,
    },
  };

  override get document(): KerNethalasItem<'armor'> {
    if (!super.document.isArmor()) {
      throw new Error('Item is not armor');
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

    return context;
  }
}
