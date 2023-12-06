import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import {
  PORT, TOKEN, URL_TO_BOT, URL_TO_SITE,
} from './config.js';

const app = express();
const bot = new TelegramBot(TOKEN, {
  polling: true,
});
const ANSWER_DELAY = 1000;

const commands = [

  { command: 'start', description: 'Запуск бота' },
  { command: 'ref', description: 'Получить реферальную ссылку' },
  { command: 'help', description: 'Раздел помощи' },
  { command: 'link', description: 'Ссылка' },
  { command: 'menu', description: 'Меню-клавиатура' },
  { command: 'second_menu', description: 'Второе меню' },

];
bot.setMyCommands(commands);

bot.on('text', async (msg) => {
  try {
    if (msg.text.startsWith('/start')) {
      await bot.sendMessage(msg.chat.id, 'Слушаю-с, ваше благородие!');
      if (msg.text.length > 6) {
        const refID = msg.text.slice(7);
        await bot.sendMessage(msg.chat.id, `Ваше благородие зашло по ссылке господина с ID ${refID}`);
      }
    } else if (msg.text === '/ref') {
      await bot.sendMessage(msg.chat.id, `${URL_TO_BOT}?start=${msg.from.id}`);
    } else if (msg.text === '/help') {
      await bot.sendMessage(msg.chat.id, 'Раздел помощи <a'
            + ' href="https://evan-gcrm.livejournal.com/840114.html">тебе, господин</a>', {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      });
    } else if (msg.text === '/link') {
      await bot.sendMessage(msg.chat.id, 'Господин, тыкни перстом своим <a'
          + ` href="${URL_TO_SITE}">сюда</a>`, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      });
    } else {
      const msgWait = await bot.sendMessage(msg.chat.id, 'Консультируемся со всемирным разумом...');
      setTimeout(async () => {
        await bot.editMessageText(msg.text, {
          chat_id: msgWait.chat.id, message_id: msgWait.message_id,
        });
      }, ANSWER_DELAY);
    }
  } catch (error) {
    console.log(error);
    bot.sendMessage(
      msg.chat.id,
      'Господин, карета превратилась в тыкву. Обратитесь к <a href="https://t.me/VictoriaShuya">Создателю</a> за'
        + ' поддержкой',
      {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      },
    );
  }
});
bot.on('polling_error', (err) => console.log(err.data.error.message));
app.listen(PORT, () => console.log(`My server is running on port ${PORT}`));
