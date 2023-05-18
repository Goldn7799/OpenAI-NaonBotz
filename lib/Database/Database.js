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
let message = {}
let stateReady = false
let dataStatsHistory = []
const cacheState = {
  log: {}
}

/// / Write
// put log item
const putLog = async (text) => {
  (dbLog).push(text)
  return true
}

// clear log
const clearLog = () => {
  dbLog = []
  cacheState.log = {}
  return true
}

// edit log
const editLog = (id, text) => {
  if ((Object.keys(cacheState.log)).includes(id)) {
    dbLog[cacheState.log[id]] = text
  } else {
    cacheState.log[id] = dbLog.length
    dbLog.push(text)
  }
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
const editGroupName = (id, names) => {
  database.groups[id].name = names
  return true
}
const addChatCout = (id, user) => {
  if ((Object.keys(database.groups[id].usersChat)).includes(user)) {
    database.groups[id].usersChat[user] += 1
  } else {
    database.groups[id].usersChat[user] = 1
  }
  return true
}
const addExp = (id, expCount) => {
  database.chats[id].exp += expCount
  return true
}
const addLevel = (id, level) => {
  database.chats[id].level += level
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

const registerMessage = (id, chat, metadata) => {
  message[id] = {
    metadata,
    chat: [chat]
  }
  return true
}

const checkMessage = (id) => {
  return (Object.keys(message)).includes(id)
}

const addChatMessage = (id, chat, metadata) => {
  if (checkMessage(id)) {
    message[id].chat.push(chat)
    message[id].metadata = metadata
    if ((message[id].chat).length > 24) {
      (message[id].chat).shift()
    };
  } else {
    registerMessage(id, chat, metadata)
  }
  return true
}

const editGroupWelcome = (id, state) => {
  database.groups[id].state.welcome = state
  return true
}

const editGroupAntiLink = (id, state) => {
  database.groups[id].state.antilink = state
  return true
}

const openaiBuy = (price)=>{
  if (database.state.openaiLimit > price) {
    database.state.openaiLimit -= price
    return true
  } else {
    return false
  }
}

const openaiSell = (price) => {
  database.state.openaiLimit += price
  return true
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
            fs.readFile(`${pathto}/data-store/db/message.json`, 'utf-8', (errsua, ressua) => {
              if (errsua) {
                console.error(`${color.red}`, `Failed to load Message ${errsua}`)
                resolve(false)
              } else {
                message = JSON.parse(ressua)
                console.log(`${color.green}`, 'Success Load Message')
                fs.readFile(`${pathto}/data-store/db/stats-history.json`, 'utf-8', (errsuas, ressuas) => {
                  if (errsuas) {
                    console.error(`${color.red}`, `Failed to load stats-history ${errsuas}`)
                    resolve(false)
                  } else {
                    dataStatsHistory = JSON.parse(ressuas)
                    console.log(`${color.green}`, 'Success Load stats-history')
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
          }
        })
      }
    })
  })
}
/// / End Read Setup

/// / get Command
const getDb = () => {
  return utility.copy(database)
}

const getLog = () => {
  return utility.copy(dbLog)
}

const getUsers = () => {
  return utility.copy(users)
}

const getGroups = () => {
  return utility.copy(database.groups)
}

const getChats = () => {
  return utility.copy(database.chats)
}

const getStateReady = () => {
  return stateReady
}

const getAllAuth = () => {
  const emailList = Object.keys(users)
  return emailList.map((email) => {
    return (utility.copy(users[email])).auth
  })
}

const getMessage = () => {
  return utility.copy(message)
}

const getBotState = () => {
  return utility.copy(database.state)
}

const getStatsHistory = () => {
  return utility.copy(dataStatsHistory)
}

const getOpenaiBalance = () => {
  return (utility.copy(database.state)).openaiLimit
}
/// / End get Command

