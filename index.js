const databases = require('./lib/Database/Database.js')
const color = require('./lib/Utility/ccolor.js')
const express = require('express')
const cors = require('cors')
const config = require('./config.json')

// Main Command
const runMain = async () => {
  console.log(`${color.cyan}`, 'Starting main sc..')
  console.log(databases.getDb())
}

/// / Interface
const app = express()
app.use(cors({
  origin: config.bot.origin
}))
app.use('/', express.static('./public'))

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
