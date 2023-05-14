const fs = require('fs')
const color = require('../Utility/ccolor.js')
const config = require('../../config.json')
const utility = require('../Utility/Utility.js')

// path
const pathto = process.cwd()

// Global Variable
let dbLog = []
let database = {}
let users = {}
let stateReady = false

/// / Write
// put log item
const putLog = async (text) => {
  (dbLog).push(text)
  return true
}

// clear log
const clearLog = () => {
  dbLog = []
  return true
}

// edit chats
const editChats = (id, data) => {
  database.chats[id] = data
  return true
}

// edit group
const editGroups = (id, data) => {
  database.groups[id] = data
  return true
}

// edit users
const editUsers = (id, data) => {
  users[id] = data
  return true
}

const deleteUsers = (id) => {
  delete users[id]
  return true
}

const updateLastLoginUser = (id, ip, date) => {
  users[id].lastLogin = {
    time: date,
    ip
  }
  return true
}

const updateUserAuth = () => {
  const userList = Object.keys(users)
  for (const email of userList) {
    users[email].auth = utility.makeid(18)
  }
  return true
}

const generateUserAuth = () => {
  return utility.makeid(18)
}
/// / End Write

/// / Read Setup
const readDb = () => {
  return new Promise((resolve) => {
    fs.readFile(`${pathto}/data-store/db/database.json`, 'utf-8', (err, res) => {
      if (err) {
        console.error(`${color.red}`, `Failed to load Database ${err}`)
        resolve(false)
      } else {
        console.log(`${color.green}`, 'Success Load Database')
        database = JSON.parse(res)
        fs.readFile(`${pathto}/data-store/db/users.json`, 'utf-8', (errsu, ressu) => {
          if (errsu) {
            console.error(`${color.red}`, `Failed to load Users ${errsu}`)
            resolve(false)
          } else {
            users = JSON.parse(ressu)
            console.log(`${color.green}`, 'Success Load Users')
            if (config.bot.clearLogOnStartup) {
              console.log(`${color.cyan}`, 'Resetting Log')
              putLog('[.cyan.]Resetting Log')
              resolve(true)
            } else {
              fs.readFile(`${pathto}/data-store/db/log.json`, 'utf-8', (errs, ress) => {
                if (errs) {
                  console.error(`${color.red}`, `Failed to load Log ${errs}`)
                  resolve(false)
                } else {
                  dbLog = JSON.parse(ress)
                  console.log(`${color.green}`, 'Success Load Log')
                  resolve(true)
                }
              })
            }
          }
        })
      }
    })
  })
}
/// / End Read Setup

/// / get Command
const getDb = () => {
  return database
}

const getLog = () => {
  return dbLog
}

const getUsers = () => {
  return users
}

const getStateReady = () => {
  return stateReady
}

const getAllAuth = () => {
  const emailList = Object.keys(users)
  return emailList.map((email) => {
    return users[email].auth
  })
}
/// / End get Command

/// / Backup
// check backup
const backupCheck = async () => {
  const date = new Date()
  const time = [(date.getHours()), (date.getMinutes())]
  if (time[0] === config.bot.backupTime[0] && time[1] === config.bot.backupTime[1]) {
    const backupTimeNow = ((Date()).substring(0, 24)).replaceAll(' ', '_')
    fs.writeFile(`${pathto}/data-store/backup/${backupTimeNow}.json`, JSON.stringify(database), async (err) => {
      if (err) {
        console.log(`${color.red}`, `Failed Creating backup ${color.underscore}${backupTimeNow}.json`)
        putLog(`[.red.]Failed Creating backup${backupTimeNow}.json`)
      } else {
        console.log(`${color.green}`, `Succes Creating backup ${color.underscore}${backupTimeNow}.json`)
        putLog(`[.green.]Success Creating backup${backupTimeNow}.json`)
      }
    })
    setTimeout(() => {
      backupCheck()
    }, 120000)
  } else {
    setTimeout(() => {
      backupCheck()
    }, 30000)
  }
}

