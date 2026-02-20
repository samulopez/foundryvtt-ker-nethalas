import { ID, TEMPLATES } from './constants';

interface LocalizationHelper {
  localize: (key: string) => string;
  format: (stringId: string, data?: Record<string, string>) => string;
}

export const getGame = (): Game => {
  if (!(game instanceof foundry.Game)) {
    throw new Error('game is not initialized yet!');
  }
  return game;
};

export function getLocalization(): LocalizationHelper {
  const { i18n } = getGame();
  if (!i18n) {
    return {
      localize: (key: string) => key,
      format: (stringId: string, _data?: Record<string, string>) => stringId,
    };
  }
  return i18n;
}

const handleChatMessageActions = async (btnWithAction: HTMLElement, messageId: string) => {
  const action = btnWithAction.dataset?.action;
  const message = getGame().messages?.get(messageId);
  if (!message) {
    return;
  }

  if (action === 'applyBenefits') {
    const setCampResult = message.getFlag(ID, 'setCampResult');
    if (!setCampResult) {
      return;
    }

    const actor = getGame().actors?.get(setCampResult.actorId);
    const messages = await actor?.applyCampResult(setCampResult);

    const encounterSection = btnWithAction.closest('.encounter');
    if (!encounterSection) {
      return;
    }

    const html = await foundry.applications.handlebars.renderTemplate(TEMPLATES.setCampApplyBenefitsRoll, {
      messages,
    });

    await message.setFlag(ID, 'setCampResult', undefined);
    await message.update({
      content: message.content.replace(encounterSection.outerHTML.replace(' style=""', ''), html),
    });
  }
};

export const addEventListenerToChatMessage = (element: Element) => {
  element.addEventListener('click', (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    const btnWithAction = event.target.closest<HTMLElement>('button[data-action]');
    const message = event.target.closest<HTMLElement>('li[data-message-id]');
    const messageId = message?.dataset?.messageId;
    if (btnWithAction && messageId) {
      handleChatMessageActions(btnWithAction, messageId);
    }
  });
};
