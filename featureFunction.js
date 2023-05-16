const config = require('./config.json')
const host = require('./index.js')
const { matchItem, capitalLetter, timeParse, pickRandomString, makeProgressBar, makeid, executeCmd } = require('./lib/Utility/Utility.js')
const databases = require('./lib/Database/Database.js')
const { MessageMedia } = require('whatsapp-web.js')
const Tesseract = require('tesseract.js')

const menuList = {
  genral: {
    ai: ['.ai <query>', 'AI Chat', true],
    menu: ['.menu', 'Show All Feature', true]
  },
  group: {
    tagall: ['.tagall', 'Tag all members on group', true],
    hidetag: ['.hidetag <text>', 'Hide tag message', true],
    active: ['.active', 'Top 5 Active users', true],
    pickrandom: ['.pickrandom', 'Pick random users', true],
    promote: ['.promote @user', 'Promote User', true],
    demote: ['.demote @user', 'Demote User', true],
    getlink: ['.getlink', 'Get Invite Link Group', true],
    gc: ['.gc [open|close]', 'set Group open or close', true],
    gcinfo: ['.gcinfo', 'get group information', true]
  },
  notify: {
    welcome: ['.welcome [on|off]', 'Send Notify when new people join/leave/add/kick', true],
    antilink: ['.antilink [on|off]', 'Send warn and tag admin if msg included link', true],
    antidelete: ['.antidelete [on|off]', 'Anti Delete chats', false]
  },
  common: {
    sticker: ['.s / .sticker', 'Make image to sticker', true],
    toimg: ['.toimg', 'Make image to Sticker', true],
    totext: ['.totext', 'Detect text on Image', true],
    tovn: ['.tovn', 'Make audio to Voice Note', true],
    limit: ['.limit', 'Check global limit and price', true],
    obfuscate: ['.obfuscate <js script>', 'Encrypt JS', true]
  },
  premium: {
    aiimgvar: ['.aiimgvar <query>', 'Extend image', false],
    aiimg: ['.aiimg <query>', 'AI Create Image', true]
  },
  info: {
    speed: ['.speed', 'Test Ping', true],
    owner: ['.owner', 'Owner Contact', true]
  },
  owner: {
    backups: ['.backup', 'Backup databases', true],
    join: ['.join <link>', 'Join Group via link', true],
    console: ['=> <cmd>', 'Shell Command', true],
    stop: ['.stop', 'Stop the bot', true],
    ban: ['.ban', 'Banned Chat/User', true],
    unban: ['.unban', 'Unban User'],
    run: ['.run', 'run command'],
    restart: ['.restart', 'restart process']
  }
}

const prefix = config.bot.prefix
const pfcmd = (cmd) => {
  return `${prefix}${cmd}`
}
const rolePicker = (level) => {
  if (level > 60) {
    return 'Advanced'
  } else if (level > 50) {
    return 'Advanced'
  } else if (level > 40) {
    return 'Upper Intermediate'
  } else if (level > 30) {
    return 'Intermediate'
  } else if (level > 20) {
    return 'Elementary'
  } else if (level > 10) {
    return 'Beginner'
  } else {
    return 'Beginner'
  }
}
const checkIsAdmin = (senderId, participants) => {
  return new Promise((resolve)=>{
    let isSenderAdmin = false
    for (let participant of participants) {
      if (participant.id._serialized === senderId && participant.isAdmin) {
        isSenderAdmin = true
      };
    }
    resolve(isSenderAdmin)
  })
}

const doneLoad = async (m)=>{
  return m.react(pickRandomString(['✅','👍','👌','🆗']))
}
const waitLoad = async (m)=>{
  return m.react(pickRandomString(['⏳','🕓','⏱️','⏰']))
}

const mediaToBase64 = (media) => {
  return `data:${media.mimetype};base64,${media.data}`
}

let speedTestLock = false

