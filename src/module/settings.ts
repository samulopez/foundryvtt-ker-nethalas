import { getGame, getLocalization } from './helpers';
import { ID, KNSettings } from './constants';

export const registerSettings = () => {
  getGame().settings.register(ID, KNSettings.markSkillForImprovement, {
    name: getLocalization().localize('KN.Settings.markSkillForImprovement.name'),
    hint: getLocalization().localize('KN.Settings.markSkillForImprovement.hint'),
    scope: 'client',
    config: true,
    default: true,
    type: Boolean,
  });
  getGame().settings.register(ID, KNSettings.duplicateMonstersOnStart, {
    name: getLocalization().localize('KN.Settings.duplicateMonstersOnStart.name'),
    hint: getLocalization().localize('KN.Settings.duplicateMonstersOnStart.hint'),
    scope: 'client',
    config: true,
    default: true,
    type: Boolean,
  });
};
