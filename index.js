const { primaryHost } = require("./lib/whatsapp/Connection.js");
const { generateText } = require("./lib/OpenAI/OpenAI.js");
const { queueAdd, queue } = require("./lib/OpenAI/queue.js");
const { makeid } = require("./lib/utility/Utility.js");
const { bot, user } = require("./globalConfig.js");
const host = primaryHost;

try {
  //Check if ApiKey is avabile or not
  if (bot.openAI_APIKEY.length > 5||bot.openAI_APIKEY) {
    //connect To Whatsapp
    host.initialize();
  
    //setup Global Variable
    let groupWhitelist = [], groupReply = [];
  
    //Run command if match at condition
    host.on("message", async (m)=>{
      const chat = await m.getChat();
      let isWhiteList = false, isGroupReply = false;
      if(groupWhitelist.includes(m.from)){
        isWhiteList = true;
      };
      if(groupReply.includes(m.from)){
        isGroupReply = true;
      };
      //return generate AI chat
      const next = async ()=>{
        if(((!chat.isGroup)||isWhiteList)&&m.type === "chat"){
          const senderID = (chat.isGroup) ? m.author : m.from;
          queueAdd({
            id: makeid(8),
            chat: chat,
            message: m.body,
            senderID: senderID
          }, m);
        };
      }
      //Genral Command
      if (chat.isGroup) {
        if(m.type === "chat"){
          if(m.body === ".joingpt"){
            m.reply("Berhasil menambahkan");
            groupWhitelist.push(m.from);
          }else if(m.body === ".leavegpt"){
            m.reply("Berhasil keluar");
            groupWhitelist = groupWhitelist.filter(item => item !== m.from)
          }else if(m.body === ".startgpt"){
            m.reply("Reply saja chat ini dengan pertanyaan atau semacam nya!");
            groupReply.push(m.from);
          }else if(m.hasQuotedMsg){
            const quoted = await m.getQuotedMessage();
            if (quoted.body.length > 0&&quoted.fromMe){
              const senderID = (chat.isGroup) ? m.author : m.from;
              queueAdd({
                id: makeid(8),
                chat: chat,
                message: m.body,
                senderID: senderID
              }, m);
            }else { next(); }
          }else { next(); };
        };
      }else { next(); };
    })
  }else {
    console.log("Please fill your OpenAI ApiKey on globalConfig.json")
  }
}catch (e){
  user.map(async item =>{
    if(item.isDeveloper&&item.isOwner){
      await host.sendMessage(`${item.number}@c.us`, `Error : ${e}`);
      console.log(`Sended Message to \x1b[1m${e}\x1b[0m`);
    };
  })
  console.log(`Error : ${e}`);
}

module.exports = { host }