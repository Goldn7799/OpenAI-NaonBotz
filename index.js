const { primaryHost } = require("./lib/whatsapp/Connection.js");
const { generateText } = require("./lib/OpenAI/OpenAI.js");
const { queueAdd, queue } = require("./lib/OpenAI/queue.js");
const { makeid, matchItem } = require("./lib/utility/Utility.js");
const { bot, user, systemConf } = require("./globalConfig.js");
const host = primaryHost;

try {
  //Check if ApiKey is avabile or not
  if (bot.openAI_APIKEY.length > 10||bot.openAI_APIKEY) {
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
      const senderID = (m.author) ? m.author : m.from;
      //return generate AI chat
      const next = async ()=>{
        if(((!chat.isGroup)||isWhiteList)&&m.type === "chat"){
          queueAdd({
            id: makeid(8),
            chat: chat,
            message: m.body,
            senderID: senderID
          }, m);
        };
      }
      //common command
      const commonCommand = async ()=>{
        if(m.body.length > 0){
          if(matchItem(m.body.toLowerCase(), ".stkr", systemConf.sim.high)){
            if(m.hasMedia){
              const chat = await m.getChat();
              await chat.sendMessage("Waitt a sec..");
              const media = await m.downloadMedia();
              if(media.mimetype === "image/png"||media.mimetype === "image/jpeg"||media.mimetype === "image/gif"||media.mimetype === "image/webp"){
                await m.reply("Done!!");
                await chat.sendMessage(media, { mentions: [await host.getContactById(senderID)], sendMediaAsSticker: true, stickerAuthor: "SGStudio", stickerName: "Ai Botz|NaonBotz" })
              }else {
                await m.reply("Unknown Format")
              }
            }else if(m.hasQuotedMsg){
              const quoted = await m.getQuotedMessage();
              if(quoted.hasMedia){
                const chat = await m.getChat();
                await chat.sendMessage("Waitt a sec..");
                const media = await quoted.downloadMedia();
                if(media.mimetype === "image/png"||media.mimetype === "image/jpeg"||media.mimetype === "image/gif"||media.mimetype === "image/webp"){
                  await m.reply("Done!!");
                  await chat.sendMessage(media, { mentions: [await host.getContactById(senderID)], sendMediaAsSticker: true, stickerAuthor: "SGStudio", stickerName: "Ai Botz|NaonBotz" })
                }else {
                  await m.reply("Unknown Format")
                }
              }else {
                await m.reply(`Is not a photo, is a ${m.type}`);
              }
            }else {
              await m.reply("Where Photo?")
            }
          }if(m.hasQuotedMsg&&matchItem(m.body.toLowerCase(), ".toimg", systemConf.sim.high)){
            const quoted = await m.getQuotedMessage();
            if(quoted.type === "sticker"){
              const chat = await m.getChat();
              await chat.sendMessage("Waitt a sec..");
              const media = await quoted.downloadMedia();
              if(media.mimetype === "image/png"||media.mimetype === "image/gif"||media.mimetype === "image/jpeg"||media.mimetype === "image/webp"){
                await m.reply("Done!!");
                await chat.sendMessage(media, { mentions: [ await host.getContactById(senderID) ] });
              }else {
                await m.reply("unknown Format");
              }
            }else {
              await m.reply(`Is not a sticker, is a ${m.type}`);
            }
          }else { next(); };
        }else if(m.type === "chat"){ next() };
      }
      //Genral Command
      if (chat.isGroup) {
        if(m.type === "chat"){
          if(matchItem(m.body, ".joingpt", systemConf.sim.high)){
            if(isWhiteList){
              await m.reply("Already joined");
            }else {
              await m.reply("Succes added GPT");
              groupWhitelist.push(m.from);
            }
          }else if(matchItem(m.body, "..leavegpt", systemConf.sim.high)){
            if(!isWhiteList){
              await m.reply("Already leave");
            }else {
              await m.reply("Succes leave");
              groupWhitelist = groupWhitelist.filter(item => item !== m.from)
            }
          }else if(matchItem(m.body, ".startgpt", systemConf.sim.high)){
            await m.reply("Reply saja chat ini dengan pertanyaan atau semacam nya!");
            groupReply.push(m.from);
          }else if(m.hasQuotedMsg){
            const quoted = await m.getQuotedMessage();
            if((!quoted.fromMe)&&quoted.type === "chat"&&quoted.body.length > 0&&m.type === "chat"&&(matchItem(m.body.toLowerCase(), "realy", systemConf.sim.high)||matchItem(m.body.toLowerCase(), ".aires", systemConf.sim.high)||matchItem(m.body.toLowerCase(), "benarkah", systemConf.sim.high))){
              const senderID = (m.author) ? m.author : m.from;
              queueAdd({
                id: makeid(8),
                chat: chat,
                message: quoted.body,
                senderID: senderID
              }, m);
            }else if (quoted.body.length > 0&&quoted.fromMe){
              const senderID = (chat.isGroup) ? m.author : m.from;
              queueAdd({
                id: makeid(8),
                chat: chat,
                message: m.body,
                senderID: senderID
              }, m);
            }else { commonCommand(); }
          }else { commonCommand(); };
        }else { commonCommand(); }
      }else { commonCommand(); };
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