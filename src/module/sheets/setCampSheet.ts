import { getLocalization } from '../helpers';
import { TEMPLATES } from '../constants';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export default class SetCampSheet extends HandlebarsApplicationMixin(ApplicationV2) {
  resultFunction: (result: {
    cookingSupplies: number;
    rations: number;
    craftingSupplies: number;
    exhaustionIncreases: number;
    exhaustionDecreases: number;
    modifier: number;
  }) => Promise<void>;

  formData: {
    currentCookingSupplies: number;
    cooking: number;
    useRation: boolean;
    currentRations: number;
    attune: number;
    barricade: number;
    bandages: number;
    lampOil: number;
    lockpicks: number;
    torches: number;
    repair: number;
    healCondition: number;
    sleep: boolean;
    currentCraftingSupplies: number;
    exhaustionIncreases: number;
    exhaustionDecreases1: number;
    exhaustionDecreases2: number;
    health1: number;
    health2: number;
    modifier: number;
  } = {
    currentCookingSupplies: 0,
    cooking: 0,
    useRation: false,
    currentRations: 0,
    attune: 0,
    barricade: 0,
    bandages: 0,
    lampOil: 0,
    lockpicks: 0,
    torches: 0,
    repair: 0,
    healCondition: 0,
    sleep: false,
    currentCraftingSupplies: 0,
    exhaustionIncreases: 0,
    exhaustionDecreases1: 0,
    exhaustionDecreases2: 5,
    health1: 0,
    health2: 0,
    modifier: 0,
  };

  constructor(options, { resultFunction, currentRations, currentCraftingSupplies, currentCookingSupplies }) {
    super(options);
    this.resultFunction = resultFunction;
    this.formData.currentRations = currentRations;
    this.formData.currentCraftingSupplies = currentCraftingSupplies;
    this.formData.currentCookingSupplies = currentCookingSupplies;
  }

  static DEFAULT_OPTIONS = {
    classes: ['set-camp-roll'],
    tag: 'form',
    position: { width: 460, height: 650 },
    window: { resizable: true },
    form: { submitOnChange: true, handler: this.#onSubmitForm },
    actions: {
      roll: this.#roll,
      cancel: this.#cancel,
    },
  };

  static PARTS = {
    content: {
      template: TEMPLATES.setCampRoll,
      scrollable: [''], // needed to keep scroll position when re-rendering
    },
  };

  get title() {
    return getLocalization().localize('KN.SetCamp.title');
  }

  async _prepareContext(options) {
    let rollModifier = '';
    if (this.formData.modifier !== 0) {
      rollModifier =
        this.formData.modifier > 0 ? ` + ${this.formData.modifier}` : ` - ${Math.abs(this.formData.modifier)}`;
    }

    const parentContext = await super._prepareContext(options);
    return foundry.utils.mergeObject(parentContext, {
      rollModifier,
      ...this.formData,
      rations: this.formData.currentRations + this.formData.cooking,
      craftingSupplies: this.formData.currentCraftingSupplies,
      cookingSupplies: this.formData.currentCookingSupplies,
      exhaustionIncreases: this.formData.exhaustionIncreases,
    });
  }

  static #onSubmitForm(this, event: Event) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const entries = Object.fromEntries(formData.entries());
    this.formData = foundry.utils.mergeObject(this.formData, {
      ...entries,
      useRation: Boolean(entries.useRation),
      sleep: Boolean(entries.sleep),
    });

    this.formData.useRation = Boolean(this.formData.useRation);
    this.formData.cooking = Number(this.formData.cooking);
    this.formData.attune = Number(this.formData.attune);
    this.formData.barricade = Number(this.formData.barricade);
    this.formData.bandages = Number(this.formData.bandages);
    this.formData.lampOil = Number(this.formData.lampOil);
    this.formData.lockpicks = Number(this.formData.lockpicks);
    this.formData.torches = Number(this.formData.torches);
    this.formData.repair = Number(this.formData.repair);
    this.formData.healCondition = Number(this.formData.healCondition);
    this.formData.sleep = Boolean(this.formData.sleep);
    this.formData.exhaustionIncreases = 0;
    this.formData.exhaustionDecreases1 = 0;
    this.formData.exhaustionDecreases2 = 5;
    this.formData.health1 = 0;
    this.formData.health2 = 0;
    this.formData.modifier = 0;
    if (this.formData.sleep) {
      this.formData.cooking = 0;
      this.formData.attune = 0;
      this.formData.bandages = 0;
      this.formData.lampOil = 0;
      this.formData.lockpicks = 0;
      this.formData.torches = 0;
      this.formData.repair = 0;
      this.formData.healCondition = 0;
      this.formData.exhaustionDecreases1 += 5;
      this.formData.health1 += 1;
      this.formData.modifier += 2;
    }
    if (this.formData.useRation) {
      this.formData.exhaustionDecreases2 += 5;
      this.formData.health2 += 1;
    }

    if (this.formData.cooking > this.formData.currentCookingSupplies) {
      this.formData.cooking = this.formData.currentCookingSupplies;
    }
    if (
      this.formData.barricade +
        this.formData.bandages +
        this.formData.lampOil * 2 +
        this.formData.lockpicks +
        this.formData.torches +
        this.formData.repair * 2 >
      this.formData.currentCraftingSupplies
    ) {
      let remainingSupplies = this.formData.currentCraftingSupplies;
      this.formData.barricade = Math.min(this.formData.barricade, remainingSupplies);
      remainingSupplies -= this.formData.barricade;
      this.formData.bandages = Math.min(this.formData.bandages, remainingSupplies);
      remainingSupplies -= this.formData.bandages;
      this.formData.lampOil = Math.min(this.formData.lampOil, Math.floor(remainingSupplies / 2));
      remainingSupplies -= this.formData.lampOil * 2;
      this.formData.lockpicks = Math.min(this.formData.lockpicks, remainingSupplies);
      remainingSupplies -= this.formData.lockpicks;
      this.formData.torches = Math.min(this.formData.torches, remainingSupplies);
      remainingSupplies -= this.formData.torches;
      this.formData.repair = Math.min(this.formData.repair, Math.floor(remainingSupplies / 2));
    }

    if (this.formData.cooking > 0) {
      this.formData.exhaustionIncreases += 1;
      this.formData.modifier -= 1;
    }
    if (this.formData.barricade > 0) {
      this.formData.exhaustionIncreases += this.formData.barricade;
      this.formData.modifier += this.formData.barricade * 5;
    }
    if (this.formData.attune > 0) {
      this.formData.exhaustionIncreases += this.formData.attune;
    }
    if (this.formData.bandages > 0) {
      this.formData.exhaustionIncreases += 1;
      this.formData.modifier -= 1;
    }
    if (this.formData.lampOil > 0) {
      this.formData.exhaustionIncreases += 1;
      this.formData.modifier -= 2;
    }
    if (this.formData.lockpicks > 0) {
      this.formData.exhaustionIncreases += 1;
      this.formData.modifier -= 2;
    }
    if (this.formData.torches > 0) {
      this.formData.exhaustionIncreases += 1;
      this.formData.modifier -= 2;
    }
    if (this.formData.repair > 0) {
      this.formData.exhaustionIncreases += 2;
      this.formData.modifier -= 2;
    }
    if (this.formData.healCondition > 0) {
      this.formData.exhaustionIncreases += this.formData.healCondition;
    }

    this.render();
  }

  static async #roll(this, event: Event) {
    event.preventDefault();

    await this.resultFunction({
      cookingSuppliesDecreases: this.formData.cooking,
      rationsDecreases: -this.formData.cooking + (this.formData.useRation ? 1 : 0),
      craftingSuppliesDecreases:
        this.formData.barricade +
        this.formData.bandages +
        this.formData.lampOil * 2 +
        this.formData.lockpicks +
        this.formData.torches +
        this.formData.repair * 2,
      exhaustionIncreases: this.formData.exhaustionIncreases,
      exhaustionDecreases1: this.formData.exhaustionDecreases1,
      exhaustionDecreases2: this.formData.exhaustionDecreases2,
      healthIncreases1: this.formData.health1,
      healthIncreases2: this.formData.health2,
      modifier: this.formData.modifier,
      useRation: this.formData.useRation,
    });
  }

  static #cancel(this, event: Event) {
    event.preventDefault();
    this.close();
  }
}
