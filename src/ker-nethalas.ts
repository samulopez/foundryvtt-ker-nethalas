import './styles/style.scss';
import KNItemSheet from './module/sheets/itemSheet';
import CharacterSheet from './module/sheets/characterSheet';
import { registerSettings } from './module/settings';
import KerNethalasItem from './module/item/item';
import {
  ArmorDataModel,
  CharacterDataModel,
  ItemDataModel,
  MinionDataModel,
  MonsterDataModel,
  NPCDataModel,
  WeaponDataModel,
} from './module/data';
import { ID, TEMPLATES } from './module/constants';
import KerNethalasCharacterActor from './module/actor/character';

Hooks.once('init', async () => {
  // Configure custom Document implementations.
  CONFIG.Actor.documentClass = KerNethalasCharacterActor;
  CONFIG.Item.documentClass = KerNethalasItem;
  // Configure System Data Models.
  CONFIG.Actor.dataModels = {
    character: CharacterDataModel,
    minion: MinionDataModel,
    monster: MonsterDataModel,
    npc: NPCDataModel,
  };
  CONFIG.Item.dataModels = {
    item: ItemDataModel,
    weapon: WeaponDataModel,
    armor: ArmorDataModel,
  };
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
  foundry.documents.collections.Items.unregisterSheet('core', foundry.appv1.sheets.ItemSheet);
  foundry.documents.collections.Items.registerSheet(ID, KNItemSheet, {
    makeDefault: true,
    themes: null,
    label: 'Ker Nethalas Item Sheet',
    types: ['item'],
  });

  registerSettings();

  // Preload Handlebars templates
  await foundry.applications.handlebars.loadTemplates(Object.values(foundry.utils.flattenObject(TEMPLATES)));
});
