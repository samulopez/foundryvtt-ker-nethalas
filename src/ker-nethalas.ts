import './styles/style.scss';
import KNWeaponSheet from './module/sheets/weaponSheet';
import MonsterSheet from './module/sheets/monsterSheet';
import MinionSheet from './module/sheets/minionSheet';
import KNItemSheet from './module/sheets/itemSheet';
import CharacterSheet from './module/sheets/characterSheet';
import KNArmorSheet from './module/sheets/armorSheet';
import { registerSettings } from './module/settings';
import KerNethalasItem from './module/item/item';
import {
  ArmorDataModel,
  CharacterDataModel,
  ItemDataModel,
  MinionDataModel,
  MonsterDataModel,
  WeaponDataModel,
} from './module/data';
import { ID, TEMPLATES } from './module/constants';
import KerNethalasCombatant from './module/combat/combatant';
import KerNethalasCombat from './module/combat/combat';
import KerNethalasActor from './module/actor/actor';

Hooks.once('init', async () => {
  // Configure custom Document implementations.
  CONFIG.Actor.documentClass = KerNethalasActor;
  CONFIG.Item.documentClass = KerNethalasItem;
  // Configure System Data Models.
  CONFIG.Actor.dataModels = {
    character: CharacterDataModel,
    minion: MinionDataModel,
    monster: MonsterDataModel,
  };
  CONFIG.Item.dataModels = {
    item: ItemDataModel,
    weapon: WeaponDataModel,
    armor: ArmorDataModel,
  };
  CONFIG.Combat.documentClass = KerNethalasCombat;
  CONFIG.Combatant.documentClass = KerNethalasCombatant;
  CONFIG.Actor.trackableAttributes = {
    character: {
      bar: ['attributes.health', 'attributes.toughness', 'attributes.aether', 'attributes.sanity'],
      value: ['level'],
    },
    minion: {
      bar: ['attributes.health'],
      value: [],
    },
    monster: {
      bar: ['attributes.health'],
      value: [],
    },
  };
  foundry.documents.collections.Actors.unregisterSheet('core', foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet(ID, CharacterSheet, {
    makeDefault: true,
    themes: null,
    label: 'Ker Nethalas Character Sheet',
    types: ['character'],
  });
  foundry.documents.collections.Actors.registerSheet(ID, MinionSheet, {
    makeDefault: true,
    themes: null,
    label: 'Ker Nethalas Minion Sheet',
    types: ['minion'],
  });
  foundry.documents.collections.Actors.registerSheet(ID, MonsterSheet, {
    makeDefault: true,
    themes: null,
    label: 'Ker Nethalas Monster Sheet',
    types: ['monster'],
  });
  foundry.documents.collections.Items.unregisterSheet('core', foundry.appv1.sheets.ItemSheet);
  foundry.documents.collections.Items.registerSheet(ID, KNItemSheet, {
    makeDefault: true,
    themes: null,
    label: 'Ker Nethalas Item Sheet',
    types: ['item'],
  });
  foundry.documents.collections.Items.registerSheet(ID, KNWeaponSheet, {
    makeDefault: true,
    themes: null,
    label: 'Ker Nethalas Weapon Sheet',
    types: ['weapon'],
  });
  foundry.documents.collections.Items.registerSheet(ID, KNArmorSheet, {
    makeDefault: true,
    themes: null,
    label: 'Ker Nethalas Armor Sheet',
    types: ['armor'],
  });

  registerSettings();

  // Preload Handlebars templates
  await foundry.applications.handlebars.loadTemplates(Object.values(foundry.utils.flattenObject(TEMPLATES)));
});

Hooks.on('createCombatant', KerNethalasCombat.createCombatant);
