import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import { google } from 'googleapis';
import {
  PORT, TOKEN, URL_TO_BOT, URL_TO_IMG, URL_TO_SITE,
} from './config.js';
import { getAuthClient } from './auth.cjs';

const puk = getAuthClient();
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

// const getApiClient = async () => {
//   const authClient = await getAuthClient();
//   const { spreadsheets: apiClient } = google.sheets({
//     version: 'v4',
//     auth: authClient,
//   });
//
//   return apiClient;
// };
// const getValuesData = async (apiClient, range) => {
//   const { data } = await apiClient.get({
//     spreadsheetId: '1vSacoq7cnVCIc7UXeLzfoL8IZNbc4ejHwOs8Fnxiv0Q',
//     ranges: range,
//     fields: 'sheets',
//     includeGridData: true,
//   });
//
//   return data.sheets;
// };
//
// const findRowIndex = (sheet, message) => {
//   const rowIndex = sheet.data[0].rowData.findIndex((item) => (
//     item.values[0].formattedValue === message
//   ));
//
//   return rowIndex;
// };
// const saysProductStatistics = async (ctx) => {
//   const range = 'Статистика по товарам';
//   const message = ctx.message.text;
//   const apiClient = await getApiClient();
//   const [sheet] = await getValuesData(apiClient, range);
//   const rowIndex = findRowIndex(sheet, message);
//   const product = sheet.data[0].rowData[rowIndex].values[2].formattedValue;
//
//   ctx.reply(`Господин, ты съел такой продукт, как ${product}.`);
// };

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
    } else if (msg.text === '/menu') {
      await bot.sendMessage(msg.chat.id, 'Меню бота', {
        reply_markup: {
          keyboard: [
            ['🐱 Добавить', '🐠 Удалить'],
            ['🐷 Пукнуть', '🐙 Хочу картинку'],
            ['❌ Закрыть меню'],
          ],
          resize_keyboard: true,
        },
      });
    } else if (msg.text === '🐱 Добавить') {
      await bot.sendMessage(msg.chat.id, 'Добавлено в таблицу', {
        reply_markup: {
          remove_keyboard: true,
        },
      });
    } else if (msg.text === '🐷 Пукнуть') {
      await bot.sendMessage(msg.chat.id, 'Пукнул в лужу', {
        reply_markup: {
          remove_keyboard: true,
        },
      });
    } else if (msg.text === '🐠 Удалить') {
      await bot.sendMessage(msg.chat.id, 'Удалено из таблицы', {
        reply_markup: {
          remove_keyboard: true,
        },
      });
    } else if (msg.text === '🐙 Хочу картинку') {
      await bot.sendPhoto(msg.chat.id, URL_TO_IMG, {
        caption: '<b>Держите, Ваше благородие</b>',
        parse_mode: 'HTML',
      });
    } else if (msg.text === '❌ Закрыть меню') {
      await bot.sendMessage(msg.chat.id, 'Меню закрыто', {
        reply_markup: {
          remove_keyboard: true,
        },
      });
    } else if (msg.text === '/second_menu') {
      await bot.sendMessage(msg.chat.id, 'Второе меню', {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Траты в день', callback_data: 'expensesPerDay' }, { text: 'Траты в месяц', callback_data: 'expensesPerMonth' }],
            [{ text: 'Траты за год', callback_data: 'expensesPerYear' }],
            [{ text: 'Доходы', callback_data: 'income' }],
            [{ text: 'Закрыть Меню', callback_data: 'closeMenu' }],
          ],
        },
        reply_to_message_id: msg.message_id,
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
bot.on('photo', async (img) => {
  try {
    await bot.sendMessage(img.chat.id, 'Благодарствую');
    await bot.downloadFile(img.photo[img.photo.length - 1].file_id, './image');
  } catch (error) {
    console.log(error);
    bot.sendMessage(
      img.chat.id,
      'Господин, карета превратилась в тыкву. Обратитесь к <a href="https://t.me/VictoriaShuya">Создателю</a> за'
          + ' поддержкой',
      {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      },
    );
  }
});
bot.on('callback_query', async (ctx) => {
  try {
    switch (ctx.data) {
      case 'closeMenu':
        await bot.deleteMessage(ctx.message.chat.id, ctx.message.message_id);
        await bot.deleteMessage(ctx.message.reply_to_message.chat.id, ctx.message.reply_to_message.message_id);
        break;
      default:
        break;
    }
  } catch (error) {
    console.log(error);
    bot.sendMessage(
      ctx.message.chat.id,
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