host.on('message_create', async (m) => {
  try {
    const command = (m.body.toLowerCase()).split(' ')[0]
    const rawText = `${m.body}`.replace(command, '')
    const text = (rawText.startsWith(' ')) ? rawText.replace(' ', '') : rawText
    const chat = await m.getChat()
    const senderId = (m.author) ? m.author : m.from
    // Command
    if (matchItem(command, pfcmd('menu'))) {
      try {
        await waitLoad(m)
        const listOfMenu = Object.keys(menuList)
        const listSubMenu = {}
        for (const menus of listOfMenu) {
          listSubMenu[menus] = Object.keys(menuList[menus])
        }
        const date = new Date()
        const uptimeInSeconds = process.uptime()
        const upHours = Math.floor(uptimeInSeconds / 3600)
        const upMinutes = Math.floor((uptimeInSeconds % 3600) / 60)
        const upSeconds = Math.floor(uptimeInSeconds % 60)
        const more = String.fromCharCode(8206)
        const readMore = more.repeat(4001)
        const db = databases.getDb()
        const senderDb = db.chats[senderId]
        const minLevelUp = 250 * (senderDb.level + 1 / 2) * (senderDb.level + 1)
        const upTime = (timeParse(upHours, upMinutes, upSeconds)).split(':')
        let messages = `╭─「 ${host.info.pushname} 🤖」\n│ 👋🏻 Hey, ${m._data.notifyName}!\n│\n│ 🧱 Limit : *${senderDb.limit.toFixed(4)}$*\n│ 🦸🏼‍♂️ Role : *${rolePicker(senderDb.level)}*\n│ 🔼 Level : *${senderDb.level}* ( ${'```'}${(minLevelUp - senderDb.exp)}${'```'} )\n│ 💫 Total XP : ${senderDb.exp} / ${minLevelUp} ✨\n│\n│ 📅 Date: *${Date().substring(0, 15)}*\n│ 🕰️ Time: *${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}(UTC)*\n│\n│ 📈 Uptime: *${upTime[0]}H ${upTime[1]}M ${upTime[2]}S*\n│ 📊 Database: ${'```'}${Object.keys(databases.getChats()).length}${'```'} *Users* | ${'```'}${Object.keys(databases.getGroups()).length}${'```'} *Group*\n╰────\n${readMore}`
        messages += '───「 Menu List 」───\n'
        for (const menus of listOfMenu) {
          messages += `╭─「 *${capitalLetter(menus)}* 」\n`
          for (const subMenu of listSubMenu[menus]) {
            messages += (menuList[menus][subMenu][2]) ? `│ • *${menuList[menus][subMenu][0]}* : ${menuList[menus][subMenu][1]}\n` : ''
          }
          messages += '╰────\n'
        }
        const profilePic = await host.getProfilePicUrl(await host.info.wid._serialized)
        const media = (profilePic) ? await MessageMedia.fromUrl(profilePic) : await MessageMedia.fromFilePath('./profile.jpg')
        await m.reply(messages, null, { media })
        await doneLoad(m)
      } catch (e) {
        await m.reply('Failed to load *Menu*')
        databases.func.putLog(`[.red.]Menu : ${e}`)
      }
    } else if(matchItem(command, pfcmd('sticker')||matchItem(command, pfcmd('stiker')))) {
      try {
        const runSticker = async (media) => {
          if((media.mimetype).includes('image')){
            await waitLoad(m)
            await chat.sendMessage('Waitt A Sec..')
            await m.reply(media, null, { sendMediaAsSticker: true, stickerName: 'NaonBotz', stickerAuthor: 'SGStudio' })
            await doneLoad(m)
          } else {
            await m.reply(`Unknown Format *${media.mimetype}*`)
          }
        }
        if (m.hasMedia) {
          await runSticker(await m.downloadMedia())
        } else if (m.hasQuotedMsg) {
          const quotedMsg = await m.getQuotedMessage()
          const media = (quotedMsg.hasMedia) ? await quotedMsg.downloadMedia() : false
          if (media) {
            runSticker(media)
          } else {
            await m.reply('Where Image??')
          }
        } else {
          await m.reply('Where Image??')
        }
      } catch (e) {
        await m.reply('Failed to load *image*')
        databases.func.putLog(`[.red.]Sticker : ${e}`)
      }
    } else if (matchItem(command, pfcmd('toimg'))){
      try {
        const quotedMsg = (m.hasQuotedMsg) ? await m.getQuotedMessage() : false
        if (quotedMsg && quotedMsg.hasMedia) {
          await waitLoad(m)
          await chat.sendMessage('Waitt A Sec')
          const media = await quotedMsg.downloadMedia()
          await m.reply('Done!!..', null, { media })
          await doneLoad(m)
        } else {
          await m.reply('Where Sticker??')
        }
      } catch (e) {
        await m.reply('Failed to load *Sticker*')
        databases.func.putLog(`[.red.]ToImg : ${e}`)
      }
    } else if (matchItem(command, pfcmd('tagall'))) {
      if (chat.isGroup) {
        try {
          if (await checkIsAdmin(senderId, chat.participants)) {
            await waitLoad(m)
            let text = '「 *Tag All* 」\n'
            const mentions = []
            for (let participant of chat.participants) {
              mentions.push(await host.getContactById(participant.id._serialized))
              text += `• @${participant.id.user} \n`
            }
            await m.reply(text, null, { mentions })
            await doneLoad(m)
          } else {
            await m.reply('You Is Not *Admin*')
          }
        } catch (e) {
          await m.reply('Failed To Load *Users*')
          databases.func.putLog(`[.red.]TagAll : ${e}`)
        }
      } else {
        await m.reply('This command is *Group Only*')
      }
    } else if (matchItem(command, pfcmd('hidetag'))) {
      if (chat.isGroup) {
        try {
          if (checkIsAdmin(senderId, chat.participants)){
            await waitLoad(m)
            const mentions = []
            for (let participant of chat.participants) {
              mentions.push(await host.getContactById(participant.id._serialized))
            }
            await m.reply(text, null, { mentions })
            await doneLoad(m)
          } else {
            await m.reply('You Is Not *Admin*')
          }
        } catch (e) {
          await m.reply('Failed To Load *Users*')
          databases.func.putLog(`[.red.]HideTag : ${e}`)
        }
      } else {
        await m.reply('This command is *Group Only*')
      }
    } else if (matchItem(command, pfcmd('totext'))) {
      try {
        const runToText = async (media) => {
          if ((media.mimetype).includes('image')){
            await waitLoad(m)
            await chat.sendMessage('Waitt A Sec..')
            const logId = makeid(8)
            let progress = 0
            const worker = await Tesseract.createWorker({
              logger: async wrk => {
                if (wrk.progress) {
                  progress += wrk.progress
                  databases.func.editLog(logId, '[.blue.]' + await makeProgressBar(progress, 'Detecting Text '))
                };
              }
            })
            await worker.loadLanguage('eng')
            await worker.initialize('eng')
            const { data: { text } } = await worker.recognize(mediaToBase64(media))
            if (text) {
              await m.reply(text)
            } else {
              await m.reply('No Text Detected')
            }
            await doneLoad(m)
          } else {
            await m.reply(`Is Not Image, Is A *${media.mimetype}*`)
          }
        }
        if (m.hasMedia) {
          await runToText(await m.downloadMedia())
        } else if (m.hasQuotedMsg) {
          const quotedMsg = await m.getQuotedMessage()
          const media = (quotedMsg.hasMedia) ? await quotedMsg.downloadMedia() : false
          if(media) {
            await runToText(media)
          } else {
            await m.reply('Where Image??')
          }
        } else {
          await m.reply('Where Image??')
        }
      } catch (e) {
        await m.reply('Failed To Load *Image*')
        databases.func.putLog(`[.red.]ToText : ${e}`)
      }
    } else if(matchItem(command, pfcmd('tovn'))) {
      try {
        const quotedMsg = (m.hasQuotedMsg) ? await m.getQuotedMessage() : false
        const media = (quotedMsg.hasMedia) ? await quotedMsg.downloadMedia() : false
        if (media) {
          if ((media.mimetype).includes('audio')) {
            await waitLoad(m)
            await m.reply(media, null, { sendAudioAsVoice: true })
            await doneLoad(m)
          } else {
            await m.reply(`Is not Audio, is a *${media.mimetype}*`)
          }
        } else {
          await m.reply('Where Audio??')
        }
      } catch (e) {
        await m.reply('Failed To Load *Audio*')
        databases.func.putLog(`[.red.]ToVn : ${e}`)
      }
    } else if(matchItem(command, pfcmd('owner'))) {
      try {
        await m.reply(await host.getContactById(`${config.bot.owner}@c.us`))
        await doneLoad(m)
      } catch (e) {
        await m.reply('Failed To Load *Contact*')
        databases.func.putLog(`[.red.]Owner : ${e}`)
      }
    } else if(matchItem(command, pfcmd('speed'))) {
      try {
        await waitLoad(m)
        if (speedTestLock) return await m.reply('Speed Test is Running')
        await chat.sendMessage('Testing Speed...')
        speedTestLock = true
        const rawSpeedtest = await executeCmd('speedtest')
        speedTestLock = false
        if (rawSpeedtest.includes('[.stdout.]')) {
          console.log(rawSpeedtest)
          const speedtest = `${`${rawSpeedtest}`.replace(/\n/g, '[?.?]')}`.replace(/\s{2,}/g, '')
          const server = (speedtest.match(/Server:(.*?)\[\?\.\?\]/))[1]
          const isp = (speedtest.match(/ISP:(.*?)\[\?\.\?\]/))[1]
          const idleLatency = (speedtest.match(/Idle Latency:(.*?)\[\?\.\?\]/))[1]
          const upload = (speedtest.match(/Upload:(.*?)\[\?\.\?\]/))[1]
          const download = (speedtest.match(/Download:(.*?)\[\?\.\?\]/))[1]
          const resultUrl = (speedtest.match(/Result URL:(.*?)\[\?\.\?\]/))[1].replaceAll(' ', '')
          await m.reply(`╭─「 *Speed Test* 」\n│ • *Server* : ${server}\n│ • *ISP* : ${isp}\n│ • *Idle Latency* : ${idleLatency}\n│ • *Upload* : ${upload}\n│ • *Download* : ${download}\n╰────`, null, { media: await MessageMedia.fromUrl(resultUrl + '.png') })
          await doneLoad(m)
        } else {
          await m.reply('Test Speed Failed')
        }
      } catch (e) {
        await m.reply('Failed To Get *Speed*')
        databases.func.putLog(`[.red.]Speed : ${e}`)
      }
    };
  } catch (e) {
    databases.func.putLog(`[.red.]Feature : ${e}`)
    console.error(e)
  }
})

module.exports = host
