const config = require('./config.json')
const host = require('./index.js')
const { matchItem, capitalLetter, timeParse, pickRandomString, makeProgressBar, makeid, executeCmd, pickRandomObject, executeNode, takeScreenshotWeb } = require('./lib/Utility/Utility.js')
const databases = require('./lib/Database/Database.js')
const { MessageMedia } = require('whatsapp-web.js')
const Tesseract = require('tesseract.js')
const fs = require('fs')
const jsObfuscate = require('javascript-obfuscator')
const openai = require('./lib/Utility/OpenAI')

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
    promote: ['.promote @user', 'Promote User', false],
    demote: ['.demote @user', 'Demote User', false],
    getlink: ['.getlink', 'Get Invite Link Group', true],
    gc: ['.gc [open|close]', 'set Group open or close', false],
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
    limit: ['.limit', 'Check global limit and price', false],
    obfuscate: ['.obfuscate <js script>', 'Encrypt JS', true],
    getimage: ['.getimage <URL>', 'Get Image', true],
    ssweb: ['.ssweb <URL>', 'ScreenShot Web', true]
  },
  premium: {
    ai: ['.ai <Query>', 'AI Response', true],
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

// Cache
const botCache = {
  openAi: {}
} 
// End cache

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
  return new Promise((resolve) => {
    let isSenderAdmin = false
    for (const participant of participants) {
      if (participant.id._serialized === senderId && participant.isAdmin) {
        isSenderAdmin = true
      };
    }
    resolve(isSenderAdmin)
  })
}

