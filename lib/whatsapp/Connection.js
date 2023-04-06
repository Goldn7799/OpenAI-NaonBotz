const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { bot, user } = require("../../globalConfig.js");
const { drawProgressBar } = require("../utility/Utility.js");
const { interface } = require("./Interface.js");

// setup wa host
console.log("\x1b[32m\x1b[1m%s\x1b[0m", "-- Connecting --")
interface.addLog(`<p style="color: %green%;">-- Connecting --</p>`);
console.log(`\x1b[1mSession : \x1b[34m${bot.sessionName}\n\x1b[0m`)
interface.addLog(`<p>Session : <span style="color: %blue%;">${bot.sessionName}</span></p>`);
const primaryHost = new Client({
  authStrategy: new LocalAuth({
    clientId: bot.sessionName
  })
})

// show qr code for scan
primaryHost.on("qr", (qr)=>{
  qrcode.generate(qr, { small: true });
  console.log("\x1b[36m\x1b[1m%s\x1b[0m", "Scan QR on top ^^^")
  interface.addLog(`<p style="color: %blue%;">Scan QR on terminal</p>`);
})

// On Loading
primaryHost.on("loading_screen", (state)=>{
  // console.log("\x1b[33m\x1b[1m%s\x1b[0m", `-- Loading Chat --`);
  interface.addLog(`<p style="color: %green%;">-- Loading --</p>`);
  drawProgressBar(state);
  if(state > 99){
    console.log("\n");
  }
})

// On Disconnect
primaryHost.on("disconnected", (msg)=>{
  console.log("\x1b[31m\x1b[1m%s\x1b[0m", `Disconnected, Retrying connect\n Reason : ${msg}`)
  interface.addLog(`<p style="color: %red%;">Disconnected : ${msg}</p>`);
})

// Info on Ready
primaryHost.on("ready", ()=>{
  console.log("\x1b[32m\x1b[1m%s\x1b[0m", "-- Client Ready --");
  interface.addLog(`<p style="color: %green%;">-- Client Ready --</p>`);
})

// Info on Auth
primaryHost.on("authenticated", (session)=>{
  console.log("\x1b[32m\x1b[1m%s\x1b[0m", "-- Connected to Whatsapp --");
  interface.addLog(`<p style="color: %green%;">-- Connected to whatsapp</p>`);
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
  let message = m;
  message.isGrup = chat.isGroup;
  message.chatName = chat.name;
  if(m.hasQuotedMsg){
    const quoted = await m.getQuotedMessage();
    const qChat = await primaryHost.getContactById((quoted.author) ? quoted.author : quoted.from);
    message.quotedName = qChat.pushname;
    message.quotedBody = quoted.body;
  }
  interface.addChatLog(message)
  console.log(`${(m.fromMe) ? "\x1b[34mSend\x1b[0m" : "\x1b[32mRecived\x1b[0m"} || ${m.from}-\x1b[1m(${chat.name})\x1b[0m / ${senderID.replace("@c.us", "")}-\x1b[1m(${(m.fromMe) ? `${primaryHost.info.pushname}` : `${(m._data.notifyName) ? `${m._data.notifyName.substring(0, 26)}` : `${m._data.notifyName}`}`})${(isSenderOwner) ? "\x1b[32mOwner" : (isSenderDeveloper) ? "\x1b[33mDeveloper" : ""}\x1b[0m => ${(m.type === "chat") ? m.body : `Send : ${m.type}`} `)
  // interface.addLog(`<p>${(m.fromMe) ? `<span style="color: %blue%">Send</span>` : `<span style="color: %green%">Recived</span>`} || ${m.from}-<span style="color: %blue%">(${chat.name})</span> / ${senderID.replace("@c.us", "")}-(${(m.fromMe) ? `${primaryHost.info.pushname}` : `${(m._data.notifyName) ? `${m._data.notifyName.substring(0, 26)}` : `${m._data.notifyName}`}`})${(isSenderOwner) ? "Owner" : (isSenderDeveloper) ? "Developer" : ""} => ${(m.type === "chat") ? m.body : `Send : ${m.type}`} </p>`);
})

// run primaryHost.initialize(); to start

// Export
module.exports = { primaryHost };