const databases = require('./lib/Database/Database.js')
const color = require('./lib/Utility/ccolor.js')
const express = require('express')
const cors = require('cors')
const config = require('./config.json')

// Main Command
const runMain = async () => {
  console.log(`${color.cyan}`, 'Starting main sc..')
}

/// / Interface
const app = express()
app.use(cors({
  origin: config.bot.origin
}))
app.use('/', express.static('./public'))

app.get('/user/:username/:password', (req, res) => {
  const { username, password } = req.params
  if (username && password) {
    const users = databases.getUsers()
    const emailList = Object.keys(users)
    if (username.includes('@')) {
      const user = users[username]
      if (user) {
        if (user.password === password) {
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

app.listen(config.bot.port, () => {
  console.log(`${color.bright + color.magenta}`, `Webserver Started at port ${color.underscore + config.bot.port}`)
})
/// / End Interface

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
