import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import { google } from 'googleapis';
import FormData from 'form-data';
import fs from 'fs';
import {
  PORT, TOKEN, URL_TO_BOT, URL_TO_IMG, URL_TO_SITE,
} from './config.js';
import { getAuthClient } from './auth.cjs';

const app = express();
const bot = new TelegramBot(TOKEN, {
  polling: true,
});
const ANSWER_DELAY = 1000;

const commands = [

  { command: 'start', description: 'Запуск бота' },
  { command: 'record', description: 'Запись в хотелку' },

];
bot.setMyCommands(commands);

const getApiClient = async () => {
  const authClient = await getAuthClient();
  const { files: apiClient } = google.drive({
    version: 'v3',
    auth: authClient,
  });

  return apiClient;
};
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
    } else if (msg.text === '/record') {
      await bot.sendMessage(msg.chat.id, 'Слушаю-с, ваше благородие!', {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Записать хотелку', callback_data: 'recordWishlist' }],
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
    const apiClient = await getApiClient();
    const filePath = await bot.downloadFile(img.photo.at(-1).file_id, './image');
    const requestBody = {
      name: filePath.split('\\')[1],
      fields: 'id',
      parents: ['1JU98Tf-G283zqZfhjvRvV1kirKF510uC'],
    };
    const media = {
      mimeType: 'image/jpg',
      body: fs.createReadStream(filePath),
    };
    await apiClient.create({
      requestBody,
      media,
    });
    fs.unlink(filePath, (err) => {
      if (err) throw err;
    });
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
      case 'recordWishlist':
        await bot.sendMessage(ctx.message.chat.id, 'Хотелка прочитана из мыслей,спасибо');
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
