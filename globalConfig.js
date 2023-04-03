const user = [
  {"number": "6281228020195", "isDeveloper": true, "isOwner": true},
  {"number": "6285875536696", "isDeveloper": true, "isOwner": false}
]

const bot = {
  "restricedFeature": false,
  "consoleImage": false,
  "sessionName": "NaonBotz",
  "openAI_APIKEY": "Your",
  "openAI_organization": "Your"
}

const systemConf = {
  "sim": {
    "high": 0.9,
    "medium": 0.75,
    "low": 0.65
  },
  "interface": {
    "enabled": true,
    "port": 2023,
    "password": "admin"
  }
}

module.exports = {
  user,
  bot,
  systemConf
}