/// / Backup
// Make Backup
const makeBackup = () => {
  return new Promise((resolve) => {
    const backupTimeNow = ((Date()).substring(0, 24)).replaceAll(' ', '_')
    fs.writeFile(`${pathto}/data-store/backup/${backupTimeNow}.json`, JSON.stringify(database), async (err) => {
      if (err) {
        console.log(`${color.red}`, `Failed Creating backup ${color.underscore}${backupTimeNow}.json`)
        putLog(`[.red.]Failed Creating backup ${backupTimeNow}.json`)
        resolve(`Failed Creating backup ${backupTimeNow}.json`)
      } else {
        console.log(`${color.green}`, `Succes Creating backup ${color.underscore}${backupTimeNow}.json`)
        putLog(`[.green.]Success Creating backup ${backupTimeNow}.json`)
        resolve(`Success Creating backup ${backupTimeNow}.json`)
      }
    })
  })
}

// check backup
const backupCheck = async () => {
  const date = new Date()
  const time = [(date.getHours()), (date.getMinutes())]
  if (time[0] === config.bot.backupTime[0] && time[1] === config.bot.backupTime[1]) {
    makeBackup()
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
    const uptimeInSeconds = process.uptime()
    const upHours = Math.floor(uptimeInSeconds / 3600)
    const upMinutes = Math.floor((uptimeInSeconds % 3600) / 60)
    const upSeconds = Math.floor(uptimeInSeconds % 60)
    database.state.upTime = utility.timeParse(upHours, upMinutes, upSeconds)
    database.state.session = config.bot.session
    database.state.prefix = config.bot.prefix
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
        fs.writeFile(`${pathto}/data-store/db/message.json`, JSON.stringify(message), (errsra) => {
          if (errsra) {
            console.error(`${color.red}`, `Failed Sync Message : ${errsra}`)
          };
          fs.writeFile(`${pathto}/data-store/db/stats-history.json`, JSON.stringify(dataStatsHistory), (errsras) => {
            if (errsra) {
              console.error(`${color.red}`, `Failed Sync stats-history : ${errsras}`)
            };
            startSyncDb()
          })
        })
      })
    })
  }, config.bot.syncInterval)
}

setInterval(() => {
  const date = new Date()
  if (dataStatsHistory.length > 20) {
    dataStatsHistory.shift()
    dataStatsHistory[0] = ['Time', 'Users', 'Groups']
  };
  dataStatsHistory.push([`${utility.timeParse(date.getHours(), date.getMinutes())}`, (Object.keys(database.chats)).length, (Object.keys(database.groups)).length])
}, 300000)

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
                  console.log(`${color.yellow}`, 'Skipped creating ./data-store/db/users.json')
                }
                fs.readFile(`${pathto}/data-store/db/message.json`, 'utf-8', async (err) => {
                  if (err) {
                    fs.writeFile(`${pathto}/data-store/db/message.json`, JSON.stringify({}), (err) => {
                      if (err) {
                        console.log(`${color.red}`, 'Failed create /data-store/db/message.json')
                      } else {
                        console.log(`${color.blue}`, 'Success create /data-store/db/message.json')
                      }
                    })
                  } else {
                    console.log(`${color.yellow}`, 'Skipped creating ./data-store/db/message.json')
                  }
                  fs.readFile(`${pathto}/data-store/db/stats-history.json`, 'utf-8', async (err) => {
                    if (err) {
                      fs.writeFile(`${pathto}/data-store/db/stats-history.json`, JSON.stringify([['Time', 'Users', 'Groups'], ['00:00', 0, 0]]), (err) => {
                        if (err) {
                          console.log(`${color.red}`, 'Failed create /data-store/db/stats-history.json')
                        } else {
                          console.log(`${color.blue}`, 'Success create /data-store/db/stats-history.json')
                        }
                      })
                    } else {
                      console.log(`${color.yellow}`, 'Skipped creating ./data-store/db/stats-history.json')
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
  getMessage,
  getGroups,
  getChats,
  getBotState,
  getStatsHistory,
  func: {
    putLog,
    clearLog,
    editChats,
    editGroups,
    editUsers,
    deleteUsers,
    updateLastLoginUser,
    updateUserAuth,
    registerMessage,
    checkMessage,
    addChatMessage,
    editGroupName,
    addExp,
    addChatCout,
    addLevel,
    editLog,
    makeBackup,
    editGroupWelcome,
    editGroupAntiLink
  },
  limit: {
    openaiBuy,
    openaiSell,
    getOpenaiBalance
  }
}

module.exports = databases
