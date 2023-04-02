const user = [
  {"number": "6281228020195", "isDeveloper": true, "isOwner": true},
  {"number": "6285875536696", "isDeveloper": true, "isOwner": false}
]

const bot = {
  "restricedFeature": false,
  "consoleImage": false,
  "sessionName": "primary",
  "openAI_APIKEY": "You",
  "openAI_organization": "You"
}

const systemConf = {
  "sim": {
    "high": 0.9,
    "medium": 0.75,
    "low": 0.65
  },
  "interface": {
    "port": 2023,
    "password": "admin"
  }
}

module.exports = {
  user,
  bot,
  systemConf
}