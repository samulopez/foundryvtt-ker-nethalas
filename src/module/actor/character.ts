import { TEMPLATES } from '../constants';

export default class KerNethalasCharacterActor extends Actor<'character'> {
  async rollTensionDie() {
    const dieSize = this.system.mechanics.tensionDie;
    if (!dieSize) {
      return;
    }

    const roll = new Roll(`1d${dieSize}`);
    await roll.evaluate();

    let resultString = 'Pass';
    let customClass = '';

    if ((roll.total ?? 100) <= 2) {
      resultString = 'Tension Die decreases';
      customClass = 'failure-text';
      this.system.mechanics.tensionDie = dieSize - 2;
      if (dieSize === 4) {
        resultString = 'Growing Darkness Event Triggered!';
        this.system.mechanics.tensionDie = 8;
      }
    }

    const html = await foundry.applications.handlebars.renderTemplate(TEMPLATES.usageDieRoll, {
      resultString,
      customClass,
      formula: roll.formula,
      total: roll.total,
    });

    roll.toMessage({
      content: html,
      flavor: 'Tension Die check',
    });
  }

  resetTensionDie() {
    this.system.mechanics.tensionDie = 8;
  }

  resetLairDomainExitDie() {
    this.system.mechanics.lairDie = 10;
    this.system.mechanics.domainExitDie = 8;
    this.system.mechanics.overseerFound = false;
  }

  async rollLairDomainExitDie() {
    if (this.system.mechanics.overseerFound) {
      return this.rollDomainExitDie();
    }
    return this.rollLairDie();
  }

  async rollDomainExitDie() {
    const dieSize = this.system.mechanics.domainExitDie;
    if (!dieSize) {
      return;
    }

    const roll = new Roll(`1d${dieSize}`);
    await roll.evaluate();

    let resultString = 'Domain exit not found';
    let customClass = '';

    if ((roll.total ?? 100) <= 2) {
      resultString = 'Domain exit die decreases';
      customClass = 'success-text';
      this.system.mechanics.domainExitDie = dieSize - 2;
      if (dieSize === 4) {
        resultString = 'Domain exit found!';
        this.system.mechanics.domainExitDie = 8;
      }
    }

    const html = await foundry.applications.handlebars.renderTemplate(TEMPLATES.usageDieRoll, {
      resultString,
      customClass,
      formula: roll.formula,
      total: roll.total,
    });

    roll.toMessage({
      content: html,
      flavor: 'Domain Exit check',
    });
  }

  async rollLairDie() {
    const dieSize = this.system.mechanics.lairDie;
    if (!dieSize) {
      return;
    }

    const roll = new Roll(`1d${dieSize}`);
    await roll.evaluate();

    let resultString = 'Lair not found';
    let customClass = '';

    if ((roll.total ?? 100) <= 2) {
      resultString = 'Lair die decreases';
      customClass = 'success-text';
      this.system.mechanics.lairDie = dieSize - 2;
      if (dieSize === 4) {
        resultString = 'Lair found!';
        this.system.mechanics.lairDie = 10;
        this.system.mechanics.overseerFound = true;
        this.system.mechanics.domainExitDie = 8;
      }
    }

    const html = await foundry.applications.handlebars.renderTemplate(TEMPLATES.usageDieRoll, {
      resultString,
      customClass,
      formula: roll.formula,
      total: roll.total,
    });

    roll.toMessage({
      content: html,
      flavor: 'Lair check',
    });
  }

  markOverseerFound(found: boolean) {
    this.resetLairDomainExitDie();
    this.system.mechanics.overseerFound = found;
  }
}
