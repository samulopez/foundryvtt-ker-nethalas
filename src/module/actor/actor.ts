import { getGame, getLocalization } from '../helpers';
import { HIT_LOCATIONS, HIT_LOCATION_TABLES, ID, KNSettings, TEMPLATES } from '../constants';

export default class KerNethalasActor<out SubType extends Actor.SubType = Actor.SubType> extends Actor<SubType> {
  constructor(data: Actor.CreateData<SubType>, context?: Actor.ConstructionContext) {
    const newData = data;
    if (!newData.img) {
      if (newData.type === 'monster') {
        newData.img = 'icons/svg/terror.svg';
      }
      if (newData.type === 'minion') {
        newData.img = 'icons/svg/mole.svg';
      }
    }

    super(newData, context);
  }

  async rollTensionDie() {
    if (!this.isCharacter()) {
      throw new Error('Actor is not a character');
    }
    const dieSize = this.system.mechanics.tensionDie;
    if (!dieSize) {
      return;
    }

    const roll = new Roll(`1d${dieSize}`);
    await roll.evaluate();

    let resultString = getLocalization().localize('KN.Rolls.tensionDieCheck.noEffect');
    let customClass = '';

    if ((roll.total ?? 100) <= 2) {
      resultString = getLocalization().localize('KN.Rolls.tensionDieCheck.decreases');
      customClass = 'failure-text';
      this.system.mechanics.tensionDie = dieSize - 2;
      if (dieSize === 4) {
        resultString = getLocalization().localize('KN.Rolls.tensionDieCheck.growingDarkness');
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
      flavor: getLocalization().localize('KN.Rolls.tensionDieCheck.title'),
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
    if (!this.isCharacter()) {
      throw new Error('Actor is not a character');
    }
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
    if (!this.isCharacter()) {
      throw new Error('Actor is not a character');
    }
    if (this.system.mechanics.overseerFound) {
      return this.rollDomainExitDie();
    }
    return this.rollLairDie();
  }

  async rollDomainExitDie() {
    if (!this.isCharacter()) {
      throw new Error('Actor is not a character');
    }
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
      flavor: getLocalization().localize('KN.Rolls.domainExitCheck.title'),
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
    if (!this.isCharacter()) {
      throw new Error('Actor is not a character');
    }
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
      flavor: getLocalization().localize('KN.Rolls.lairCheck.title'),
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
    if (!this.isCharacter()) {
      throw new Error('Actor is not a character');
    }
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
    if (!this.isCharacter()) {
      throw new Error('Actor is not a character');
    }
    const skill = this.system.skills[skillKey] as
      | { value: number; markForImprovement: boolean; temporaryModifier: number }
      | undefined;
    if (!skill) {
      return;
    }

    if (skill.value === 0 && !modifier && skill.temporaryModifier === 0) {
      return;
    }

    let value = modifier ? skill.value + modifier : skill.value;
    const temporaryModifier = skill.temporaryModifier || 0;
    if (temporaryModifier !== 0) {
      value += temporaryModifier;
    }
    if (value <= 0) {
      value = 0;
    }

    const roll = new Roll('1d100');
    await roll.evaluate();

    let resultString = getLocalization().localize('KN.Rolls.success');
    let customClass = 'success-text';
    const total = roll.total ?? 1000;
    const isCritical = total % 11 === 0;

    if (total > value) {
      resultString = getLocalization().localize('KN.Rolls.failure');
      customClass = 'failure-text';
    }

    const html = await foundry.applications.handlebars.renderTemplate(TEMPLATES.usageDieRoll, {
      resultString: isCritical ? getLocalization().format('KN.Rolls.critical', { type: resultString }) : resultString,
      customClass,
      formula: roll.formula,
      total: roll.total,
    });

    const message = await roll.toMessage({
      content: html,
      flavor: `${this.name}: ${getLocalization().format('KN.Rolls.skillCheck', { skill: getLocalization().localize(`KN.Character.Skills.${skillKey}`) })}<br>${getLocalization().localize('KN.Rolls.targetValue')}: ${value} (${skill.value} ${getLocalization().localize('KN.Rolls.base')}${temporaryModifier !== 0 ? ` ${temporaryModifier > 0 ? '+ ' : '- '} ${Math.abs(temporaryModifier)} ${getLocalization().localize('KN.Rolls.tempModifier')}` : ''}${modifier !== 0 ? ` ${modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`}` : ''})`,
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

  async rollActions() {
    if ((!this.isMonster() && !this.isMinion()) || this.system.actions.length === 0) {
      return;
    }

    const roll = new Roll('1d6');
    await roll.evaluate();
    const total = roll.total ?? 0;

    const action = this.system.actions.find((a) => total >= (a.startDie ?? 0) && total <= (a.endDie ?? 0));
    if (!action) {
      return;
    }

    const html = await foundry.applications.handlebars.renderTemplate(TEMPLATES.actionsRoll, {
      resultString: action.name,
      customClass: '',
      formula: roll.formula,
      total: roll.total,
      description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(action.description, {
        secrets: this.isOwner,
        relativeTo: this,
      }),
    });

    const message = await roll.toMessage({
      content: html,
      flavor: `${this.name}: ${getLocalization().localize('KN.Rolls.rollActionsFlavor')}`,
    });

    const diceSoNice = getGame().modules.has('dice-so-nice') && getGame().modules.get('dice-so-nice')?.active;
    if (diceSoNice && message) {
      await getGame().dice3d?.waitFor3DAnimationByMessageID(message.id);
    }
  }

  async rollResistance(resistanceKey: string, modifier: number) {
    if (!this.isCharacter()) {
      throw new Error('Actor is not a character');
    }
    const resistance = this.system.resistances[resistanceKey] as number | undefined;
    if (!resistance) {
      return;
    }

    if (resistance === 0 && !modifier) {
      return;
    }

    let value = modifier ? resistance + modifier : resistance;
    if (value <= 0) {
      value = 0;
    }

    const roll = new Roll('1d100');
    await roll.evaluate();

    let resultString = getLocalization().localize('KN.Rolls.success');
    let customClass = 'success-text';
    const total = roll.total ?? 1000;
    const isCritical = total % 11 === 0;

    if (total > value) {
      resultString = getLocalization().localize('KN.Rolls.failure');
      customClass = 'failure-text';
    }

    const html = await foundry.applications.handlebars.renderTemplate(TEMPLATES.usageDieRoll, {
      resultString: isCritical ? getLocalization().format('KN.Rolls.critical', { type: resultString }) : resultString,
      customClass,
      formula: roll.formula,
      total: roll.total,
    });

    await roll.toMessage({
      content: html,
      flavor: `${this.name}: ${getLocalization().format('KN.Rolls.resistanceCheck', { resistance: getLocalization().localize(`KN.Character.Resistances.${resistanceKey}`) })}<br>${getLocalization().localize('KN.Rolls.targetValue')}: ${value} (${resistance} ${getLocalization().localize('KN.Rolls.base')}${modifier !== 0 ? ` ${modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`}` : ''})`,
    });
  }

  async rollAttribute(attributeKey: string, modifier: number) {
    if (!this.isMonster() && !this.isMinion()) {
      throw new Error('Actor is not a monster or minion');
    }
    const attribute = this.system.attributes[attributeKey] as number | undefined;
    if (!attribute) {
      return;
    }

    if (attribute === 0 && !modifier) {
      return;
    }

    let value = modifier ? attribute + modifier : attribute;
    if (value <= 0) {
      value = 0;
    }

    const roll = new Roll('1d100');
    await roll.evaluate();

    let resultString = getLocalization().localize('KN.Rolls.success');
    let customClass = 'success-text';
    const total = roll.total ?? 1000;
    const isCritical = total % 11 === 0;

    if (total > value) {
      resultString = getLocalization().localize('KN.Rolls.failure');
      customClass = 'failure-text';
    }

    const html = await foundry.applications.handlebars.renderTemplate(TEMPLATES.usageDieRoll, {
      resultString: isCritical ? getLocalization().format('KN.Rolls.critical', { type: resultString }) : resultString,
      customClass,
      formula: roll.formula,
      total: roll.total,
    });

    await roll.toMessage({
      content: html,
      flavor: `${this.name}: ${getLocalization().format('KN.Rolls.labelCheck', { label: getLocalization().localize(`KN.Monster.Sheet.attributes.${attributeKey}`) })}<br>${getLocalization().localize('KN.Rolls.targetValue')}: ${value} (${attribute} ${getLocalization().localize('KN.Rolls.base')}${modifier !== 0 ? ` ${modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`}` : ''})`,
    });
  }

  async rollHitLocation() {
    if (this.system.hitLocation === HIT_LOCATIONS.none) {
      return;
    }

    const roll = new Roll('1d20');
    await roll.evaluate();
    const total = roll.total ?? 0;

    const hitLocationTable = HIT_LOCATION_TABLES[this.system.hitLocation];
    if (!hitLocationTable) {
      return;
    }

    const hitLocation = hitLocationTable.find((hl) => total >= hl.startDie && total <= hl.endDie);
    if (!hitLocation) {
      return;
    }
    let resultString = getLocalization().localize(`KN.Monster.Sheet.weakSpot.option.${hitLocation.location}`);
    let customClass = '';
    if (hitLocation.location === this.system.weakSpot) {
      customClass = 'bold-text';
      resultString = `${getLocalization().format('KN.Rolls.criticalStrike')}! ${resultString}`;
    }

    const html = await foundry.applications.handlebars.renderTemplate(TEMPLATES.usageDieRoll, {
      resultString,
      customClass,
      formula: roll.formula,
      total: roll.total,
    });

    const message = await roll.toMessage({
      content: html,
      flavor: `${this.name}: ${getLocalization().format('KN.Rolls.rollHitLocation', {
        locationType: getLocalization().localize(`KN.Monster.Sheet.hitLocation.${this.system.hitLocation}`),
      })}`,
    });

    const diceSoNice = getGame().modules.has('dice-so-nice') && getGame().modules.get('dice-so-nice')?.active;
    if (diceSoNice && message) {
      await getGame().dice3d?.waitFor3DAnimationByMessageID(message.id);
    }
  }

  async improveSkills() {
    if (!this.isCharacter()) {
      throw new Error('Actor is not a character');
    }
    const skillsToImprove = this.system.skillsToImprove();
    const messages: { name: string; oldValue: number; newValue: number }[] = [];
    const skillUpdates = {};
    await Promise.all(
      skillsToImprove.map(async (skillKey) => {
        const roll = new Roll('1d100');
        await roll.evaluate();
        const total = roll.total ?? 0;
        const skill = this.system.skills[skillKey] as
          | { value: number; markForImprovement: boolean; temporaryModifier: number }
          | undefined;
        skillUpdates[skillKey] = {
          markForImprovement: false,
        };
        if (!skill || skill.value >= 80) {
          return;
        }
        let newSkillValue = skill.value + 1;
        if (total > skill.value) {
          const rollImprovement = new Roll('1d4');
          await rollImprovement.evaluate();
          const totalImprovement = rollImprovement.total ?? 0;
          newSkillValue = Math.min(skill.value + totalImprovement, 80);
        }

        skillUpdates[skillKey].value = newSkillValue;
        messages.push({
          name: getLocalization().localize(`KN.Character.Skills.${skillKey}`),
          oldValue: skill.value,
          newValue: newSkillValue,
        });
      }),
    );

    const html = await foundry.applications.handlebars.renderTemplate(TEMPLATES.messageListRoll, {
      resultString: getLocalization().localize('KN.ApplySkillImprovements.skillsImproved'),
      customClass: '',
      messages,
      total: '',
    });

    const roll = new Roll('1d0');
    const message = await roll.toMessage({
      content: html,
      flavor: `${this.name}: ${getLocalization().localize('KN.ApplySkillImprovements.titleModal')}`,
    });

    const diceSoNice = getGame().modules.has('dice-so-nice') && getGame().modules.get('dice-so-nice')?.active;
    if (diceSoNice && message) {
      await getGame().dice3d?.waitFor3DAnimationByMessageID(message.id);
    }

    await this.update({
      system: {
        skills: skillUpdates,
      },
    });
  }

  async takeABreather() {
    if (!this.isCharacter()) {
      throw new Error('Actor is not a character');
    }

    const roll = new Roll('1d10');
    await roll.evaluate();
    const toughnessValue = (roll.total ?? 0) + 2 + (this.system.attributes.toughness.value ?? 0);
    const toughnessNewValue = Math.min(toughnessValue, this.system.attributes.toughness.max ?? 0);
    const healthNewValue = Math.min(
      (this.system.attributes.health.value ?? 0) + 1,
      this.system.attributes.health.max ?? 0,
    );
    const exhaustionNewValue = Math.max((this.system.attributes.exhaustion ?? 0) - 2, 0);
    const lightSourceNewValue = Math.max((this.system.lightSource ?? 0) - 5, 0);
    const dieSize = this.system.mechanics.tensionDie;
    let tensionDieNew = (dieSize ?? 0) - 2;
    let tensionDieDescription = '';
    if (dieSize === 4) {
      tensionDieDescription = getLocalization().localize('KN.Rolls.tensionDieCheck.growingDarkness');
      tensionDieNew = 8;
    }

    const messages: {
      name: string;
      oldValue: number;
      newValue: number;
      description?: string;
      descriptionCustomClass?: string;
    }[] = [
      {
        name: getLocalization().localize('KN.TakingABreather.toughness'),
        oldValue: this.system.attributes.toughness.value ?? 0,
        newValue: toughnessNewValue,
      },
      {
        name: getLocalization().localize('KN.TakingABreather.health'),
        oldValue: this.system.attributes.health.value ?? 0,
        newValue: healthNewValue,
      },
      {
        name: getLocalization().localize('KN.TakingABreather.exhaustion'),
        oldValue: this.system.attributes.exhaustion ?? 0,
        newValue: exhaustionNewValue,
      },
      {
        name: getLocalization().localize('KN.TakingABreather.lightsource'),
        oldValue: this.system.lightSource ?? 0,
        newValue: lightSourceNewValue,
      },
      {
        name: getLocalization().localize('KN.TakingABreather.tensionDie'),
        oldValue: this.system.mechanics.tensionDie ?? 0,
        newValue: tensionDieNew,
        description: tensionDieDescription,
        descriptionCustomClass: 'failure-text',
      },
    ];

    const html = await foundry.applications.handlebars.renderTemplate(TEMPLATES.messageListRoll, {
      resultString: getLocalization().localize('KN.TakingABreather.message'),
      customClass: '',
      messages,
      total: '',
    });

    const message = await roll.toMessage({
      content: html,
      flavor: `${this.name}: ${getLocalization().localize('KN.TakingABreather.title')}`,
    });

    const diceSoNice = getGame().modules.has('dice-so-nice') && getGame().modules.get('dice-so-nice')?.active;
    if (diceSoNice && message) {
      await getGame().dice3d?.waitFor3DAnimationByMessageID(message.id);
    }

    await this.update({
      system: {
        attributes: {
          toughness: {
            value: toughnessNewValue,
          },
          health: {
            value: healthNewValue,
          },
          exhaustion: exhaustionNewValue,
        },
        lightSource: lightSourceNewValue,
        mechanics: {
          tensionDie: tensionDieNew,
        },
      },
    });
  }

  isCharacter(): this is KerNethalasActor<'character'> {
    return this.type === 'character';
  }

  isMinion(): this is KerNethalasActor<'minion'> {
    return this.type === 'minion';
  }

  isMonster(): this is KerNethalasActor<'monster'> {
    return this.type === 'monster';
  }
}
