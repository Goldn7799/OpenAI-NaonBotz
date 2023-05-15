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
        putLog(`[.red.]Failed Creating backup ${backupTimeNow}.json`)
      } else {
        console.log(`${color.green}`, `Succes Creating backup ${color.underscore}${backupTimeNow}.json`)
        putLog(`[.green.]Success Creating backup ${backupTimeNow}.json`)
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
        fs.writeFile(`${pathto}/data-store/db/message.json`, JSON.stringify(message), (errsra) => {
          if (errsra) {
            console.error(`${color.red}`, `Failed Sync Message : ${errsra}`)
          };
          startSyncDb()
        })
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
    addLevel
  }
}

module.exports = databases