// sync db
const startSyncDb = () => {
  setTimeout(() => {
    fs.writeFile(`${pathto}/data-store/db/database.json`, JSON.stringify(database), (err) => {
      if (err) {
        console.error(`${color.red}`, `Failed Sync Database : ${err}`)
      };
      fs.writeFile(`${pathto}/data-store/db/log.json`, JSON.stringify(dbLog), (errs) => {
        if (errs) {
          console.error(`${color.red}`, `Failed Sync Logs : ${errs}`)
        };
      })
      fs.writeFile(`${pathto}/data-store/db/users.json`, JSON.stringify(users), (errsr) => {
        if (errsr) {
          console.error(`${color.red}`, `Failed Sync Users : ${errsr}`)
        };
        startSyncDb()
      })
    })
  }, config.bot.syncInterval)
}

// check file
try {
  fs.mkdir(`${pathto}/data-store`, (err) => {
    if (err) {
      console.log(`${color.yellow}`, 'Skipped creating ./data-store')
    } else {
      console.log(`${color.magenta}`, 'Success Creating ./data-store')
    }
    fs.mkdir(`${pathto}/data-store/db`, (err) => {
      if (err) {
        console.log(`${color.yellow}`, 'Skipped creating ./data-store/db')
      } else {
        console.log(`${color.magenta}`, 'Success Creating ./data-store/db')
      }
      fs.mkdir(`${pathto}/data-store/storage`, (err) => {
        if (err) {
          console.log(`${color.yellow}`, 'Skipped creating ./data-store/storage')
        } else {
          console.log(`${color.magenta}`, 'Success Creating ./data-store/storage')
        }
        fs.mkdir(`${pathto}/data-store/backup`, (err) => {
          if (err) {
            console.log(`${color.yellow}`, 'Skipped creating ./data-store/backup')
          } else {
            console.log(`${color.magenta}`, 'Success Creating ./data-store/backup')
          }
          fs.readFile(`${pathto}/data-store/db/database.json`, 'utf-8', (err) => {
            if (err) {
              fs.writeFile(`${pathto}/data-store/db/database.json`, JSON.stringify(config.defaultDB.database), (err) => {
                if (err) {
                  console.log(`${color.red}`, 'Failed create /data-store/db/database.json')
                } else {
                  console.log(`${color.blue}`, 'Success create /data-store/db/database.json')
                }
              })
            } else {
              console.log(`${color.yellow}`, 'Skipped creating ./data-store/db/database.json')
            }
            fs.readFile(`${pathto}/data-store/db/log.json`, 'utf-8', async (err) => {
              if (err) {
                fs.writeFile(`${pathto}/data-store/db/log.json`, JSON.stringify([]), (err) => {
                  if (err) {
                    console.log(`${color.red}`, 'Failed create /data-store/db/log.json')
                  } else {
                    console.log(`${color.blue}`, 'Success create /data-store/db/log.json')
                  }
                })
              } else {
                console.log(`${color.yellow}`, 'Skipped creating ./data-store/db/log.json')
              }
              fs.readFile(`${pathto}/data-store/db/users.json`, 'utf-8', async (err) => {
                if (err) {
                  fs.writeFile(`${pathto}/data-store/db/users.json`, JSON.stringify(config.defaultDB.users), (err) => {
                    if (err) {
                      console.log(`${color.red}`, 'Failed create /data-store/db/users.json')
                    } else {
                      console.log(`${color.blue}`, 'Success create /data-store/db/users.json')
                    }
                  })
                } else {
                  console.log(`${color.yellow}`, 'Skipped creating ./data-store/db/log.json')
                }
                if (await readDb()) {
                  console.log(`${color.cyan}`, 'Starting Backup Time Check')
                  putLog('[.cyan.]Starting Backup Time Check')
                  backupCheck()
                  console.log(`${color.cyan}`, 'Starting Sync Database')
                  putLog('[.cyan.]Starting Sync Database')
                  startSyncDb()
                  stateReady = true
                };
              })
            })
          })
        })
      })
    })
  })
} catch (error) {
  console.error(`${color.red}`, `Error checking files : ${error}`)
}
/// / End Backup

// setup export
const databases = {
  getDb,
  getLog,
  getStateReady,
  getUsers,
  generateUserAuth,
  getAllAuth,
  func: {
    putLog,
    clearLog,
    editChats,
    editGroups,
    editUsers,
    deleteUsers,
    updateLastLoginUser,
    updateUserAuth
  }
}

module.exports = databases
