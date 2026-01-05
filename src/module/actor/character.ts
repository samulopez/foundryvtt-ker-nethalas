import { getGame, getLocalization } from '../helpers';
import { ID, KNSettings, TEMPLATES } from '../constants';

export default class KerNethalasCharacterActor extends Actor<'character'> {
  async rollTensionDie() {
    const dieSize = this.system.mechanics.tensionDie;
    if (!dieSize) {
      return;
    }

    const roll = new Roll(`1d${dieSize}`);
    await roll.evaluate();

    let resultString = getLocalization().localize('KN.Error.tensionDieCheck.noEffect');
    let customClass = '';

    if ((roll.total ?? 100) <= 2) {
      resultString = getLocalization().localize('KN.Error.tensionDieCheck.decreases');
      customClass = 'failure-text';
      this.system.mechanics.tensionDie = dieSize - 2;
      if (dieSize === 4) {
        resultString = getLocalization().localize('KN.Error.tensionDieCheck.growingDarkness');
        this.system.mechanics.tensionDie = 8;
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
      flavor: getLocalization().localize('KN.Error.tensionDieCheck.title'),
    });

    const diceSoNice = getGame().modules.has('dice-so-nice') && getGame().modules.get('dice-so-nice')?.active;
    if (diceSoNice && message) {
      await getGame().dice3d?.waitFor3DAnimationByMessageID(message.id);
    }
    await this.update({
      system: {
        mechanics: { tensionDie: this.system.mechanics.tensionDie },
      },
    });
  }

  async resetLairDomainExitDie() {
    await this.update({
      system: {
        mechanics: {
          lairDie: 10,
          domainExitDie: 8,
          overseerFound: false,
        },
      },
    });
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
        // We don't reset in this case. The user will decide when to reset it.
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
      flavor: 'Domain Exit check',
    });

    const diceSoNice = getGame().modules.has('dice-so-nice') && getGame().modules.get('dice-so-nice')?.active;
    if (diceSoNice && message) {
      await getGame().dice3d?.waitFor3DAnimationByMessageID(message.id);
    }

    await this.update({
      system: {
        mechanics: {
          domainExitDie: this.system.mechanics.domainExitDie,
        },
      },
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

    const message = await roll.toMessage({
      content: html,
      flavor: 'Lair check',
    });

    const diceSoNice = getGame().modules.has('dice-so-nice') && getGame().modules.get('dice-so-nice')?.active;
    if (diceSoNice && message) {
      await getGame().dice3d?.waitFor3DAnimationByMessageID(message.id);
    }

    await this.update({
      system: {
        mechanics: {
          lairDie: this.system.mechanics.lairDie,
          domainExitDie: this.system.mechanics.domainExitDie,
          overseerFound: this.system.mechanics.overseerFound,
        },
      },
    });
  }

  async markOverseerFound(found: boolean) {
    await this.resetLairDomainExitDie();
    await this.update({
      system: {
        mechanics: {
          overseerFound: found,
        },
      },
    });
  }

  async rollSkill(skillKey: string, modifier: number) {
    const skill = this.system.skills[skillKey];
    if (!skill) {
      return;
    }

    if (skill.value === 0 && !modifier) {
      return;
    }

    let value = modifier ? skill.value + modifier : skill.value;
    if (value <= 0) {
      value = 0;
    }

    const roll = new Roll('1d100');
    await roll.evaluate();

    let resultString = getLocalization().localize('KN.roll.success');
    let customClass = 'success-text';
    const total = roll.total ?? 1000;
    const isCritical = total % 11 === 0;

    if (total > value) {
      resultString = getLocalization().localize('KN.roll.failure');
      customClass = 'failure-text';
    }

    const html = await foundry.applications.handlebars.renderTemplate(TEMPLATES.usageDieRoll, {
      resultString: isCritical ? getLocalization().format('KN.roll.critical', { type: resultString }) : resultString,
      customClass,
      formula: roll.formula,
      total: roll.total,
    });

    const message = await roll.toMessage({
      content: html,
      flavor: `${getLocalization().format('KN.roll.skillCheck', { skill: getLocalization().localize(`KN.Character.Skills.${skillKey}`) })}<br>${getLocalization().localize('KN.roll.targetValue')}: ${value} ${modifier !== 0 ? `(${getLocalization().localize('KN.roll.base')}: ${skill.value} ${modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`})` : ''}`,
    });

    const diceSoNice = getGame().modules.has('dice-so-nice') && getGame().modules.get('dice-so-nice')?.active;
    if (diceSoNice && message) {
      await getGame().dice3d?.waitFor3DAnimationByMessageID(message.id);
    }

    if (!isCritical) {
      return;
    }

    const markSkillForImprovement = getGame().settings.get(ID, KNSettings.markSkillForImprovement);
    if (!markSkillForImprovement) {
      return;
    }
    await this.update({
      system: {
        skills: {
          [skillKey]: {
            markForImprovement: true,
          },
        },
      },
    });
  }
}
