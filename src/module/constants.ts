export const ID = 'ker-nethalas';

export const TEMPLATES = {
  modifyRoll: `systems/${ID}/templates/roll/modify-roll.hbs`,
  usageDieRoll: `systems/${ID}/templates/roll/usage-die-roll.hbs`,
  actionsRoll: `systems/${ID}/templates/roll/actions-roll.hbs`,
  character: {
    header: `systems/${ID}/templates/character/header.hbs`,
    skillsTab: `systems/${ID}/templates/character/skills-tab.hbs`,
    perksTab: `systems/${ID}/templates/character/perks-tab.hbs`,
    inventoryTab: `systems/${ID}/templates/character/inventory-tab.hbs`,
    mechanicsTab: `systems/${ID}/templates/character/mechanics-tab.hbs`,
    weaponRow: `systems/${ID}/templates/character/weapon-row.hbs`,
  },
  minion: {
    header: `systems/${ID}/templates/minion/header.hbs`,
    detailsTab: `systems/${ID}/templates/minion/details-tab.hbs`,
    notesTab: `systems/${ID}/templates/minion/notes-tab.hbs`,
  },
  monster: {
    header: `systems/${ID}/templates/monster/header.hbs`,
    detailsTab: `systems/${ID}/templates/monster/details-tab.hbs`,
    notesTab: `systems/${ID}/templates/monster/notes-tab.hbs`,
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
  armor: {
    header: `systems/${ID}/templates/armor/header.hbs`,
    detailsTab: `systems/${ID}/templates/armor/details-tab.hbs`,
    notesTab: `systems/${ID}/templates/armor/notes-tab.hbs`,
  },
};

export enum ARMOR {
  arms = 'arms',
  head = 'head',
  legs = 'legs',
  shield = 'shield',
  torso = 'torso',
}

export enum MONSTER {
  animal = 'animal',
  astral = 'astral',
  construct = 'construct',
  demon = 'demon',
  elemental = 'elemental',
  humanoid = 'humanoid',
  plant = 'plant',
  undead = 'undead',
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export enum HIT_LOCATIONS {
  none = 'none',
  arachnid = 'arachnid',
  humanoid = 'humanoid',
  insectoid = 'insectoid',
  quadruped = 'quadruped',
  serpentoid = 'serpentoid',
  winged = 'winged',
}

export const HIT_LOCATION_TABLES = {
  [HIT_LOCATIONS.arachnid]: [
    { startDie: 1, endDie: 2, location: 'rightRearLeg' },
    { startDie: 3, endDie: 4, location: 'leftRearLeg' },
    { startDie: 5, endDie: 6, location: 'rightMidLeg' },
    { startDie: 7, endDie: 8, location: 'leftMidLeg' },
    { startDie: 9, endDie: 10, location: 'rightForeLeg' },
    { startDie: 11, endDie: 12, location: 'leftForeLeg' },
    { startDie: 13, endDie: 14, location: 'abdomen' },
    { startDie: 15, endDie: 16, location: 'rightFrontLeg' },
    { startDie: 17, endDie: 18, location: 'leftFrontLeg' },
    { startDie: 19, endDie: 20, location: 'cephalothorax' },
  ],
  [HIT_LOCATIONS.humanoid]: [
    { startDie: 1, endDie: 3, location: 'rightLeg' },
    { startDie: 4, endDie: 6, location: 'leftLeg' },
    { startDie: 7, endDie: 9, location: 'abdomen' },
    { startDie: 10, endDie: 12, location: 'chest' },
    { startDie: 13, endDie: 15, location: 'leftArm' },
    { startDie: 16, endDie: 18, location: 'rightArm' },
    { startDie: 19, endDie: 20, location: 'head' },
  ],
  [HIT_LOCATIONS.insectoid]: [
    { startDie: 1, endDie: 1, location: 'rightRearLeg' },
    { startDie: 2, endDie: 2, location: 'leftRearLeg' },
    { startDie: 3, endDie: 3, location: 'rightMidLeg' },
    { startDie: 4, endDie: 4, location: 'leftMidLeg' },
    { startDie: 5, endDie: 9, location: 'abdomen' },
    { startDie: 10, endDie: 13, location: 'thorax' },
    { startDie: 14, endDie: 14, location: 'rightFrontLeg' },
    { startDie: 15, endDie: 15, location: 'leftFrontLeg' },
    { startDie: 16, endDie: 20, location: 'head' },
  ],
  [HIT_LOCATIONS.quadruped]: [
    { startDie: 1, endDie: 3, location: 'rightHindLeg' },
    { startDie: 4, endDie: 6, location: 'leftHindLeg' },
    { startDie: 7, endDie: 9, location: 'hindquarters' },
    { startDie: 10, endDie: 12, location: 'forequarters' },
    { startDie: 13, endDie: 15, location: 'rightFrontLeg' },
    { startDie: 16, endDie: 18, location: 'leftFrontLeg' },
    { startDie: 19, endDie: 20, location: 'head' },
  ],
  [HIT_LOCATIONS.serpentoid]: [
    { startDie: 1, endDie: 17, location: 'body' },
    { startDie: 18, endDie: 20, location: 'head' },
  ],
  [HIT_LOCATIONS.winged]: [
    { startDie: 1, endDie: 1, location: 'rightLeg' },
    { startDie: 2, endDie: 2, location: 'leftLeg' },
    { startDie: 3, endDie: 3, location: 'abdomen' },
    { startDie: 4, endDie: 4, location: 'chest' },
    { startDie: 5, endDie: 9, location: 'rightWing' },
    { startDie: 10, endDie: 13, location: 'leftWing' },
    { startDie: 14, endDie: 14, location: 'rightArm' },
    { startDie: 15, endDie: 15, location: 'leftArm' },
    { startDie: 16, endDie: 20, location: 'head' },
  ],
};

export enum WEIGHT {
  heavy = 'heavy',
  light = 'light',
  nonEncumbering = 'nonEncumbering',
  normal = 'normal',
}

export enum SKILLS {
  acrobatics = 'acrobatics',
  athletics = 'athletics',
  bladedWeapons = 'bladedWeapons',
  bludgeoningWeapons = 'bludgeoningWeapons',
  dodge = 'dodge',
  medicine = 'medicine',
  perception = 'perception',
  reason = 'reason',
  scavenge = 'scavenge',
  shaftedWeapons = 'shaftedWeapons',
  stealth = 'stealth',
  thievery = 'thievery',
  unarmedCombat = 'unarmedCombat',
}

export enum SORTING {
  alphabetically = 'alphabetically',
  manually = 'manually',
}

export const SKILL_DISPLAY: Record<'left' | 'right', string[]> = {
  left: [
    SKILLS.acrobatics,
    SKILLS.athletics,
    SKILLS.bladedWeapons,
    SKILLS.bludgeoningWeapons,
    SKILLS.dodge,
    SKILLS.medicine,
    SKILLS.perception,
  ],
  right: [SKILLS.reason, SKILLS.scavenge, SKILLS.shaftedWeapons, SKILLS.stealth, SKILLS.thievery, SKILLS.unarmedCombat],
} satisfies Record<'left' | 'right', SKILLS[]>;

export enum KNSettings {
  markSkillForImprovement = 'markSkillForImprovement',
}
