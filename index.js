const databases = require('./lib/Database/Database.js')
const color = require('./lib/Utility/ccolor.js')
const express = require('express')
const cors = require('cors')
const config = require('./config.json')
const bodyParser = require('body-parser')
const { exec } = require('child_process')

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
            if (type === 'check') {
              databases.func.updateLastLoginUser(username, type, Date())
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
        message: 'Succes Getting Log',
        data: databases.getLog()
      })
    } else {
      res.status(403).json({
        succes: false,
        message: 'Invalid auth code'
      })
    }
  })

  app.post('/execute/:auth', (req, res) => {
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
        message: 'Succes Executing Req'
      })
      databases.func.putLog(`[.green.]${pickedUser.username} => ${commands}`)
      if (pickedUser.isAdministator) {
        exec(commands, (error, stdout, stderr) => {
          if (error) {
            return databases.func.putLog(`[.red.]${error}`)
          };
          if (stderr) {
            return databases.func.putLog(`[.yellow.]${stderr}`)
          };
          databases.func.putLog(`[.white.]${stdout}`)
        })
      } else {
        databases.func.putLog('[.red.]You not Administrator')
      }
    } else {
      res.status(403).json({
        succes: false,
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
      if (pickedUser.isAdministator||pickedUser.permission.manageUsers) {
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
            message: 'Succes Create User'
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
          message: 'succes Delete'
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

  app.listen(config.bot.port, () => {
    console.log(`${color.bright + color.magenta}`, `Webserver Started at port ${color.underscore + config.bot.port}`)
  })
  /// / End Interface
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
