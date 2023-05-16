const config = require('./config.json')
const host = require('./index.js')
const { matchItem, capitalLetter, timeParse } = require('./lib/Utility/Utility.js')
const databases = require('./lib/Database/Database.js')
const { MessageMedia } = require('whatsapp-web.js')

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

host.on('message_create', async (m) => {
  try {
    const command = (m.body.toLowerCase()).split(' ')[0]
    // const text = `${m.body}`.replace(command)
    // const chat = await m.getChat()
    const senderId = (m.author) ? m.author : m.from
    // Command
    if (matchItem(command, pfcmd('menu'))) {
      await m.react('✅')
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
    };
  } catch (e) {
    databases.func.putLog(`[.red.]Feature : ${e}`)
    console.error(e)
  }
})

module.exports = host
