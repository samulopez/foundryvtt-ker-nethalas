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
  },
  item: {
    header: `systems/${ID}/templates/item/header.hbs`,
    detailsTab: `systems/${ID}/templates/item/details-tab.hbs`,
    notesTab: `systems/${ID}/templates/item/notes-tab.hbs`,
  },
};

export const SKILLS = {
  left: [
    'acrobatics',
    'athletics',
    'bladedWeapons',
    'bludgeoningWeapons',
    'dodge',
    'endurance',
    'medicine',
    'perception',
    'resolve',
    'reason',
  ],
  right: ['scavenge', 'shaftedWeapons', 'stealth', 'thievery', 'unarmedCombat'],
};

export enum KNSettings {
  markSkillForImprovement = 'markSkillForImprovement',
}
