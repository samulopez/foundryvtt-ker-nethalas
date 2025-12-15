export const ID = 'ker-nethalas';

export const TEMPLATES = {
  usageDieRoll: `systems/${ID}/templates/roll/usage-die-roll.hbs`,
  character: {
    header: `systems/${ID}/templates/character/header.hbs`,
    skillsTab: `systems/${ID}/templates/character/skills-tab.hbs`,
    perksTab: `systems/${ID}/templates/character/perks-tab.hbs`,
    inventoryTab: `systems/${ID}/templates/character/inventory-tab.hbs`,
    mechanicsTab: `systems/${ID}/templates/character/mechanics-tab.hbs`,
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
