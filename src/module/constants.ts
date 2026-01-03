export const ID = 'ker-nethalas';

export const TEMPLATES = {
  modifyRoll: `systems/${ID}/templates/roll/modify-roll.hbs`,
  usageDieRoll: `systems/${ID}/templates/roll/usage-die-roll.hbs`,
  character: {
    header: `systems/${ID}/templates/character/header.hbs`,
    skillsTab: `systems/${ID}/templates/character/skills-tab.hbs`,
    perksTab: `systems/${ID}/templates/character/perks-tab.hbs`,
    inventoryTab: `systems/${ID}/templates/character/inventory-tab.hbs`,
    mechanicsTab: `systems/${ID}/templates/character/mechanics-tab.hbs`,
    weaponRow: `systems/${ID}/templates/character/weapon-row.hbs`,
  },
  item: {
    header: `systems/${ID}/templates/item/header.hbs`,
    detailsTab: `systems/${ID}/templates/item/details-tab.hbs`,
    notesTab: `systems/${ID}/templates/item/notes-tab.hbs`,
    row: `systems/${ID}/templates/item/item-row.hbs`,
    equipmentRow: `systems/${ID}/templates/item/equipment-row.hbs`,
  },
  weapon: {
    header: `systems/${ID}/templates/weapon/header.hbs`,
    detailsTab: `systems/${ID}/templates/weapon/details-tab.hbs`,
    notesTab: `systems/${ID}/templates/weapon/notes-tab.hbs`,
  },
};

export enum WEIGHT {
  nonEncumbering = 'nonEncumbering',
  light = 'light',
  normal = 'normal',
  heavy = 'heavy',
}

export enum SKILLS {
  acrobatics = 'acrobatics',
  athletics = 'athletics',
  bladedWeapons = 'bladedWeapons',
  bludgeoningWeapons = 'bludgeoningWeapons',
  dodge = 'dodge',
  endurance = 'endurance',
  medicine = 'medicine',
  perception = 'perception',
  resolve = 'resolve',
  reason = 'reason',
  scavenge = 'scavenge',
  shaftedWeapons = 'shaftedWeapons',
  stealth = 'stealth',
  thievery = 'thievery',
  unarmedCombat = 'unarmedCombat',
}

export const SKILL_DISPLAY: Record<'left' | 'right', string[]> = {
  left: [
    SKILLS.acrobatics,
    SKILLS.athletics,
    SKILLS.bladedWeapons,
    SKILLS.bludgeoningWeapons,
    SKILLS.dodge,
    SKILLS.endurance,
    SKILLS.medicine,
    SKILLS.perception,
    SKILLS.resolve,
    SKILLS.reason,
  ],
  right: [SKILLS.scavenge, SKILLS.shaftedWeapons, SKILLS.stealth, SKILLS.thievery, SKILLS.unarmedCombat],
} satisfies Record<'left' | 'right', SKILLS[]>;

export enum KNSettings {
  markSkillForImprovement = 'markSkillForImprovement',
}
