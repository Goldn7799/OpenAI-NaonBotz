const { MessageMedia } = require('whatsapp-web.js')
const { generateText, generateImage, generateVariationImage } = require('./OpenAI.js')
const { buyItem, pricing, restoreItem, bot } = require('../../globalConfig.js')

// setup global variable
let queue = []
let selectedQueue = {}

// delete queue
const removeQueue = (id) => {
  queue = queue.filter(item => item.id !== id)
  return true
}

// adding new queue
const queueAdd = async (rawData, m, type) => {
  // try {
  //   const data = rawData
  //   data.m = m
  //   data.queueType = type
  //   queue.push(data)
  //   if (queue.length > 1) {
  //     await data.chat.sendMessage(`Queue at ${queue.length}`, { mentions: [await data.senderContact] })
  //   };
  // } catch (e) {
  //   await m.reply('Terjadi kesalahan saat memuat antrian')
  // }
}
const getQueue = async () => {
  return await queue
}

// let activated = false, looadState = -1;
// const emojiLoad = `🕛,🕐,🕑,🕒,🕓,🕔,🕕,🕖,🕗,🕘,🕙,🕚`.split(" ");
// const loadingReaction = (m)=>{
//   activated = true;
//   looadState = -1;
//   const loops = ()=>{
//     looadState++;
//     m.react(emojiLoad[looadState]);
//     if(looadState > emojiLoad.length -1){ looadState = -1; }
//     if(activated){ setTimeout(()=>{ loops(); }, 100); };
//   }
// }

// check and complete queue
const detect = async () => {
  if (queue.length > 0) {
    try {
      selectedQueue = queue[0]
      await selectedQueue.chat.sendMessage('Generating response...', { mentions: [(await selectedQueue.senderContact) ? await selectedQueue.senderContact : ''] })
      if (selectedQueue.queueType === 'text') {
        const response = await generateText(selectedQueue.message, selectedQueue.assistant)
        selectedQueue.chat.sendStateTyping()
        await selectedQueue.m.reply(response)
        queue = queue.filter(items => items.id !== selectedQueue.id)
      } else if (selectedQueue.queueType === 'image') {
        if (await buyItem(pricing.image_cost)) {
          const response = await generateImage(selectedQueue.message)
          if (response) {
            const media = new MessageMedia('image/png', response, null, null)
            await selectedQueue.m.reply(`Result from : *${selectedQueue.message}*`, null, { media: await media })
          } else {
            await selectedQueue.m.reply(`Can't Find : *${selectedQueue.message}*`)
            restoreItem(pricing.image_cost)
          }
        } else {
          await selectedQueue.m.reply(`Sory limit command reached, contact owner\n limit Avabile : *${pricing.limit_avabile.toFixed(4)}$*`)
        }
        queue = queue.filter(items => items.id !== selectedQueue.id)
      } else if (selectedQueue.queueType === 'imageVariation') {
        if (await buyItem(pricing.image_cost)) {
          const response = await generateVariationImage()
          if (response) {
            const media = new MessageMedia('image/png', response, null, null)
            await selectedQueue.m.reply('*Done!*', null, { media: await media })
          } else {
            await selectedQueue.m.reply('Can\'t Find Resolve Image')
            restoreItem(pricing.image_cost)
            queue = queue.filter(items => items.id !== queue[0].id)
          }
        } else {
          await selectedQueue.m.reply(`Sory limit command reached, contact owner\n limit Avabile : *${pricing.limit_avabile.toFixed(4)}$*`)
          queue = queue.filter(items => items.id !== selectedQueue.id)
        }
      } else {
        console.log('Invalid queue type')
        queue = queue.filter(items => items.id !== queue[0].id)
      }
    } catch (e) {
      console.log('Error At detect : ' + e)
      queue[0].m.reply('Failed To Get Response')
      queue = queue.filter(items => items.id !== queue[0].id)
    }
    setTimeout(() => {
      detect()
    }, bot.queueTimeOut)
  } else {
    setTimeout(() => {
      detect()
    }, (bot.queueTimeOut / 2))
  }
}
// run first detect
// detect()

// export
module.exports = {
  queueAdd,
  getQueue,
  removeQueue,
  detect
}
