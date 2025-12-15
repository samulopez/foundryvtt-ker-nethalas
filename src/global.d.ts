import type {
  ArmorDataModel,
  CharacterDataModel,
  CreatureDataModel,
  MinionDataModel,
  NPCDataModel,
  WeaponDataModel,
} from './module/data';
import type KerNethalasCharacterActor from './module/actor/character';

declare module 'fvtt-types/configuration' {
  interface DataModelConfig {
    Actor: {
      character: typeof CharacterDataModel;
      minion: typeof MinionDataModel;
      npc: typeof NPCDataModel;
      creature: typeof CreatureDataModel;
    };
    Item: {
      weapon: typeof WeaponDataModel;
      armor: typeof ArmorDataModel;
    };
  }

  interface DocumentClassConfig {
    Actor: typeof KerNethalasCharacterActor;
  }

  interface SettingConfig {
    'ker-nethalas.markSkillForImprovement': boolean;
  }
}

declare global {
  interface Game extends foundry.Game {
    dice3d?: {
      waitFor3DAnimationByMessageID: (messageId: string | null) => Promise<void>;
    };
  }
}
