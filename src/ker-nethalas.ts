import './styles/style.scss';
import CharacterSheet from './module/sheets/characterSheet';
import { registerSettings } from './module/settings';
import {
  ArmorDataModel,
  CharacterDataModel,
  CreatureDataModel,
  MinionDataModel,
  NPCDataModel,
  WeaponDataModel,
} from './module/data';
import { ID, TEMPLATES } from './module/constants';
import KerNethalasCharacterActor from './module/actor/character';

Hooks.once('init', async () => {
  // Configure custom Document implementations.
  CONFIG.Actor.documentClass = KerNethalasCharacterActor;
  // TODO
  // CONFIG.Item.documentClass = SystemItem;
  // Configure System Data Models.
  CONFIG.Actor.dataModels = {
    character: CharacterDataModel,
    minion: MinionDataModel,
    creature: CreatureDataModel,
    npc: NPCDataModel,
  };
  CONFIG.Item.dataModels = {
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
    creature: {
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
  // Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
  // Items.registerSheet(DG.ID, DeltaGreenItemSheet, {
  //   makeDefault: true,
  //   label: "DG.Sheet.class.item",
  //   themes: null,
  // });

  registerSettings();

  // Preload Handlebars templates
  await foundry.applications.handlebars.loadTemplates(Object.values(foundry.utils.flattenObject(TEMPLATES)));
});
