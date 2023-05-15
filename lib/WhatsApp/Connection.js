const { Client, LocalAuth } = require('whatsapp-web.js')
const databases = require('../Database/Database')
const config = require('../../config.json')

// setup
databases.func.putLog(`[.lightblue.]Open Session <b>${config.bot.session}</b>`)
databases.func.putLog('[.orange.]Conneting to WhatsApp...')
const host = new Client({
  authStrategy: new LocalAuth({
    clientId: config.bot.session
  })
})

// on QR Showed
host.on('qr', (qr) => {
  databases.func.putLog(`[.white.][.qr.]${qr}`)
})

// on loading
host.on('loading_screen', (state)=>{
  databases.func.putLog(`[.white.][.loading.][.qrDone.]-%${state}%-`)
})

// on auth
host.on('authenticated', ()=>{
  databases.func.putLog(`[.yellowgreen.][.loadingDone.][.qrDone.] _Connected to Whatsapp_`)
})

// on Ready
host.on('ready', ()=>{
  databases.func.putLog(`[.yellowgreen.]_Client Ready_`)
})

module.exports = host