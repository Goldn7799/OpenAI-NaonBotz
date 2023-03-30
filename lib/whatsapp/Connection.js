const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { bot, user } = require("../../globalConfig.js");
const { drawProgressBar } = require("../utility/Utility.js");

// setup wa host
console.log("\x1b[32m\x1b[1m%s\x1b[0m", "-- Connecting --")
console.log(`\x1b[1mSession : \x1b[34m${bot.sessionName}\n\x1b[0m`)
const primaryHost = new Client({
  authStrategy: new LocalAuth({
    clientId: bot.sessionName
  }),
  ffmpegPath: "../ffmpeg/bin/ffmpeg.exe"
})

// show qr code for scan
primaryHost.on("qr", (qr)=>{
  qrcode.generate(qr, { small: true });
  console.log("\x1b[36m\x1b[1m%s\x1b[0m", "Scan QR on top ^^^")
})

// On Loading
primaryHost.on("loading_screen", (state)=>{
  // console.log("\x1b[33m\x1b[1m%s\x1b[0m", `-- Loading Chat --`);
  drawProgressBar(state);
  if(state > 99){
    console.log("\n");
  }
})

// On Disconnect
primaryHost.on("disconnected", (msg)=>{
  console.log("\x1b[31m\x1b[1m%s\x1b[0m", `Disconnected, Retrying connect\n Reason : ${msg}`)
})

// Info on Ready
primaryHost.on("ready", ()=>{
  console.log("\x1b[32m\x1b[1m%s\x1b[0m", "-- Client Ready --");
})

// Info on Auth
primaryHost.on("authenticated", (session)=>{
  console.log("\x1b[32m\x1b[1m%s\x1b[0m", "-- Connected to Whatsapp --");
})

// on msg created
primaryHost.on("message_create", async (m)=>{
  const chat = await m.getChat();
  const senderID = (m.author) ? m.author : m.from;
  const senderInfo = await (await primaryHost.getContactById(await senderID)).id;
  let isSenderOwner = false, isSenderDeveloper = false;
  user.map((item)=>{
    if(item.number === senderInfo.user&&item.isOwner){
      isSenderOwner = true;
    }else if(item.number === senderInfo.user&&item.isDeveloper){
      isSenderDeveloper = true;
    };
  })
  console.log(`${(m.fromMe) ? "\x1b[34mSend\x1b[0m" : "\x1b[32mRecived\x1b[0m"} || ${m.from}-\x1b[1m(${chat.name})\x1b[0m / ${senderID.replace("@c.us", "")}-\x1b[1m(${(m.fromMe) ? `${primaryHost.info.pushname}` : `${m._data.notifyName}`})${(isSenderOwner) ? "\x1b[32mOwner" : (isSenderDeveloper) ? "\x1b[33mDeveloper" : ""}\x1b[0m => ${(m.type === "chat") ? m.body : `Unknown : ${m.type}`} `)
})

// run primaryHost.initialize(); to start

// Export
module.exports = { primaryHost };