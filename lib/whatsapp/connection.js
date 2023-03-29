const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

// setup wa host
console.log("\x1b[32m\x1b[1m%s\x1b[0m", "-- Connecting --")
const primaryHost = new Client({
  authStrategy: new LocalAuth({
    clientId: "primaryHost"
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
  console.log("\x1b[33m\x1b[1m%s\x1b[0m", `-- Loading Chat ${state}% --`);
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
  // console.log(`BrowserID : ${session.WABrowserId}\nToken : ${session.WAToken1}`)
})

// on msg created
primaryHost.on("message_create", async (m)=>{
  const chat = await m.getChat();
  console.log(`${(m.fromMe) ? "\x1b[34mSend\x1b[0m" : "\x1b[32mRecived\x1b[0m"} || ${m.from}-\x1b[1m(${chat.name})\x1b[0m / ${m.author}-\x1b[1m(${m._data.notifyName})\x1b[0m => ${(m.type === "chat") ? m.body : `Unknown : ${m.type}`} `)
})

// run primaryHost.initialize(); to start

// Export
module.exports = { primaryHost };