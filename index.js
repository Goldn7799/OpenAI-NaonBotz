const { primaryHost } = require('./lib/Whatsapp/Connection.js')
const Tesseract = require('tesseract.js')
const { queueAdd } = require('./lib/OpenAI/Queue.js')
const { makeid, matchItem, drawProgressBar, convertWebPtoPNG, capitalLetter, pickRandomObject } = require('./lib/Utility/Utility.js')
const { bot, user, systemConf, pricing, rolePicker } = require('./globalConfig.js')
const interfaces = require('./lib/Whatsapp/Interfaces.js')
const { MessageMedia } = require('whatsapp-web.js')
const fs = require('fs')
const db = require('./lib/Utility/Database.js')
const host = primaryHost

try {
  // Check if ApiKey is avabile or not
  if (bot.openAI_APIKEY.length > 10 || bot.openAI_APIKEY) {
    // connect To Whatsapp
    host.initialize()
    fs.mkdir('./tmp', { recursive: true }, (err) => {
      if (err) {
        console.log(err)
      };
    })
    if (systemConf.interfaces.enabled) {
      interfaces.start()
    };

    // setup Global Variable
    let groupWhitelist = []; const groupReply = []; let database = {}
    const menuList = {
      genral: {
        joingpt: ['.joingpt', 0, 'Make gpt joined and response all chat on group', true],
        leavegpt: ['.leavegpt', 0, "Make gpt leave and can't response all chat on group", true],
        startgpt: ['.startgpt', 0, 'Make bot make first chat to reply', true],
        menu: ['.menu', 0, 'Show all actions', true]
      },
      group: {
        tagall: ['.tagall', 0, 'Tag all members on group', true],
        hidetag: ['.hidetag <text>', 0, 'Hide tag message', true],
        active: ['.active', 0, 'Top 5 Active users', true],
        pickrandom: ['.pickrandom', 0, 'Pick random users', true],
        promote: ['.promote @user', 0, 'Promote User', true],
        demote: ['.demote @user', 0, 'Demote User', true],
        getlink: ['.getlink', 0, 'Get Invite Link Group', true],
        gc: ['.gc [open|close]', 0, 'set Group open or close', true]
      },
      notify: {
        welcome: ['.welcome [on|off]', 0, 'Send Notify when new people join/leave/add/kick', true],
        antilink: ['.antilink [on|off]', 0, 'Send warn and tag admin if msg included link', true],
        antidelete: ['.antidelete [on|off]', 0, 'Anti Delete chats', false]
      },
      common: {
        sticker: ['.s / .sticker', 0, 'Make image to sticker', true],
        toimg: ['.toimg', 0, 'Make image to Sticker', true],
        totext: ['.totext', 0, 'Detect text on Image', true],
        tovn: ['.tovn', 0, 'Make audio to Voice Note', true],
        limit: ['.limit', 0, 'Check global limit and price', true]
      },
      premium: {
        aiimgvar: ['.aiimgvar <query>', 0, 'Extend image', false],
        aiimg: ['.aiimg <query>', 0, 'AI Create Image', true]
      },
      info: {
        speed: ['.speed', 0, 'Test Ping', true],
        owner: ['.owner', 0, 'Owner Contact', true]
      },
      owner: {
        backups: ['.backup', 0, 'Backup databases', true],
        join: ['.join <link>', 0, 'Join Group via link', true],
        console: ['=> <cmd>', 0, 'Shell Command', true],
        stop: ['.stop', 0, 'Stop the bot', true],
        ban: ['.ban', 0, 'Banned Chat/User', true],
        unban: ['.unban', 0, 'Unban User']
      }
    }
    // SYNC DB
    const SyncDB = async () => {
      setTimeout(async () => {
        if (await db.write(database)) {
          SyncDB()
        } else {
          console.log('\x1b[31m\x1b[1m%s\x1b[0m', 'Error Write Database')
          SyncDB()
        }
      }, 1000)
    }
    // read db
    const StartDB = async () => {
      const res = await db.read()
      if (res) {
        database = res
        console.log('\x1b[32m\x1b[1m%s\x1b[0m', '-- Database Loaded --')
        SyncDB()
        console.log('\x1b[32m\x1b[1m%s\x1b[0m', '-- Start Sync Database --')
      } else {
        if (await db.reset(true)) {
          console.log('\x1b[32m\x1b[1m%s\x1b[0m', '-- Resetting Database --')
          StartDB()
        } else {
          console.log('\x1b[31m\x1b[1m%s\x1b[0m', 'Error Reading Database or Reset Database')
        }
      }
    }
    StartDB()
    // Run command if match at condition
    host.on('message', async (m) => {
      try {
        const chat = await m.getChat()
        const command = (m.body.toLowerCase()).split(' ')[0]
        let isWhiteList = false
        if (groupWhitelist.includes(m.from)) {
          isWhiteList = true
        };
        const senderID = (m.author) ? m.author : m.from
        // return generate AI chat
        const next = async (assistant) => {
          if (((!chat.isGroup) || isWhiteList) && m.type === 'chat') {
            queueAdd({
              id: makeid(8),
              chat,
              message: m.body,
              senderContact: await host.getContactById(senderID),
              assistant
            }, m, 'text')
          };
        }
        // DB State
        if (chat.isGroup) {
          if (!Object.keys(database.chats).includes(m.from)) {
            database.chats[m.from] = {
              name: chat.name,
              state: {
                antilink: false,
                welcome: true,
                isBanned: false,
                isVerify: false
              },
              usersChat: {}
            }
          } else {
            database.chats[m.from].name = chat.name
          };
          if (!Object.keys(database.chats[m.from].usersChat).includes(m.author)) {
            database.chats[m.from].usersChat[m.author] = 1
          } else {
            database.chats[m.from].usersChat[m.author] += 1
          }
        };
        if (!Object.keys(database.users).includes(senderID)) {
          database.users[senderID] = {
            isBanned: false,
            exp: 0,
            level: 0,
            warn: 0
          }
        };
        database.users[senderID].exp += 15
        const minLevelUp = bot.levelup * (database.users[senderID].level + 1 / 2) * (database.users[senderID].level + 1)
        if (database.users[senderID].exp > minLevelUp) {
          database.users[senderID].level += 1
          // await (await host.getChatById(senderID)).sendMessage(`-- *Congratulation!!* --\nLevel Before : ${'```'}${database.users[senderID].level - 1}${'```'}\nLevel After : ${'```'}${database.users[senderID].level}${'```'}\nExp : ${'```'}${database.users[senderID].exp}${'```'} */* ${'```'}${bot.levelup * (database.users[senderID].level + 1 / 2) * (database.users[senderID].level + 1)}${'```'}`)
        };
        const readText = async (qMsg) => {
          if (m.hasMedia) {
            const media = await m.downloadMedia()
            if (media) {
              if (media?.mimetype === 'image/png' || media?.mimetype === 'image/jpeg' || media?.mimetype === 'image/jpg' || media?.mimetype === 'image/gif' || media?.mimetype === 'image/webp') {
                const rawBase64Image = `data:${media.mimetype};base64,${media.data}`
                const base64Image = (media.mimetype === 'image/webp') ? await convertWebPtoPNG(rawBase64Image) : rawBase64Image
                if (base64Image) {
                  try {
                    console.log('Reading Text')
                    chat.sendMessage('Detecting Text...')
                    let progress = 0
                    const worker = await Tesseract.createWorker({
                      logger: mc => {
                        if (mc.progress) {
                          progress += mc.progress
                          drawProgressBar(progress)
                        };
                      }
                    })
                    await worker.loadLanguage('eng')
                    await worker.initialize('eng')
                    const { data: { text } } = await worker.recognize(base64Image)
                    console.log(`\nResult : ${text}`)
                    if (text) {
                      queueAdd({
                        id: makeid(8),
                        chat,
                        message: text,
                        senderContact: await host.getContactById(senderID),
                        assistant: qMsg
                      }, m, 'text')
                    } else {
                      await m.reply('cant detect text on this image')
                    };
                    worker.terminate()
                  } catch (e) {
                    console.log('Failed Reading Text')
                  }
                } else { console.log('failed Convert webp to png') };
              };
            };
          };
        }
        // common command
        const commonCommand = async () => {
          if (m.body.length > 0) {
            if (matchItem(command, '.sticker', systemConf.sim.high) || command === '.s') {
              try {
                menuList.common.sticker[1]++
                if (m.hasMedia) {
                  const chat = await m.getChat()
                  await chat.sendMessage('Waitt a sec..')
                  const media = await m.downloadMedia()
                  if (media?.mimetype === 'image/png' || media?.mimetype === 'image/jpeg' || media?.mimetype === 'image/gif' || media?.mimetype === 'image/webp') {
                    await m.react('✅')
                    await m.reply(media, null, { sendMediaAsSticker: true, stickerAuthor: 'SGStudio', stickerName: 'Ai Botz|NaonBotz' })
                  } else {
                    await m.reply('Unknown Format')
                    console.log(media?.mimetype)
                  }
                } else if (m.hasQuotedMsg) {
                  const quoted = await m.getQuotedMessage()
                  if (quoted.hasMedia) {
                    const chat = await m.getChat()
                    await chat.sendMessage('Waitt a sec..')
                    const media = await quoted.downloadMedia()
                    if (media?.mimetype === 'image/png' || media?.mimetype === 'image/jpeg' || media?.mimetype === 'image/gif' || media?.mimetype === 'image/webp') {
                      await m.react('✅')
                      await m.reply(media, null, { sendMediaAsSticker: true, stickerAuthor: 'SGStudio', stickerName: 'Ai Botz|NaonBotz' })
                    } else {
                      await m.reply('Unknown Format')
                      // console.log(media.mimetype);
                    }
                  } else {
                    await m.reply(`Is not a photo, is a ${m.type}`)
                  }
                } else {
                  await m.reply('Where Photo?')
                }
              } catch (e) {
                await m.reply('Failed load image')
              }
            } if (m.hasQuotedMsg && matchItem(command, '.toimg', systemConf.sim.high)) {
              try {
                menuList.common.toimg[1]++
                const quoted = await m.getQuotedMessage()
                if (quoted.type === 'sticker') {
                  const chat = await m.getChat()
                  await chat.sendMessage('Waitt a sec..')
                  const media = await quoted.downloadMedia()
                  if (media?.mimetype === 'image/png' || media?.mimetype === 'image/gif' || media?.mimetype === 'image/jpeg' || media?.mimetype === 'image/webp') {
                    // await chat.sendMessage(media, { mentions: [ await host.getContactById(senderID) ] });
                    await m.react('⌛')
                    await m.reply('Done!!', null, { media })
                  } else {
                    await m.reply('unknown Format')
                    console.log(media.mimetype)
                  }
                } else {
                  await m.reply(`Is not a sticker, is a ${m.type}`)
                }
              } catch (e) {
                await m.reply('Failed to load image')
              }
            } else if (matchItem(command, '.tagall', systemConf.sim.high) && chat.isGroup) {
              try {
                menuList.group.tagall[1]++
                let isSenderAdmin = false
                for (const participant of chat.participants) {
                  if (participant.id._serialized === senderID && participant.isAdmin) {
                    isSenderAdmin = true
                  }
                };
                if (isSenderAdmin) {
                  let text = '*TagAll*\n'
                  const mentions = []
                  for (const participant of chat.participants) {
                    const contact = await host.getContactById(participant.id._serialized)
                    mentions.push(contact)
                    text += `@${participant.id.user} \n`
                  }
                  await chat.sendMessage(text, { mentions })
                } else {
                  await m.reply('You not *Admin*')
                }
              } catch (e) {
                await m.reply("Failed to load User's")
              }
            } else if (matchItem(command, '.hidetag', systemConf.sim.high) && chat.isGroup) {
              try {
                menuList.group.hidetag[1]++
                let isSenderAdmin = false
                for (const participant of chat.participants) {
                  if (participant.id._serialized === senderID && participant.isAdmin) {
                    isSenderAdmin = true
                  }
                };
                if (isSenderAdmin) {
                  const mentions = []
                  for (const participant of chat.participants) {
                    const contact = await host.getContactById(participant.id._serialized)
                    mentions.push(contact)
                  }
                  let text
                  if (m.hasQuotedMsg) {
                    const quoted = await m.getQuotedMessage()
                    if (quoted.body.length > 0) {
                      text = quoted.body
                    } else {
                      text = m.body.replace('.hidetag', '')
                    }
                  } else {
                    text = m.body.replace('.hidetag', '')
                  }
                  chat.sendMessage(await text, { mentions })
                } else {
                  await m.reply('You not *Admin*')
                }
              } catch (e) {
                await m.reply("Failed to load User's")
              }
            } else if (matchItem(command, '.totext', systemConf.sim.high)) {
              try {
                menuList.common.totext[1]++
                const rawMedia = (m.hasQuotedMsg) ? (((await m.getQuotedMessage()).hasMedia) ? ((await m.getQuotedMessage()).downloadMedia()) : ((m.hasMedia) ? (await m.downloadMedia()) : false)) : ((m.hasMedia) ? (await m.downloadMedia()) : false)
                const media = await rawMedia
                if (media) {
                  if (media?.mimetype === 'image/png' || media?.mimetype === 'image/jpeg' || media?.mimetype === 'image/jpg' || media?.mimetype === 'image/gif') {
                    const base64Image = `data:${media.mimetype};base64,${media.data}`
                    try {
                      console.log('Reading Text')
                      chat.sendMessage('Waitt a sec')
                      let progress = 0
                      const worker = await Tesseract.createWorker({
                        logger: mc => {
                          if (mc.progress) {
                            progress += mc.progress
                            drawProgressBar(progress)
                          };
                        }
                      })
                      await worker.loadLanguage('eng')
                      await worker.initialize('eng')
                      const { data: { text } } = await worker.recognize(base64Image)
                      console.log(`\nResult : ${text}`)
                      if (text) {
                        await m.react('🖨')
                        await m.reply(text)
                      } else {
                        await m.reply('cant detect text on this image')
                      };
                      worker.terminate()
                    } catch (e) {
                      console.log('Failed Reading Text')
                    }
                  } else { await m.reply('Is Not Image') }
                } else { await m.reply('Who image?') }
              } catch (e) {
                await m.reply('Failed to load text')
              }
            } else if (matchItem(command, '.tovn', systemConf.sim.high)) {
              try {
                menuList.common.tovn[1]++
                const quoted = (m.hasQuotedMsg) ? await m.getQuotedMessage() : false
                if (quoted && quoted.hasMedia) {
                  const audio = await quoted.downloadMedia()
                  if (audio && (audio.mimetype.split(';')[0] === 'audio/mpeg' || audio.mimetype.split(';')[0] === 'audio/ogg')) {
                    await m.react('🔃')
                    await m.reply(audio, null, { sendAudioAsVoice: true })
                  } else { await m.reply(`Is not audio, is ${audio.mimetype}`) }
                } else { await m.reply('Where Audio?') }
              } catch (e) {
                await m.reply('Failed to load Voice')
              }
            } else if (matchItem(command, '.aiimg', systemConf.sim.high)) {
              try {
                menuList.premium.aiimg[1]++
                const mBody = m.body.replace('.aiimg', '').replace(' ', '')
                if (mBody.length > 0) {
                  queueAdd({
                    id: makeid(8),
                    chat,
                    message: mBody,
                    senderContact: await host.getContactById(senderID),
                    assistant: false
                  }, m, 'image')
                } else { await m.reply('Use .aiimg <query>') }
              } catch (e) {
                await m.reply('Failed to load Image')
              }
            } else if (matchItem(command, '.aiimgvar', systemConf.sim.high)) {
              try {
                menuList.premium.aiimgvar[1]++
                const quoted = (m.hasQuotedMsg) ? await m.getQuotedMessage() : false
                const image = (m.hasMedia) ? await m.downloadMedia() : ((quoted && quoted.hasMedia) ? await quoted.downloadMedia() : false)
                if (image) {
                  const buffer = await Buffer.from(image.data, 'base64')
                  await fs.writeFile('./temp.png', buffer, async (err) => {
                    if (err) {
                      m.reply('Failed Save State')
                    } else {
                      queueAdd({
                        id: makeid(8),
                        chat,
                        message: m.body,
                        senderContact: await host.getContactById(senderID),
                        assistant: false
                      }, m, 'imageVariation')
                    }
                  })
                } else {
                  await m.react('🤣')
                  await m.reply('I think i loss the image')
                }
              } catch (e) {
                await m.reply('Failed to load Image')
              }
            } else if (matchItem(command, '.owner', systemConf.sim.high)) {
              try {
                menuList.info.owner[1]++
                const ownerLists = user.map((userlist) => {
                  if (userlist.isOwner) {
                    return userlist.number + '@c.us'
                  };
                  return 'none'
                }).filter(list => list !== 'none')
                await m.reply(await host.getContactById(ownerLists[0]))
              } catch (e) {
                await m.reply('Failed to load User')
              }
            } else if (matchItem(command, '.speed', systemConf.sim.high)) {
              try {
                menuList.info.speed[1]++
                const start = Date.now()
                const res = await fetch('https://google.com', { method: 'GET' })
                const end = Date.now()
                const ping = end - start
                if (res.status === 200) {
                  await m.reply(`Speed : ${ping.toFixed(2)}MS`)
                } else {
                  await m.reply(`Failed Status : ${res.statusText}(${res.status})`)
                }
              } catch (err) {
                await m.reply('An Error to fetch')
              }
            } else if (matchItem(command, '.pickrandom', systemConf.sim.high) && chat.isGroup) {
              try {
                menuList.group.pickrandom[1]++
                const user = pickRandomObject(chat.participants)
                await m.reply(`Picked @${user.id.user}`, null, { mentions: [await host.getContactById(user.id._serialized)] })
              } catch (e) {
                await m.reply('Failed to load User')
              }
            } else if (matchItem(command, '.active', systemConf.sim.high) && chat.isGroup) {
              try {
                menuList.group.active[1]++
                const numberList = Object.keys(database.chats[m.from].usersChat)
                const rawUserlist = numberList.map((number) => {
                  return { number, chat: database.chats[m.from].usersChat[number] }
                })
                const userList = rawUserlist.sort((a, b) => a.chat - b.chat).reverse()
                let messages = '「 *Top 5 User\'s Active* 」\n'; let listNumber = 0; const mentions = []
                userList.map(async (dt) => {
                  listNumber++
                  if (!(listNumber > 5 || listNumber > (userList - 1))) {
                    messages += `${listNumber}. @${dt.number.replace('@c.us', '')} : *${dt.chat}* Chats\n`
                    try {
                      mentions.push(await host.getContactById(dt.number))
                    } catch (error) {
                      console.log(error)
                    }
                  };
                })
                await m.reply(messages, null, { mentions })
              } catch (e) {
                await m.reply("Failed to load User's")
              }
            } else if (matchItem(command, '.welcome', systemConf.sim.high) && chat.isGroup) {
              try {
                menuList.notify.welcome[1]++
                let isSenderAdmin = false
                for (const participant of chat.participants) {
                  if (participant.id._serialized === senderID && participant.isAdmin) {
                    isSenderAdmin = true
                  }
                };
                if (isSenderAdmin) {
                  if (m.body.split(' ')[1]?.toLowerCase() === 'on') {
                    if (database.chats[m.from].state.welcome) {
                      await m.reply('Welcome already *Actived* on this chat')
                    } else {
                      database.chats[m.from].state.welcome = true
                      await m.reply('Succes *Actived* Welcome on this chat')
                    }
                  } else if (m.body.split(' ')[1]?.toLowerCase() === 'off') {
                    if (!database.chats[m.from].state.welcome) {
                      await m.reply('Welcome already *Deactived* on this chat')
                    } else {
                      database.chats[m.from].state.welcome = false
                      await m.reply('Succes *Deactived* Welcome on this chat')
                    }
                  } else {
                    await m.reply('Example : .welcome on')
                  }
                } else {
                  await m.reply('You not *Admin*')
                }
              } catch (e) {
                await m.reply('Failed to load DB')
              }
            } else if (matchItem(command, '.antilink', systemConf.sim.high) && chat.isGroup) {
              try {
                menuList.notify.antilink[1]++
                let isSenderAdmin = false
                for (const participant of chat.participants) {
                  if (participant.id._serialized === senderID && participant.isAdmin) {
                    isSenderAdmin = true
                  }
                };
                if (isSenderAdmin) {
                  if (m.body.split(' ')[1]?.toLowerCase() === 'on') {
                    if (database.chats[m.from].state.antilink) {
                      await m.reply('Antilink already *Actived* on this chat')
                    } else {
                      database.chats[m.from].state.antilink = true
                      await m.reply('Succes *Actived* Antilink on this chat')
                    }
                  } else if (m.body.split(' ')[1]?.toLowerCase() === 'off') {
                    if (!database.chats[m.from].state.antilink) {
                      await m.reply('Antilink already *Deactived* on this chat')
                    } else {
                      database.chats[m.from].state.antilink = false
                      await m.reply('Succes *Deactived* Antilink on this chat')
                    }
                  } else {
                    await m.reply('Example : .antilink on')
                  }
                } else {
                  await m.reply('You not *Admin*')
                }
              } catch (e) {
                await m.reply('Failed to load DB')
              }
            } else if (matchItem(command, '.promote', systemConf.sim.high) && chat.isGroup) {
              try {
                menuList.group.promote[1]++
                let isSenderAdmin = false; let isMeAdmin = false; let isMentionAdmin = false; let isSenderOwner = false
                const mention = (await m.getMentions())[0]
                if (mention && await chat.owner?.user === mention.id.user) {
                  isSenderOwner = true
                };
                for (const participant of chat.participants) {
                  if (participant.id._serialized === senderID && participant.isAdmin) {
                    isSenderAdmin = true
                  };
                  if (participant.id._serialized === host.info.wid._serialized && participant.isAdmin) {
                    isMeAdmin = true
                  };
                  if (mention && participant.id._serialized === mention.id._serialized && participant.isAdmin) {
                    isMentionAdmin = true
                  };
                };
                if (isMeAdmin) {
                  if (isSenderAdmin) {
                    if (mention) {
                      if (!mention.isMe) {
                        if (!isSenderOwner) {
                          if (!isMentionAdmin) {
                            await chat.promoteParticipants([mention.id._serialized])
                            await m.reply(`Now @${mention.id.user}\n Is *Admin* On *${chat.name}*`, null, { mentions: [await host.getContactById(mention.id._serialized)] })
                          } else {
                            await m.reply('He is already *Admin*')
                          };
                        } else {
                          await m.reply("Can't Edit *Owner* Group")
                        };
                      } else {
                        await m.reply("Can't edit my self")
                      }
                    } else {
                      await m.reply('Please Mentions another people')
                    };
                  } else {
                    await m.reply('You not *Admin*')
                  };
                } else {
                  await m.reply('Iam Not *Admin*')
                };
              } catch (error) {
                await m.reply('Failed save Changes')
                console.log(error)
              }
            } else if (matchItem(command, '.demote', systemConf.sim.high) && chat.isGroup) {
              try {
                menuList.group.demote[1]++
                let isSenderAdmin = false; let isMeAdmin = false; let isMentionAdmin = false; let isSenderOwner = false
                const mention = (await m.getMentions())[0]
                if (mention && await chat.owner?.user === mention.id.user) {
                  isSenderOwner = true
                };
                for (const participant of chat.participants) {
                  if (participant.id._serialized === senderID && participant.isAdmin) {
                    isSenderAdmin = true
                  };
                  if (participant.id._serialized === host.info.wid._serialized && participant.isAdmin) {
                    isMeAdmin = true
                  };
                  if (mention && participant.id._serialized === mention.id._serialized && participant.isAdmin) {
                    isMentionAdmin = true
                  };
                };
                if (isMeAdmin) {
                  if (isSenderAdmin) {
                    if (mention) {
                      if (!mention.isMe) {
                        if (!isSenderOwner) {
                          if (isMentionAdmin) {
                            await chat.demoteParticipants([mention.id._serialized])
                            await m.reply(`Now @${mention.id.user}\n Is Not *Admin* Again On *${chat.name}*`, null, { mentions: [await host.getContactById(mention.id._serialized)] })
                          } else {
                            await m.reply('He is not already *Admin*')
                          };
                        } else {
                          await m.reply("Can't Edit *Owner* Group")
                        };
                      } else {
                        await m.reply("Can't edit my self")
                      }
                    } else {
                      await m.reply('Please Mentions another people')
                    };
                  } else {
                    await m.reply('You not *Admin*')
                  };
                } else {
                  await m.reply('Iam Not *Admin*')
                };
              } catch (error) {
                await m.reply('Failed save Changes')
                console.log(error)
              }
            } else if (matchItem(command, '.backup', systemConf.sim.high)) {
              try {
                menuList.owner.backups[1]++
                const rawOwnerList = user.filter(usr => usr.isOwner)
                const ownerList = (rawOwnerList.length > 0) ? rawOwnerList.map(dt => { return dt.number }) : 'none'
                if (ownerList.includes(senderID.replace('@c.us', ''))) {
                  fs.writeFile(`${process.cwd()}/backups/${Date().substring(0, 24).replaceAll(' ', '-')}.json`, JSON.stringify(await db.read()), async (err) => {
                    if (err) {
                      console.log(err)
                      await m.reply('Error creating backups')
                    } else {
                      console.log('----- Backups Created -----')
                      await m.reply(`Success Create backup ${Date().substring(0, 24).replaceAll(' ', '-')}.json`)
                    }
                  })
                } else {
                  await m.reply('Owner Only!!')
                }
              } catch (e) {
                await m.reply('Failed to load DB')
              }
            } else if (matchItem(command, '.getlink', systemConf.sim.high) && chat.isGroup) {
              try {
                menuList.group.getlink[1]++
                let isMeAdmin = false
                for (const participant of chat.participants) {
                  if (participant.id._serialized === host.info.wid._serialized && participant.isAdmin) {
                    isMeAdmin = true
                  };
                };
                if (isMeAdmin) {
                  const inviteCode = await chat.getInviteCode()
                  await m.reply(`「 *${chat.name}* 」\n • https://chat.whatsapp.com/${inviteCode}`)
                } else {
                  await m.reply('Iam Not *Admin*')
                }
              } catch (e) {
                await m.reply('Failed to load Link')
              }
            } else if (matchItem(command, '.gc', systemConf.sim.high) && chat.isGroup) {
              try {
                menuList.group.gc[1]++
                let isMeAdmin = false; let isSenderAdmin = false
                for (const participant of chat.participants) {
                  if (participant.id._serialized === host.info.wid._serialized && participant.isAdmin) {
                    isMeAdmin = true
                  };
                  if (participant.id._serialized === senderID && participant.isAdmin) {
                    isSenderAdmin = true
                  };
                }
                if (isSenderAdmin) {
                  if (isMeAdmin) {
                    if (m.body.split(' ')[1]?.toLowerCase() === 'open') {
                      await chat.setMessagesAdminsOnly(false)
                      await m.reply('Group Openned')
                    } else if (m.body.split(' ')[1]?.toLowerCase() === 'close') {
                      await chat.setMessagesAdminsOnly(true)
                      await m.reply('Group Closed')
                    } else {
                      await m.reply('Example : .gc open')
                    }
                  } else {
                    await m.reply('Iam not *Admin*')
                  }
                } else {
                  await m.reply('You not *Admin*')
                }
              } catch (e) {
                await m.reply('Failed to load Group')
              }
            } else if (matchItem(command, '.menu', systemConf.sim.high)) {
              try {
                menuList.genral.menu[1]++
                await m.react('✅')
                const listOfMenu = Object.keys(menuList)
                const listOfSubMenu = {}
                const date = new Date()
                for (const list of listOfMenu) {
                  listOfSubMenu[list] = Object.keys(menuList[list])
                };
                const uptimeInSeconds = process.uptime()
                const upHours = Math.floor(uptimeInSeconds / 3600)
                const upMinutes = Math.floor((uptimeInSeconds % 3600) / 60)
                const upSeconds = Math.floor(uptimeInSeconds % 60)
                const more = String.fromCharCode(8206)
                const readMore = more.repeat(4001)
                let messages = `╭─「 ${host.info.pushname} 🤖」\n│ 👋🏻 Hey, ${m._data.notifyName}!\n│\n│ 🧱 Limit : *${pricing.limit_avabile.toFixed(4)}$*\n│ 🦸🏼‍♂️ Role : *${rolePicker(database.users[senderID]?.level)}*\n│ 🔼 Level : *${database.users[senderID]?.level}* ( ${'```'}${(minLevelUp - database.users[senderID].exp)}${'```'} )\n│ 💫 Total XP : ${database.users[senderID]?.exp} / ${minLevelUp} ✨\n│\n│ 📅 Date: *${Date().substring(0, 15)}*\n│ 🕰️ Time: *${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}(UTC)*\n│\n│ 📈 Uptime: *${upHours}H ${upMinutes}M ${upSeconds}S*\n│ 📊 Database: ${'```'}${Object.keys(database.users).length}${'```'} *Users* | ${'```'}${Object.keys(database.chats).length}${'```'} *Group*\n╰────\n${readMore}`
                messages += '───「 Menu List 」───\n'
                await listOfMenu.map(async (menu) => {
                  messages += `╭─「 *${capitalLetter(menu)}* 」\n`
                  for (const subMenu of listOfSubMenu[menu]) {
                    messages += (menuList[menu][subMenu][3]) ? `│ • *${menuList[menu][subMenu][0]}* (${menuList[menu][subMenu][1]}) : ${menuList[menu][subMenu][2]}\n` : ''
                  }
                  messages += '╰────\n'
                })
                const profilePic = await host.getProfilePicUrl(await host.info.wid._serialized)
                const media = (profilePic) ? await MessageMedia.fromUrl(profilePic) : await MessageMedia.fromFilePath('./profile.jpg')
                await m.reply(messages, null, { media })
                // await m.reply(`Hello *${m._data.notifyName}*\n *>General Command<*\n ${"```"}- Reply Bot${"```"} : Trigger AI Chat\n ${"```"}- .joingpt${"```"} : Make gpt joined and response all chat on group\n ${"```"}- .leavegpt${"```"} : Make gpt leave and can't response all chat on group\n ${"```"}- .startgpt${"```"} : Make bot make first chat to reply\n *>Common Command<*\n ${"```"}- .aiimg${"```"} : AI Create Image\n ${"```"}- .sticker / .s${"```"} : Make image to sticker\n ${"```"}- .toimg${"```"} : Make image to Sticker\n ${"```"}- .totext${"```"} : Detect text on Image\n ${"```"}- .tagall${"```"} : Tag all member on group\n ${"```"}- .hidetag${"```"} : Hide tag message\n ${"```"}- .tovn${"```"} : Send Audio as VN\n ${"```"}- .limit${"```"} : Check Global limit`)
              } catch (e) {
                await m.reply('Failed to load DB')
              }
            } else if (matchItem(command, '.limit', systemConf.sim.high)) {
              try {
                menuList.common.limit[1]++
                await m.react('✅')
                await m.reply(`Global Limit : *${pricing.limit_avabile.toFixed(4)}$*`)
                await chat.sendMessage(`*-->List Price of Premium Command<--*\n Create Image(.aiimg) : *${pricing.image_cost}$/image*`)
              } catch (e) {
                await m.reply('Failed to load DB')
              }
            } else {
              if (m.hasQuotedMsg) {
                try {
                  const qMsg = await m.getQuotedMessage()
                  next(((qMsg.fromMe) ? qMsg.body : false))
                } catch (e) {
                  next(false)
                }
              } else { next(false) }
            };
          } else if (m.type === 'chat') {
            if (m.hasQuotedMsg) {
              try {
                const qMsg = await m.getQuotedMessage()
                next(((qMsg.fromMe) ? qMsg.body : false))
              } catch (e) {
                next(false)
              }
            } else { next(false) }
          } else if (m.type === 'sticker' || m.type === 'image') {
            if (m.hasQuotedMsg && m.hasMedia) {
              try {
                const quoted = await m.getQuotedMessage()
                if (quoted.fromMe) {
                  readText(quoted.body)
                };
              } catch (e) {
                console.log('terjad error : A')
              }
            } else if (!chat.isGroup && m.hasMedia) {
              readText(false)
            }
          };
        }
        // Genral Command
        if (chat.isGroup) {
          if (m.type === 'chat') {
            if (matchItem(m.body, '.joingpt', systemConf.sim.high)) {
              menuList.genral.joingpt[1]++
              if (isWhiteList) {
                await m.reply('Already joined')
              } else {
                await m.reply('Succes added GPT')
                groupWhitelist.push(m.from)
              }
            } else if (matchItem(m.body, '.leavegpt', systemConf.sim.high)) {
              menuList.genral.leavegpt[1]++
              if (!isWhiteList) {
                await m.reply('Already leave')
              } else {
                await m.reply('Succes leave')
                groupWhitelist = groupWhitelist.filter(item => item !== m.from)
              }
            } else if (matchItem(m.body, '.startgpt', systemConf.sim.high)) {
              menuList.genral.startgpt[1]++
              await m.reply('Reply saja chat ini dengan pertanyaan atau semacam nya!')
              groupReply.push(m.from)
            } else if (m.hasQuotedMsg) {
              try {
                const quoted = await m.getQuotedMessage()
                if ((!quoted.fromMe) && quoted.type === 'chat' && quoted.body.length > 0 && m.type === 'chat' && (matchItem(command, 'realy', systemConf.sim.high) || matchItem(command, '.aires', systemConf.sim.high) || matchItem(command, 'benarkah', systemConf.sim.high))) {
                  const senderID = (m.author) ? m.author : m.from
                  queueAdd({
                    id: makeid(8),
                    chat,
                    message: quoted.body,
                    senderContact: await host.getContactById(senderID),
                    assistant: false
                  }, m, 'text')
                } else if (quoted.body.length > 0 && quoted.fromMe) {
                  queueAdd({
                    id: makeid(8),
                    chat,
                    message: m.body,
                    senderContact: await host.getContactById(senderID),
                    assistant: quoted.body
                  }, m, 'text')
                } else { commonCommand() }
              } catch (e) { console.log(e) }
            } else { commonCommand() };
          } else { commonCommand() }
        } else { commonCommand() };
      } catch (error) {
        console.log('Failed load message')
        console.log(error)
      }
    })
    // welcome leave
    host.on('group_leave', async (m) => {
      if (database.chats[m.chatId]?.state.welcome) {
        try {
          const profilePic = await host.getProfilePicUrl(m.recipientIds[0])
          const media = (profilePic) ? await MessageMedia.fromUrl(profilePic) : await MessageMedia.fromFilePath('./profile.jpg')
          if (m.type === 'remove') {
            await m.reply(`:/ Kasian Di Kick. @${m.recipientIds[0].replace('@c.us', '')}`, { mentions: [await host.getContactById(m.recipientIds[0])], media })
          } else {
            await m.reply(`:( Selamat Tinggal @${m.recipientIds[0].replace('@c.us', '')}`, { mentions: [await host.getContactById(m.recipientIds[0])], media })
          }
        } catch (error) {
          console.log(error)
        }
      };
    })
    // welcome join
    host.on('group_join', async (m) => {
      if (database.chats[m.chatId]?.state.welcome) {
        try {
          if (m.type === 'add') {
            const mentions = [await host.getContactById(m.author)]; let userList = '\n╭─「 List Culik 」\n'
            for (const users of m.recipientIds) {
              mentions.push(await host.getContactById(users))
              userList += `│ • @${users.replace('@c.us', '')} \n`
            };
            userList += '╰────'
            const profilePic = await host.getProfilePicUrl(m.author)
            const media = (profilePic) ? await MessageMedia.fromUrl(profilePic) : await MessageMedia.fromFilePath('./profile.jpg')
            await m.reply(`:v Kamu telah di culik oleh @${m.author.replace('@c.us')} ${userList}`.replace('undefined', ''), { mentions, media })
          } else {
            const profilePic = await host.getProfilePicUrl(m.recipientIds[0])
            const media = (profilePic) ? await MessageMedia.fromUrl(profilePic) : await MessageMedia.fromFilePath('./profile.jpg')
            await m.reply(`:) Selamat datang di *${(await m.getChat()).name}* @${m.recipientIds[0].replace('@c.us', '')}`, { mentions: [await host.getContactById(m.recipientIds[0])], media })
          }
        } catch (error) {
          console.log(error)
        }
      };
    })
    // antilink
    host.on('message', async (m) => {
      try {
        const chat = await m.getChat()
        if (chat.isGroup && database.chats[m.from].state.antilink) {
          const senderID = (m.author) ? m.author : m.from
          let isSenderAdmin = false
          for (const participant of chat.participants) {
            if (participant.id._serialized === senderID && participant.isAdmin) {
              isSenderAdmin = true
            }
          };
          if (!isSenderAdmin) {
            const isLink = (m.body) ? (!!(((m.body.toLowerCase()).includes('https://') || (m.body.toLowerCase()).includes('http://')))) : false
            if (isLink) {
              const adminList = chat.participants.filter(users => users.isAdmin)
              const mentions = []; let lists = '「 *Link Detected* 」 \n╭─「 Tag Admin\'s 」 \n'
              for (const admins of adminList) {
                mentions.push(await host.getContactById(admins.id._serialized))
                lists += `│ • @${admins.id.user} \n`
              };
              lists += '╰────'
              await m.reply(lists, null, { mentions })
            };
          };
        };
      } catch (error) {
        console.log(error)
      }
    })
  } else {
    console.log('Please fill your OpenAI ApiKey on globalConfig.json')
  };
} catch (e) {
  // user.map(async item =>{
  //   if(item.isDeveloper&&item.isOwner){
  //     await host.sendMessage(`${item.number}@c.us`, `Error : ${e}`);
  //     console.log(`Sended Message to \x1b[1m${e}\x1b[0m`);
  //   };
  // })
  // console.log(`Error : ${e}`);
  console.log(e)
}

module.exports = { host }
