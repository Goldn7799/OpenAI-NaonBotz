const { primaryHost } = require("./lib/whatsapp/Connection.js");
const Tesseract = require("tesseract.js")
const { queueAdd } = require("./lib/OpenAI/Queue.js");
const { makeid, matchItem, drawProgressBar, convertWebPtoPNG } = require("./lib/utility/Utility.js");
const { bot, user, systemConf } = require("./globalConfig.js");
const { interface } = require("./lib/whatsapp/Interface.js");
const host = primaryHost;

try {
  //Check if ApiKey is avabile or not
  if (bot.openAI_APIKEY.length > 10||bot.openAI_APIKEY) {
    //connect To Whatsapp
    host.initialize();
    if(systemConf.interface.enabled){
      interface.start();
    };
  
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
            senderContact: await host.getContactById(senderID)
          }, m);
        };
      }
      const readText = async ()=>{
        if(m.hasMedia){
          const media = await m.downloadMedia();
          if(media){
            if(media.mimetype === "image/png"||media.mimetype === "image/jpeg"||media.mimetype === "image/jpg"||media.mimetype === "image/gif"||media.mimetype === "image/webp"){
              const rawBase64Image = `data:${media.mimetype};base64,${media.data}`;
              const base64Image = (media.mimetype === "image/webp") ? await convertWebPtoPNG(rawBase64Image) : rawBase64Image;
              if(base64Image){
                try {
                  console.log("Reading Text")
                  chat.sendMessage("Detecting Text...")
                  let progress = 0;
                  const worker = await Tesseract.createWorker({
                    logger: mc => {
                      if(mc.progress){
                        progress += mc.progress;
                        drawProgressBar(progress)
                      };
                    }
                  })
                  await worker.loadLanguage("eng");
                  await worker.initialize("eng");
                  const { data: { text } } = await worker.recognize(base64Image);
                  console.log(`\nResult : ${text}`);
                  if(text){
                    queueAdd({
                      id: makeid(8),
                      chat: chat,
                      message: text,
                      senderContact: await host.getContactById(senderID)
                    }, m);
                  }else {
                    await m.reply("cant detect text on this image")
                  };
                  worker.terminate();
                }catch(e) {
                  console.log("Failed Reading Text")
                }
              }else { console.log("failed Convert webp to png") };
            };
          };
        };
      }
      //common command
      const commonCommand = async ()=>{
        if(m.body.length > 0){
          if(matchItem(m.body.toLowerCase(), ".sticker", systemConf.sim.high)){
            if(m.hasMedia){
              const chat = await m.getChat();
              await chat.sendMessage("Waitt a sec..");
              const media = await m.downloadMedia();
              if(media.mimetype === "image/png"||media.mimetype === "image/jpeg"||media.mimetype === "image/gif"||media.mimetype === "image/webp"){
                await chat.sendMessage(media, { mentions: [await host.getContactById(senderID)], sendMediaAsSticker: true, stickerAuthor: "SGStudio", stickerName: "Ai Botz|NaonBotz" })
                await m.reply("Done!!");
              }else {
                await m.reply("Unknown Format");
              }
            }else if(m.hasQuotedMsg){
              const quoted = await m.getQuotedMessage();
              if(quoted.hasMedia){
                const chat = await m.getChat();
                await chat.sendMessage("Waitt a sec..");
                const media = await quoted.downloadMedia();
                if(media.mimetype === "image/png"||media.mimetype === "image/jpeg"||media.mimetype === "image/gif"||media.mimetype === "image/webp"){
                  await chat.sendMessage(media, { mentions: [await host.getContactById(senderID)], sendMediaAsSticker: true, stickerAuthor: "SGStudio", stickerName: "Ai Botz|NaonBotz" })
                  await m.reply("Done!!");
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
                await chat.sendMessage(media, { mentions: [ await host.getContactById(senderID) ] });
                await m.reply("Done!!");
              }else {
                await m.reply("unknown Format");
              }
            }else {
              await m.reply(`Is not a sticker, is a ${m.type}`);
            }
          }else if(matchItem(m.body, ".tagall", systemConf.sim.high)&&chat.isGroup){
            let isSenderAdmin = false;
            for(let participant of chat.participants){
              if(participant.id._serialized === senderID&&participant.isAdmin){
                isSenderAdmin = true;
              }
            };
            if(isSenderAdmin){
              let text = "*TagAll*\n";
              let mentions = [];
              for(let participant of chat.participants){
                const contact = await host.getContactById(participant.id._serialized);
                mentions.push(contact);
                text += `@${participant.id.user} \n`;
              }
              await chat.sendMessage(text, { mentions })
            }else {
              await m.reply("You not *Admin*");
            }
          }else if(matchItem(m.body, ".hidetag", systemConf.sim.high)&&chat.isGroup){
            let isSenderAdmin = false;
            for(let participant of chat.participants){
              if(participant.id._serialized === senderID&&participant.isAdmin){
                isSenderAdmin = true;
              }
            };
            if(isSenderAdmin){
              let mentions = [];
              for(let participant of chat.participants){
                const contact = await host.getContactById(participant.id._serialized);
                mentions.push(contact);
              }
              let text;
              if(m.hasQuotedMsg){
                const quoted = await m.getQuotedMessage();
                if(quoted.body.length > 0){
                  text = quoted.body;
                }else {
                  text = m.body;
                }
              }else {
                text = m.body;
              }
              chat.sendMessage(await text, { mentions })
            }else {
              await m.reply("You not *Admin*");
            }
          }else if(matchItem(m.body, ".totext", systemConf.sim.high)){
            const rawMedia = (m.hasQuotedMsg) ? (((await m.getQuotedMessage()).hasMedia) ? ((await m.getQuotedMessage()).downloadMedia()) : ((m.hasMedia) ? (await m.downloadMedia()) : false)) : ((m.hasMedia) ? (await m.downloadMedia()) : false);
            const media = await rawMedia;
            if(media){
              if(media.mimetype === "image/png"||media.mimetype === "image/jpeg"||media.mimetype === "image/jpg"||media.mimetype === "image/gif"){
                const base64Image = `data:${media.mimetype};base64,${media.data}`;
                try {
                  console.log("Reading Text")
                  chat.sendMessage("Waitt a sec")
                  let progress = 0;
                  const worker = await Tesseract.createWorker({
                    logger: mc => {
                      if(mc.progress){
                        progress += mc.progress;
                        drawProgressBar(progress)
                      };
                    }
                  })
                  await worker.loadLanguage("eng");
                  await worker.initialize("eng");
                  const { data: { text } } = await worker.recognize(base64Image);
                  console.log(`\nResult : ${text}`);
                  if(text){
                    await m.reply(text);
                  }else {
                    await m.reply("cant detect text on this image")
                  };
                  worker.terminate();
                }catch(e) {
                  console.log("Failed Reading Text")
                }
              }else { await m.reply("Is Not Image") }
            }else { await m.reply("Who image?") }
          }else { next(); };
        }else if(m.type === "chat"){ next() }
        else if(m.type === "sticker"||m.type === "image"){
          if(m.hasQuotedMsg&&m.hasMedia){
            try{
              const quoted = await m.getQuotedMessage();
              if(quoted.fromMe){
                readText();
              };
            }catch(e){
              console.log("terjad error : A")
            }
          }else if(!chat.isGroup&&m.hasMedia){
            readText();
          }
        };
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
            try {
              const quoted = await m.getQuotedMessage();
              if((!quoted.fromMe)&&quoted.type === "chat"&&quoted.body.length > 0&&m.type === "chat"&&(matchItem(m.body.toLowerCase(), "realy", systemConf.sim.high)||matchItem(m.body.toLowerCase(), ".aires", systemConf.sim.high)||matchItem(m.body.toLowerCase(), "benarkah", systemConf.sim.high))){
                const senderID = (m.author) ? m.author : m.from;
                queueAdd({
                  id: makeid(8),
                  chat: chat,
                  message: quoted.body,
                  senderContact: await host.getContactById(senderID)
                }, m);
              }else if (quoted.body.length > 0&&quoted.fromMe){
                queueAdd({
                  id: makeid(8),
                  chat: chat,
                  message: m.body,
                  senderContact: await host.getContactById(senderID)
                }, m);
            }else { commonCommand(); }
            }catch(e){ console.log("Terjadi Error : B") }
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