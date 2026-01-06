import { TEMPLATES } from '../constants';

import ItemSheetV2 = foundry.applications.sheets.ItemSheetV2;

const { HandlebarsApplicationMixin } = foundry.applications.api;

interface Context {
  enrichedDescription: string;
  enrichedNotes: string;
}

export default class KNWeaponSheet<
  RenderContext extends ItemSheetV2.RenderContext & Context,
  Configuration extends ItemSheetV2.Configuration = ItemSheetV2.Configuration,
  RenderOptions extends ItemSheetV2.RenderOptions = ItemSheetV2.RenderOptions,
> extends HandlebarsApplicationMixin(ItemSheetV2)<RenderContext, Configuration, RenderOptions> {
  static DEFAULT_OPTIONS = {
    window: { resizable: true },
    position: { width: 520, height: 600 },
    classes: ['item', 'weapon'],
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
      template: TEMPLATES.weapon.header,
    },
    tabs: {
      template: `templates/generic/tab-navigation.hbs`, // From FoundryVTT
    },
    details: {
      template: TEMPLATES.weapon.detailsTab,
    },
    notes: {
      template: TEMPLATES.weapon.notesTab,
    },
  };

  override get document(): Item.OfType<'weapon'> {
    if (!super.item.isWeapon()) {
      throw new Error('Item is not weapon');
    }
    return super.item;
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
