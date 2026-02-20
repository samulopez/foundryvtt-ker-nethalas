import type KerNethalasItem from './module/item/item';
import type {
  ArmorDataModel,
  CharacterDataModel,
  MonsterDataModel,
  ItemDataModel,
  MinionDataModel,
  WeaponDataModel,
} from './module/data';
import type KerNethalasCombatant from './module/combat/combatant';
import type KerNethalasCombat from './module/combat/combat';
import type KerNethalasActor from './module/actor/actor';

declare module 'fvtt-types/configuration' {
  interface DataModelConfig {
    Actor: {
      character: typeof CharacterDataModel;
      minion: typeof MinionDataModel;
      monster: typeof MonsterDataModel;
    };
    Item: {
      item: typeof ItemDataModel;
      weapon: typeof WeaponDataModel;
      armor: typeof ArmorDataModel;
    };
  }

  interface DocumentClassConfig {
    Actor: typeof KerNethalasActor<Actor.SubType>;
    Item: typeof KerNethalasItem<Item.SubType>;
    Combat: typeof KerNethalasCombat;
    Combatant: typeof KerNethalasCombatant;
  }

  interface ConfiguredItem<SubType extends Item.SubType> {
    document: KerNethalasItem<SubType>;
  }

  interface ConfiguredActor<SubType extends Actor.SubType> {
    document: KerNethalasActor<SubType>;
  }

  interface FlagConfig {
    ChatMessage: {
      'ker-nethalas': {
        setCampResult?: {
          actorId: string;
          exhaustionDecreases: number;
          healthIncreases: number;
          sanityIncreases: number;
        };
      };
    };
  }

  interface SettingConfig {
    'ker-nethalas.markSkillForImprovement': boolean;
    'ker-nethalas.duplicateMonstersOnStart': boolean;
  }
}

declare global {
  interface Game extends foundry.Game {
    dice3d?: {
      waitFor3DAnimationByMessageID: (messageId: string | null) => Promise<void>;
    };
  }
}