const doneLoad = async (m) => {
  return m.react(pickRandomString(['✅', '👍', '👌', '🆗']))
}
const waitLoad = async (m) => {
  return m.react(pickRandomString(['⏳', '🕓', '⏱️', '⏰']))
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
    } else if (matchItem(command, pfcmd('sticker')) || matchItem(command, pfcmd('stiker'))) {
      try {
        const runSticker = async (media) => {
          if ((media.mimetype).includes('image')) {
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
    } else if (matchItem(command, pfcmd('toimg'))) {
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
            let message = '「 *Tag All* 」\n'
            const mentions = []
            for (const participant of chat.participants) {
              mentions.push(await host.getContactById(participant.id._serialized))
              message += `• @${participant.id.user} \n`
            }
            await m.reply(message, null, { mentions })
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
          if (checkIsAdmin(senderId, chat.participants)) {
            await waitLoad(m)
            const mentions = []
            for (const participant of chat.participants) {
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
          if ((media.mimetype).includes('image')) {
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
          if (media) {
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
    } else if (matchItem(command, pfcmd('tovn'))) {
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
    } else if (matchItem(command, pfcmd('owner'))) {
      try {
        await m.reply(await host.getContactById(`${config.bot.owner}@c.us`))
        await doneLoad(m)
      } catch (e) {
        await m.reply('Failed To Load *Contact*')
        databases.func.putLog(`[.red.]Owner : ${e}`)
      }
    } else if (matchItem(command, pfcmd('speed'))) {
      try {
        await waitLoad(m)
        if (speedTestLock) return await m.reply('Speed Test is Running')
        await chat.sendMessage('Testing Speed...')
        speedTestLock = true
        const rawSpeedtest = await executeCmd('speedtest')
        speedTestLock = false
        if (rawSpeedtest.includes('[/.stdout.]')) {
          const speedtest = `${`${rawSpeedtest}`.replace(/\n/g, '[?.?]')}`.replace(/\s{2,}/g, '')
          const server = (speedtest.match(/Server:(.*?)\[\?\.\?\]/))[1]
          const isp = (speedtest.match(/ISP:(.*?)\[\?\.\?\]/))[1]
          const idleLatency = (speedtest.match(/Idle Latency:(.*?)\[\?\.\?\]/))[1]
          const upload = (speedtest.match(/Upload:(.*?)\[\?\.\?\]/))[1]
          const download = (speedtest.match(/Download:(.*?)\[\?\.\?\]/))[1]
          const resultUrl = (speedtest.match(/Result URL:(.*?)\[\?\.\?\]/))[1].replaceAll(' ', '')
          await m.reply(`╭─「 *Speed Test* 」\n│ • *Server* : ${server}\n│ • *ISP* : ${isp}\n│ • *Idle Latency* : ${idleLatency}\n│ • *Download* : ${download}\n│ • *Upload* : ${upload}\n╰────`, null, { media: await MessageMedia.fromUrl(resultUrl + '.png') })
          await doneLoad(m)
        } else {
          await m.reply('Test Speed Failed')
        }
      } catch (e) {
        await m.reply('Failed To Get *Speed*')
        databases.func.putLog(`[.red.]Speed : ${e}`)
      }
    } else if (matchItem(command, pfcmd('pickrandom'))) {
      if (chat.isGroup) {
        try {
          const userPicked = pickRandomObject(chat.participants)
          await m.reply(`Picked @${userPicked.id.user}`, null, { mentions: [await host.getContactById(userPicked.id._serialized)] })
          await doneLoad(m)
        } catch (e) {
          await m.reply('Failed To Get *User*')
          databases.func.putLog(`[.red.]PickRandom : ${e}`)
        }
      } else {
        await m.reply('This command is *Group Only*')
      }
    } else if (matchItem(command, pfcmd('active'))) {
      if (chat.isGroup) {
        try {
          await waitLoad(m)
          const gcDb = (databases.getGroups())[chat.id._serialized]
          const userList = Object.keys(gcDb.usersChat)
          const rawArrayUserList = userList.map((user) => {
            return {
              user,
              count: gcDb.usersChat[user]
            }
          })
          const arrayUserList = rawArrayUserList.sort((a, b) => b.count - a.count)
          let message = "╭─「 *Top 5 Active User's* 」\n"
          const mentions = []
          for (let i = 0; i < 5; i++) {
            const pickedUser = arrayUserList[i]
            if (pickedUser) {
              message += `│ ${i + 1}. @${pickedUser.user.replace('@c.us', '')} *${pickedUser.count}* Chat's\n`
              mentions.push(await host.getContactById(pickedUser.user))
            };
          }
          message += '╰────'
          await m.reply(message, null, { mentions })
          await doneLoad(m)
        } catch (e) {
          await m.reply('Failed To Get *Users*')
          databases.func.putLog(`[.red.]Active : ${e}`)
        }
      } else {
        await m.reply('This command is *Group Only*')
      }
    } else if (matchItem(command, pfcmd('welcome'))) {
      if (chat.isGroup) {
        try {
          if (await checkIsAdmin(senderId, chat.participants)) {
            if (text === 'on') {
              await waitLoad(m)
              const groupDb = (databases.getGroups())[chat.id._serialized]
              if (groupDb.state.welcome) {
                await m.reply('*Welcome* is Already Turned ON')
              } else {
                await m.reply('Success Activate *Welcome* on This Group')
                databases.func.editGroupWelcome(chat.id._serialized, true)
              }
              await doneLoad(m)
            } else if (text === 'off') {
              await waitLoad(m)
              const groupDb = (databases.getGroups())[chat.id._serialized]
              if (!groupDb.state.welcome) {
                await m.reply('*Welcome* is Already Turned OFF')
              } else {
                await m.reply('Success Deactivate *Welcome* on This Group')
                databases.func.editGroupWelcome(chat.id._serialized, false)
              }
              await doneLoad(m)
            } else {
              await m.reply('Example *.welcome on*')
            }
          } else {
            await m.reply('You Not *Admin*')
          }
        } catch (e) {
          await m.reply('Failed To Get *Database*')
          databases.func.putLog(`[.red.]Welcome : ${e}`)
        }
      } else {
        await m.reply('This command is *Group Only*')
      }
    } else if (matchItem(command, pfcmd('antilink'))) {
      if (chat.isGroup) {
        try {
          if (await checkIsAdmin(senderId, chat.participants)) {
            if (text === 'on') {
              await waitLoad(m)
              const groupDb = (databases.getGroups())[chat.id._serialized]
              if (groupDb.state.antilink) {
                await m.reply('*AntiLink* is Already Turned ON')
              } else {
                await m.reply('Success Activate *AntiLink* on This Group')
                databases.func.editGroupAntiLink(chat.id._serialized, true)
              }
              await doneLoad(m)
            } else if (text === 'off') {
              await waitLoad(m)
              const groupDb = (databases.getGroups())[chat.id._serialized]
              if (!groupDb.state.antilink) {
                await m.reply('*AntiLink* is Already Turned OFF')
              } else {
                await m.reply('Success Deactivate *AntiLink* on This Group')
                databases.func.editGroupAntiLink(chat.id._serialized, false)
              }
              await doneLoad(m)
            } else {
              await m.reply('Example *.antilink on*')
            }
          } else {
            await m.reply('You Not *Admin*')
          }
        } catch (e) {
          await m.reply('Failed To Get *Database*')
          databases.func.putLog(`[.red.]AntiLink : ${e}`)
        }
      } else {
        await m.reply('This command is *Group Only*')
      }
    } else if (matchItem(command, pfcmd('backup'))) {
      try {
        if (`${config.bot.owner}@c.us` === senderId) {
          await waitLoad(m)
          await m.reply(await databases.func.makeBackup())
          await doneLoad(m)
        } else {
          await m.reply('You not *Owner*')
        }
      } catch (e) {
        await m.reply('Failed To Get *Database*')
        databases.func.putLog(`[.red.]Backup : ${e}`)
      }
    } else if (matchItem(command, pfcmd('getlink'))) {
      if (chat.isGroup) {
        try {
          if (await checkIsAdmin(host.info.wid._serialized, chat.participants)) {
            await waitLoad(m)
            await m.reply(`「 *${chat.name}* 」\n • https://chat.whatsapp.com/${await chat.getInviteCode()}`)
            await doneLoad(m)
          } else {
            await m.reply('Iam not *Admin*')
          }
        } catch (e) {
          await m.reply('Failed To Get *Invite Link*')
          databases.func.putLog(`[.red.]GetLink : ${e}`)
        }
      } else {
        await m.reply('This command is *Group Only*')
      }
    } else if (matchItem(command, pfcmd('gcinfo'))) {
      if (chat.isGroup) {
        try {
          await waitLoad(m)
          const groupIconUrl = await host.getProfilePicUrl(chat.id._serialized)
          const media = (groupIconUrl) ? await MessageMedia.fromUrl(groupIconUrl) : MessageMedia.fromFilePath('./public/assets/user.png')
          let messageAdminList = "╭─「 Admin's 」\n"
          const mentions = []
          if (chat.owner) {
            mentions.push(await host.getContactById(chat.owner._serialized))
          };
          let totalAdmin = 0
          for (const participant of chat.participants) {
            if (participant.isAdmin) {
              messageAdminList += `│ • @${participant.id.user} \n`
              mentions.push(await host.getContactById(participant.id._serialized))
              totalAdmin++
            };
          }
          messageAdminList += '╰────\n'
          const groupDb = (databases.getGroups())[chat.id._serialized]
          await m.reply(`Name : *${chat.name}*\nUID : *${chat.id._serialized}*\nCreated at : *${(chat.createdAt) ? `${chat.createdAt}`.substring(0, 24) : 'Unknown Time'}*\nAntilink : *${(groupDb.state.antilink) ? 'On' : 'Off'}*\nWelcome : *${(groupDb.state.welcome) ? 'On' : 'Off'}*\nis Archived : *${(chat.archived) ? 'Yes' : 'No'}*\nis Muted : *${(chat.isMuted) ? 'Yes' : 'No'}*\nis Read Only : *${(chat.isReadOnly) ? 'Yes' : 'No'}*\nis Pinned : *${(chat.pinned) ? 'Yes' : 'No'}*\nOwner : ${(chat.owner?.user) ? `@${chat.owner?.user}` : 'No Have Owner'} \n${messageAdminList}Total Admin : *${totalAdmin} User's*\nTotal Member : *${chat.participants.length} User's*\nUnread Count : *${(chat.unreadCount) ? chat.unreadCount : 0} Chat's*`, null, { media, mentions })
          await doneLoad(m)
        } catch (e) {
          await m.reply('Failed To Get *Group Info*')
          databases.func.putLog(`[.red.]GcInfo : ${e}`)
        }
      } else {
        await m.reply('This command is *Group Only*')
      }
    } else if (matchItem(command, pfcmd('run'))) {
      if (`${config.bot.owner}@c.us` === senderId) {
        try {
          if (text) {
            await waitLoad(m)
            await chat.sendMessage(`Running *${text}*`)
            const executeLogs = await executeCmd(text)
            databases.func.putLog(`[.yellow.]WA|[${(m._data.notifyName) ? m._data.notifyName : 'BOT'}] => ${text}`)
            databases.func.putLog(`[.white.]${executeLogs}`)
            await m.reply(executeLogs)
            await doneLoad(m)
          } else {
            await m.reply('Example *.run echo "Hello World"*')
          }
        } catch (e) {
          await m.reply('Failed To Get *StdOut*')
          databases.func.putLog(`[.red.]Run : ${e}`)
        }
      } else {
        await m.reply('You not *Owner*')
      }
    } else if (matchItem(command, pfcmd('runnode'))) {
      if (`${config.bot.owner}@c.us` === senderId) {
        try {
          if (text) {
            await waitLoad(m)
            await chat.sendMessage(`Running Node *${text}*`)
            const executeLogs = await executeNode(text)
            databases.func.putLog(`[.yellow.]WA|[${(m._data.notifyName) ? m._data.notifyName : 'BOT'}] (NODE)=> ${text}`)
            databases.func.putLog(`[.white.]${executeLogs}`)
            await m.reply(executeLogs)
            await doneLoad(m)
          } else {
            await m.reply('Example *.runnode console.log("Hello World")*')
          }
        } catch (e) {
          await m.reply('Failed To Get *StdOut*')
          databases.func.putLog(`[.red.]RunNode : ${e}`)
        }
      } else {
        await m.reply('You not *Owner*')
      }
    } else if (matchItem(command, pfcmd('obfuscate'))) {
      try {
        if (text) {
          await waitLoad(m)
          await chat.sendMessage('Checking Code..')
          const textFiltered = text.replace(/\n/g, '')
          fs.writeFile(`${process.cwd()}/data-store/temp.js`, `${textFiltered}`, async (err) => {
            if (err) {
              await m.reply('Failed to check *Code*')
            } else {
              const testCode = await executeCmd('yarn run eslint ./data-store/temp.js --no-ignore --fix')
              if (!(testCode.includes('[/.err.]') || testCode.includes('[/.stderr.]'))) {
                const result = jsObfuscate.obfuscate(textFiltered)
                await m.reply(result.getObfuscatedCode())
                await doneLoad(m)
              } else {
                await m.reply('Code test *Failed*, please fix your code')
                await chat.sendMessage(testCode)
                await doneLoad(m)
              }
            }
          })
        } else {
          await m.reply('Where Code??, Example : .obfuscate console.log("Hello World")')
        }
      } catch (e) {
        await m.reply('Failed To Get *Code*')
        databases.func.putLog(`[.red.]Obfuscate : ${e}`)
      }
    } else if (matchItem(command, pfcmd('getimage'))) {
      try {
        if (text) {
          await waitLoad(m)
          const media = await MessageMedia.fromUrl(text)
          await m.reply('Done!!', null, { media })
          await doneLoad(m)
        } else {
          await m.reply('Where URL???')
        }
      } catch (e) {
        await m.reply('URL Failed To Get *Image*')
        databases.func.putLog(`[.red.]GetImage : ${e}`)
      }
    } else if (matchItem(command, pfcmd('ssweb'))) {
      try {
        if (text) {
          await waitLoad(m)
          takeScreenshotWeb(text, './data-store/temp.png')
            .then(async () => {
              const media = MessageMedia.fromFilePath('./data-store/temp.png')
              await m.reply('Done!!', null, { media })
              await doneLoad(m)
            })
            .catch(async () => {
              if (text.includes('http://') || text.includes('https://')) {
                await m.reply('Failed to get *Image*')
              } else {
                takeScreenshotWeb('http://' + text, './data-store/temp.png')
                  .then(async () => {
                    const media = MessageMedia.fromFilePath('./data-store/temp.png')
                    await m.reply('Done!!', null, { media })
                    await doneLoad(m)
                  })
                  .catch(async () => {
                    await m.reply('Failed to get *Image*')
                  })
              }
            })
        } else {
          await m.reply('Where Image??')
        }
      } catch (e) {
        await m.reply('URL Failed To Get *ScreenShot*')
        databases.func.putLog(`[.red.]SSWeb : ${e}`)
      }
    } else if (matchItem(command, pfcmd('ai'))) {
      if (text) {
        try {
          await waitLoad(m)
          if (botCache.openAi[m.from]) {
            const result = await openai.chatCompletion(text, botCache.openAi[m.from])
            await m.reply(result)
            botCache.openAi[m.from] = result
          } else {
            const result = await openai.chatCompletion(text)
            await m.reply(result)
            botCache.openAi[m.from] = result
          }
          await doneLoad(m)
        } catch (e) {
          await m.reply('Failed to getting *Response*')
          databases.func.putLog(`[.red.]Ai : ${e}`)
        }
      } else {
        await m.reply('No Text Found.')
      }
    } else if (matchItem(command, pfcmd('aiimg'))) {
      if (databases.limit.openaiBuy(0.018)) {
        if (text) {
          try {
            await waitLoad(m)
            const media = await MessageMedia.fromUrl(await openai.generateImage(text))
            await m.reply(`This is a *${text}*`, null, { media })
            await doneLoad(m)
          } catch (e) {
            databases.limit.openaiSell(0.018)
            await m.reply('Failed to getting *Image*')
            databases.func.putLog(`[.red.]AiIMG : ${e}`)
          }
        } else {
          databases.limit.openaiSell(0.018)
          await m.reply('Where Text or Query??')
        }
      } else {
        await m.reply(('Global Limit Reached!!\nPrice : *0.00018$*\nGlobal Limit : ' + databases.limit.getOpenaiBalance()))
      }
    } else if (matchItem(command, pfcmd('aiimgvar'))) {
      if (databases.limit.openaiBuy(0.018)) {
        const quoted = (!m.hasMedia && m.hasQuotedMsg) ? await m.getQuotedMessage() : false
        if (m.hasMedia || quoted?.hasMedia) {
          try {
            await waitLoad(m)
            const rawMedia = (quoted?.hasMedia) ? await quoted.downloadMedia() : await m.downloadMedia()
            const buffer = await Buffer.from(rawMedia.data, 'base64')
            await fs.writeFileSync('./data-store/varTemp.png', buffer)
            const media = await MessageMedia.fromUrl(await openai.generateImageVariation(`${process.cwd()}/data-store/varTemp.png`))
            await m.reply(`Done!!`, null, { media })
            await doneLoad(m)
          } catch (e) {
            databases.limit.openaiSell(0.018)
            await m.reply('Failed to getting *Image*')
            databases.func.putLog(`[.red.]AiIMGVar : ${e}`)
          }
        } else {
          databases.limit.openaiSell(0.018)
          await m.reply('Where Image??')
        }
      } else {
        await m.reply(('Global Limit Reached!!\nPrice : *0.00018$*\nGlobal Limit : ' + databases.limit.getOpenaiBalance()))
      }
    };
  } catch (e) {
    databases.func.putLog(`[.red.]Feature : ${e}`)
    console.error(e)
  }
})

// welcome leave
host.on('group_leave', async (m) => {
  if ((databases.getGroups())[m.chatId]?.state.welcome) {
    try {
      const profilePic = await host.getProfilePicUrl(m.recipientIds[0])
      const media = (profilePic) ? await MessageMedia.fromUrl(profilePic) : await MessageMedia.fromFilePath('./public/assets/user.png')
      if (m.type === 'remove') {
        await m.reply(`:/ LOL, You Kicked. @${m.recipientIds[0].replace('@c.us', '')}`, { mentions: [await host.getContactById(m.recipientIds[0])], media })
      } else {
        await m.reply(`:( Bye @${m.recipientIds[0].replace('@c.us', '')}`, { mentions: [await host.getContactById(m.recipientIds[0])], media })
      }
    } catch (e) {
      databases.func.putLog(`[.red.]Welcome Leave : ${e}`)
    }
  };
})
// welcome join
host.on('group_join', async (m) => {
  if ((databases.getGroups())[m.chatId]?.state.welcome) {
    try {
      if (m.type === 'add') {
        const mentions = [await host.getContactById(m.author)]; let userList = '\n╭─「 Kidnap List 」\n'
        for (const users of m.recipientIds) {
          mentions.push(await host.getContactById(users))
          userList += `│ • @${users.replace('@c.us', '')} \n`
        };
        userList += '╰────'
        const profilePic = await host.getProfilePicUrl(m.author)
        const media = (profilePic) ? await MessageMedia.fromUrl(profilePic) : await MessageMedia.fromFilePath('./public/assets/user.png')
        await m.reply(`:v you have been kidnapped by @${m.author.replace('@c.us')} ${userList}`.replace('undefined', ''), { mentions, media })
      } else {
        const profilePic = await host.getProfilePicUrl(m.recipientIds[0])
        const media = (profilePic) ? await MessageMedia.fromUrl(profilePic) : await MessageMedia.fromFilePath('./public/assets/user.png')
        await m.reply(`:) Welcome To *${(await m.getChat()).name}* @${m.recipientIds[0].replace('@c.us', '')}`, { mentions: [await host.getContactById(m.recipientIds[0])], media })
      }
    } catch (e) {
      databases.func.putLog(`[.red.]Welcome Join : ${e}`)
    }
  };
})
// antilink
host.on('message', async (m) => {
  try {
    const chat = await m.getChat()
    if (chat.isGroup && (databases.getGroups())[m.from]?.state.antilink && !m.fromMe) {
      if (!(await checkIsAdmin(m.author, chat.participants))) {
        const isLink = (m.body) ? ((m.body.toLowerCase()).includes('https://') || (m.body.toLowerCase()).includes('http://')) : false
        if (isLink) {
          const adminList = chat.participants.filter(users => users.isAdmin)
          const mentions = []
          let lists = '「 *Link Detected* 」 \n╭─「 Tag Admin\'s 」 \n'
          for (const admins of adminList) {
            mentions.push(await host.getContactById(admins.id._serialized))
            lists += `│ • @${admins.id.user} \n`
          };
          lists += '╰────'
          await m.reply(lists, null, { mentions })
        };
      };
    };
  } catch (e) {
    databases.func.putLog(`[.red.]AntiLink Message : ${e}`)
  }
})

module.exports = host
