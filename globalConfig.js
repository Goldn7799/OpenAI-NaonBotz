const user = [
  { number: '6281228020195', isDeveloper: true, isOwner: true },
  { number: '6285875536696', isDeveloper: true, isOwner: false }
]

const bot = {
  restricedFeature: false,
  consoleImage: false,
  levelup: 250,
  queueTimeOut: 2500,
  backupTime: [12, 15],
  sessionName: 'NaonBotz',
  openAI_APIKEY: 'You',
  openAI_organization: 'You'
}

const pricing = {
  limit_avabile: 0,
  image_cost: 0.018
}

const systemConf = {
  sim: {
    high: 0.9,
    medium: 0.75,
    low: 0.65
  },
  interfaces: {
    enabled: true,
    port: 2023,
    password: 'admin'
  }
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

const buyItem = (cost) => {
  if (pricing.limit_avabile > cost) {
    pricing.limit_avabile -= cost
    return true
  } else {
    return false
  }
}

const restoreItem = (cost) => {
  pricing.limit_avabile += cost
}

const setLimit = (limit) => {
  pricing.limit_avabile = limit
}

module.exports = {
  user,
  bot,
  systemConf,
  pricing,
  buyItem,
  restoreItem,
  setLimit,
  rolePicker
}
