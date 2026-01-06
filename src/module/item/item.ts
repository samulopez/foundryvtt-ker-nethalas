import { getGame, getLocalization } from '../helpers';
import { TEMPLATES } from '../constants';

export default class KerNethalasItem<out SubType extends Item.SubType = Item.SubType> extends Item<SubType> {
  constructor(data: Item.CreateData<SubType>, context?: Item.ConstructionContext) {
    const newData = data;
    if (!newData.img) {
      if (newData.type === 'weapon') {
        newData.img = 'icons/svg/sword.svg';
      }
      if (newData.type === 'armor') {
        newData.img = 'icons/svg/shield.svg';
      }
    }

    super(newData, context);

    if (newData.type === 'weapon' || newData.type === 'armor') {
      this.updateSource({ system: { equippable: true } });
    }
  }

  async rollArmorIntegrity(): Promise<string> {
    if (!this.isArmor()) {
      throw new Error('Item is not armor');
    }
    const { broken, currentIntegrity } = this.system;
    if (broken || !currentIntegrity) {
      return getLocalization().localize('KN.Error.armorBroken');
    }

    const roll = new Roll(`1d${currentIntegrity}`);
    await roll.evaluate();

    let resultString = getLocalization().localize('KN.Error.armorIntegrityCheck.noEffect');
    let customClass = '';

    if ((roll.total ?? 100) <= 2) {
      resultString = getLocalization().localize('KN.Error.armorIntegrityCheck.decreases');
      customClass = 'failure-text';
      switch (currentIntegrity) {
        case 20:
          this.system.currentIntegrity = 12;
          break;
        case 4:
          break;
        default:
          this.system.currentIntegrity = currentIntegrity - 2;
      }
      if (currentIntegrity === 4) {
        resultString = getLocalization().localize('KN.Error.armorIntegrityCheck.broken');
        this.system.broken = true;
      }
    }

    const html = await foundry.applications.handlebars.renderTemplate(TEMPLATES.usageDieRoll, {
      resultString,
      customClass,
      formula: roll.formula,
      total: roll.total,
    });

    const message = await roll.toMessage({
      content: html,
      flavor: getLocalization().localize('KN.Error.armorIntegrityCheck.title'),
    });

    const diceSoNice = getGame().modules.has('dice-so-nice') && getGame().modules.get('dice-so-nice')?.active;
    if (diceSoNice && message) {
      await getGame().dice3d?.waitFor3DAnimationByMessageID(message.id);
    }
    await this.update({
      system: {
        currentIntegrity: this.system.currentIntegrity,
        broken: this.system.broken,
      },
    });

    return '';
  }

  isArmor(): this is KerNethalasItem<'armor'> {
    return this.type === 'armor';
  }

  isWeapon(): this is KerNethalasItem<'weapon'> {
    return this.type === 'weapon';
  }

  isItem(): this is KerNethalasItem<'item'> {
    return this.type === 'item';
  }
}
