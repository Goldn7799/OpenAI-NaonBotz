const databases = require('./lib/Database/Database.js')
const color = require('./lib/Utility/ccolor.js')
const express = require('express')
const cors = require('cors')
const config = require('./config.json')
const bodyParser = require('body-parser')
const utility = require('./lib/Utility/Utility.js')
const host = require('./lib/WhatsApp/Connection.js')

// Main Command
const runMain = async () => {
  console.log(`${color.cyan}`, 'Starting main sc..')
  databases.func.putLog('[.cyan.]Starting main sc..')
  databases.func.updateUserAuth()
  console.log(`${color.cyan}`, 'Updating user auth..')
  databases.func.putLog('[.cyan.]Updating user auth..')
  /// / Interface
  const app = express()
  app.use(cors({
    origin: config.bot.origin
  }))
  app.use(bodyParser.json({ limit: config.bot.limit }))
  app.use('/', express.static('./public'))

  app.get('/user/:type/:username/:password', (req, res) => {
    const { username, password, type } = req.params
    if (username && password) {
      let users = databases.getUsers()
      const emailList = Object.keys(users)
      if (username.includes('@')) {
        const user = users[username]
        if (user) {
          if (user.password === password) {
            if (type !== 'check') {
              databases.func.updateLastLoginUser(username, type, Date())
              databases.func.putLog(`[.orange.]User <b>${username}</b> Loged in at <b>${Date()}</b>`)
            };
            users = databases.getUsers()
            res.status(200).json({
              success: true,
              message: 'User Authenticated',
              data: {
                email: username,
                user
              }
            })
          } else {
            res.status(402).json({
              success: false,
              message: 'User Password Wrong'
            })
          }
        } else {
          res.status(404).json({
            success: false,
            message: `User with email ${username} not found`
          })
        }
      } else {
        const usernameList = {}
        for (const email of emailList) {
          usernameList[users[email].username] = {
            password: users[email].password,
            email
          }
        }
        const user = usernameList[username]
        if (user) {
          if (user.password === password) {
            if (type !== 'check') {
              databases.func.updateLastLoginUser(user.email, type, Date())
              databases.func.putLog(`[.orange.]User <b>${username}</b> Loged in at <b>${Date()}</b>`)
            };
            users = databases.getUsers()
            res.status(200).json({
              success: true,
              message: 'User Authenticated',
              data: {
                email: user.email,
                user: users[user.email]
              }
            })
          } else {
            res.status(402).json({
              success: false,
              message: 'User Password Wrong'
            })
          }
        } else {
          res.status(404).json({
            success: false,
            message: `User with username ${username} not found`
          })
        }
      }
    } else {
      res.status(403).json({
        success: false,
        message: 'Data not complete'
      })
    }
  })

  app.get('/ping', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Ping test success',
      data: req.url
    })
  })

  app.get('/log/:auth', (req, res) => {
    const { auth } = req.params
    const authList = databases.getAllAuth()
    if (authList.includes(auth)) {
      res.status(200).json({
        success: true,
        message: 'Success Getting Log',
        data: databases.getLog()
      })
    } else {
      res.status(403).json({
        success: false,
        message: 'Invalid auth code'
      })
    }
  })

  app.post('/execute/:auth', async (req, res) => {
    const { auth } = req.params
    const { commands } = req.body
    const authList = databases.getAllAuth()
    if (authList.includes(auth) && commands) {
      const users = databases.getUsers()
      const emailList = Object.keys(users)
      let pickedUser = false
      for (const email of emailList) {
        if (users[email].auth === auth) {
          pickedUser = users[email]
        };
      };
      res.status(200).json({
        success: true,
        message: 'Success Executing Req'
      })
      databases.func.putLog(`[.green.]${pickedUser.username} => ${commands}`)
      if (pickedUser.isAdministator) {
        // exec(commands, (error, stdout, stderr) => {
        //   if (error) {
        //     return databases.func.putLog(`[.red.]${error}`)
        //   };
        //   if (stderr) {
        //     return databases.func.putLog(`[.yellow.]${stderr}`)
        //   };
        //   databases.func.putLog(`[.white.]${stdout}`)
        // })
        databases.func.putLog(`[.white.]${await utility.executeCmd(commands)}`)
      } else {
        databases.func.putLog('[.red.]You not Administrator')
      }
    } else {
      res.status(403).json({
        success: false,
        message: 'Invalid Data'
      })
    }
  })

  app.post('/add/user/:auth', (req, res) => {
    const { auth } = req.params
    const { email, username, password } = req.body
    const users = databases.getUsers()
    const emailList = Object.keys(users)
    const authList = databases.getAllAuth()
    const usernameList = emailList.map((emails) => {
      return users[emails].username
    })
    if (auth && authList.includes(auth) && email && username && password) {
      let pickedUser = false
      for (const emails of emailList) {
        if (users[emails].auth === auth) {
          pickedUser = users[emails]
        };
      };
      if (pickedUser.isAdministator || pickedUser.permission.manageUsers) {
        if ((emailList.includes(email)) || (usernameList.includes(username))) {
          res.status(403).json({
            success: false,
            message: 'Username or Email already taken'
          })
        } else {
          databases.func.editUsers(email, {
            username,
            password,
            auth: databases.generateUserAuth(),
            isAdministator: false,
            permission: {
              sendMessage: false,
              manageConnection: false,
              manageUsers: false
            },
            lastLogin: {
              time: '',
              ip: ''
            }
          })
          res.status(200).json({
            success: true,
            message: 'Success Create User'
          })
        }
      } else {
        res.status(403).json({
          success: false,
          message: 'Not Admin'
        })
      }
    } else {
      res.status(403).json({
        success: false,
        message: 'Data Invalid'
      })
    }
  })

  app.post('/delete/user/:email/:auth', (req, res) => {
    const { email, auth } = req.params
    const users = databases.getUsers()
    const emailList = Object.keys(users)
    const authList = databases.getAllAuth()
    if (auth && authList.includes(auth) && email) {
      let pickedUser = false
      for (const emails of emailList) {
        if (users[emails].auth === auth) {
          pickedUser = users[emails]
        };
      };
      if ((pickedUser.isAdministator || pickedUser.permission.manageUsers) && (!users[email].isAdministator || pickedUser.isAdministator)) {
        databases.func.deleteUsers(email)
        res.status(200).json({
          success: true,
          message: 'success Delete'
        })
      } else {
        res.status(403).json({
          success: false,
          message: 'You Not Admin or You tried to delete admin user'
        })
      }
    } else {
      res.status(403).json({
        success: false,
        message: 'Data Invalid'
      })
    }
  })

  app.get('/userlist/:auth', (req, res) => {
    const { auth } = req.params
    const users = databases.getUsers()
    const emailList = Object.keys(users)
    const authList = databases.getAllAuth()
    if (auth && authList.includes(auth)) {
      let pickedUser = false
      for (const emails of emailList) {
        if (users[emails].auth === auth) {
          pickedUser = users[emails]
        };
      };
      if (pickedUser.isAdministator) {
        res.status(200).json({
          success: true,
          message: 'Success get list of users',
          data: users
        })
      } else if (pickedUser.permission.manageUsers) {
        const filterUsers = utility.copy(users)
        for (const email of emailList) {
          if (filterUsers[email].isAdministator) {
            filterUsers[email].password = 'HIDDEN'
            filterUsers[email].auth = 'HIDDEN'
          };
        }
        res.status(200).json({
          success: true,
          message: 'Success get list of Filtered users',
          data: filterUsers
        })
      } else {
        res.status(403).json({
          success: false,
          message: 'You Not Admin or no have permissions'
        })
      }
    } else {
      res.status(403).json({
        success: false,
        message: 'Data Invalid'
      })
    }
  })

  app.post('/edit/user/:auth/:auths', (req, res) => {
    const { auth, auths } = req.params
    const { currentPassword, password, username } = req.body
    const users = databases.getUsers()
    const emailList = Object.keys(users)
    const authList = databases.getAllAuth()
    if (auth && authList.includes(auth) && ((auths === 'no') || (auths && authList.includes(auths)))) {
      let pickedUser = false
      let emailUser = false
      let pickedAdminUser = false
      for (const emails of emailList) {
        if (users[emails].auth === auth) {
          pickedUser = users[emails]
          emailUser = emails
        };
        if (auths !== 'no' && users[emails].auth === auths && !(users[emails].auth === auth)) {
          pickedAdminUser = users[emails]
        };
      };
      if (pickedUser && ((currentPassword && currentPassword === pickedUser.password) || (pickedAdminUser && (pickedAdminUser.isAdministator || (!pickedUser.isAdministator && pickedAdminUser.permission.manageUsers))))) {
        if (password && password.length > 4) {
          pickedUser.password = password
        } else if (password) {
          res.status(403).json({
            success: false,
            message: 'Password Min 5 Char'
          })
        };
        if (username && username.length > 4) {
          const usernameList = emailList.map((emails) => {
            return users[emails].username
          })
          if (usernameList.includes(username)) {
            databases.func.editUsers(emailUser, pickedUser)
            res.status(200).json({
              success: true,
              message: `Success Edit${(password) ? ' Password' : ''} but username failed, Already Used`
            })
          } else {
            pickedUser.username = username
            databases.func.editUsers(emailUser, pickedUser)
            res.status(200).json({
              success: true,
              message: `Success Edit${(username) ? ' Username' : ''}${(username && password) ? ' and' : ''}${(password) ? ' Password' : ''}`
            })
          }
        } else if (username) {
          res.status(403).json({
            success: false,
            message: 'Username Min 5 Char'
          })
        } else {
          databases.func.editUsers(emailUser, pickedUser)
          res.status(200).json({
            success: true,
            message: `Success Edit ${(password) ? ' Password' : ''}`
          })
        };
      } else {
        res.status(403).json({
          success: false,
          message: 'User not found or current password wrong or you not admin or you tired to edit admin account'
        })
      }
    } else {
      res.status(403).json({
        success: false,
        message: 'Data Invalid'
      })
    }
  })

  app.post('/edit/permission/:auth/:auths', (req, res) => {
    const { auth, auths } = req.params
    const { manageUsers, manageConnection, sendMessage } = req.body
    const parManageUsers = !!(manageUsers)
    const parManageConnection = !!(manageConnection)
    const parSendMessage = !!(sendMessage)
    const users = databases.getUsers()
    const emailList = Object.keys(users)
    const authList = databases.getAllAuth()
    if (auth && authList.includes(auth) && (auths && authList.includes(auths))) {
      let pickedUser = false
      let emailUser = false
      let pickedAdminUser = false
      for (const emails of emailList) {
        if (users[emails].auth === auth) {
          pickedUser = users[emails]
          emailUser = emails
        };
        if (auths !== 'no' && users[emails].auth === auths && !(users[emails].auth === auth)) {
          pickedAdminUser = users[emails]
        };
      };
      if ((pickedUser && pickedAdminUser) && (pickedAdminUser.isAdministator || (pickedAdminUser.permission.manageUsers && !pickedUser.isAdministator && pickedUser.auth !== pickedAdminUser.auth))) {
        pickedUser.permission.manageUsers = parManageUsers
        pickedUser.permission.manageConnection = parManageConnection
        pickedUser.permission.sendMessage = parSendMessage
        databases.func.editUsers(emailUser, pickedUser)
        res.status(200).json({
          success: true,
          message: 'Success changed'
        })
      } else {
        res.status(403).json({
          success: false,
          message: 'You dont have permission to edit this user'
        })
      }
    }
  })

  app.get('/message/:auth', (req, res) => {
    const { auth } = req.params
    const authList = databases.getAllAuth()
    if (authList.includes(auth)) {
      res.status(200).json({
        success: true,
        message: 'Succes get Message List',
        data: databases.getMessage()
      })
    } else {
      res.status(403).json({
        success: false,
        message: 'Data Invalid'
      })
    }
  })

  app.get('/botstate/:auth', (req, res) => {
    const { auth } = req.params
    const authList = databases.getAllAuth()
    if (authList.includes(auth)) {
      res.status(200).json({
        success: true,
        message: 'Success get botstate',
        data: databases.getBotState()
      })
    } else {
      res.status(403).json({
        success: false,
        message: 'Data Invalid'
      })
    }
  })

  app.listen(config.bot.port, () => {
    console.log(`${color.bright + color.magenta}`, `Webserver Started at port ${color.underscore + config.bot.port}`)
  })
  /// / End Interface
  // / Whatsapp
  // Starting Service
  host.initialize()
  host.on('message_create', async (m) => {
    try {
      const chat = await m.getChat()
      const senderId = (m.author) ? m.author : m.from
      const quoted = (m.hasQuotedMsg) ? await m.getQuotedMessage() : false
      if (m.from.includes('@g.us') || m.from.includes('@c.us')) {
        const rawProfile = await host.getProfilePicUrl(chat.id._serialized)
        const profile = (rawProfile) || false
        const quotedMsg = (quoted)
          ? {
              body: quoted.body,
              type: quoted.type,
              notifyName: quoted.notifyName,
              from: quoted.from,
              to: quoted.to,
              author: (quoted.author) ? quoted.author : quoted.from,
              timeStamp: quoted.timestamp,
              quotedMessage: false
            }
          : false
        const metadata = {
          id: chat.id,
          name: chat.name,
          lastUpdate: Date.now(),
          isGroup: chat.isGroup,
          unreadCount: chat.unreadCount,
          timeStamp: chat.timestamp,
          pinned: chat.pinned,
          isMuted: chat.isMuted,
          profile
        }
        const msg = {
          body: m.body,
          type: m.type,
          notifyName: m._data.notifyName,
          from: m.from,
          fromMe: m.fromMe,
          to: m.to,
          author: senderId,
          timeStamp: m.timestamp,
          quotedMessage: quotedMsg
        }
        const chatId = chat.id._serialized
        databases.func.addChatMessage(chatId, msg, metadata)
      };
      if (chat.isGroup) {
        if (!Object.keys((databases.getDb()).groups).includes(m.from)) {
          databases.func.editGroups(m.from, {
            name: chat.name,
            state: {
              antilink: false,
              welcome: true,
              isBanned: false,
              isVerify: false
            },
            usersChat: {}
          })
        } else {
          databases.func.editGroupName(m.from, chat.name)
        };
        databases.func.addChatCout(m.from, m.author)
      };
      if (!Object.keys((databases.getDb()).chats).includes(senderId)) {
        databases.func.editChats(senderId, {
          isBanned: false,
          exp: 0,
          level: 0,
          limit: 0,
          warn: 0
        })
      };
      databases.func.addExp(senderId, 15)
      const minLevelUp = 250 * ((databases.getChats())[senderId].level + 1 / 2) * ((databases.getChats())[senderId].level + 1)
      if ((databases.getChats())[senderId].exp > minLevelUp) {
        databases.func.addLevel(senderId, 1)
      };
    } catch (e) {
      databases.func.putLog(`[.red.]${e}`)
      console.error(e)
    }
  })
  require('./featureFunction.js')
  // / END Whatsapp
}

// Check if ready
const checkState = () => {
  if (databases.getStateReady()) {
    runMain()
  } else {
    setTimeout(() => {
      checkState()
    }, 1500)
  }
}
checkState()

module.exports = host
