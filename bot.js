import express from 'express'
import { PORT, TOKEN } from './config.js'
import {Telegraf} from 'telegraf'

const app = express()
const bot = new Telegraf(TOKEN)

bot.start(ctx => {
    ctx.reply('Слушаю-с, ваше благородие!')
})

bot.on('text', async msg => {
   await bot.sendMessage(msg.chat.id, msg.text)
})



bot.launch()
app.listen(PORT, () => console.log(`My server is running on port ${PORT}`))