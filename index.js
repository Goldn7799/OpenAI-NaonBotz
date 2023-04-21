const { primaryHost } = require("./lib/whatsapp/Connection.js");
const Tesseract = require("tesseract.js")
const { queueAdd } = require("./lib/OpenAI/Queue.js");
const { makeid, matchItem, drawProgressBar, convertWebPtoPNG, capitalLetter } = require("./lib/utility/Utility.js");
const { bot, user, systemConf, pricing } = require("./globalConfig.js");
const { interface } = require("./lib/whatsapp/Interface.js");
const { MessageMedia, Buttons } = require("whatsapp-web.js")
const fs = require("fs");
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
    let menuList = {
      "genral": {
        "joingpt": [".joingpt", 0, "Make gpt joined and response all chat on group", true],
        "leavegpt": [".leavegpt", 0, "Make gpt leave and can't response all chat on group", true],
        "startgpt": [".startgpt", 0, "Make bot make first chat to reply", true],
        "menu": [".menu", 0, "Show all actions", true]
      },
      "common": {
        "sticker": [".s / .sticker", 0, "Make image to sticker", true],
        "toimg": [".toimg", 0, "Make image to Sticker", true],
        "totext": [".totext", 0, "Detect text on Image", true],
        "tagall": [".tagall", 0, "Tag all members on group", true],
        "hidetag": [".hidetag <text>", 0, "Hide tag message", true],
        "tovn":  [".tovn", 0, "Make audio to Voice Note", true],
        "limit": [".limit", 0, "Check global limit and price", true]
      },
      "premium": {
        "aiimgvar": [".aiimgvar <query>", 0, "Extend image", false],
        "aiimg": [".aiimg <query>", 0, "AI Create Image", true],
      },
      "info": {
        "speed": [".speed", 0, "Test Ping", true],
        "owner": [".owner", 0, "Owner Contact", true]
      }
    };
    //get profile
    const getBotProfile = async ()=>{
      const urlProfilePhoto = await host.getProfilePicUrl(`${host.info.wid._serialized}`);
      const rawResProfilePhoto = await fetch(urlProfilePhoto);
      const rawProfilePhoto = await (await rawResProfilePhoto.arrayBuffer()).toString('base64');
      return await new MessageMedia("image/png", rawProfilePhoto);
    }
    //Run command if match at condition
    host.on("message", async (m)=>{
      try {
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
        const next = async (assistant)=>{
          if(((!chat.isGroup)||isWhiteList)&&m.type === "chat"){
            queueAdd({
              id: makeid(8),
              chat: chat,
              message: m.body,
              senderContact: await host.getContactById(senderID),
              assistant: assistant
            }, m, "text");
          };
        }
        const readText = async (qMsg)=>{
          if(m.hasMedia){
            const media = await m.downloadMedia();
            if(media){
              if(media?.mimetype === "image/png"||media?.mimetype === "image/jpeg"||media?.mimetype === "image/jpg"||media?.mimetype === "image/gif"||media?.mimetype === "image/webp"){
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
                        senderContact: await host.getContactById(senderID),
                        assistant: qMsg
                      }, m, "text");
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
            if(matchItem(m.body.toLowerCase(), ".sticker", systemConf.sim.high)||m.body.toLocaleLowerCase() === ".s"){
              menuList["common"]["sticker"][1]++;
              if(m.hasMedia){
                const chat = await m.getChat();
                await chat.sendMessage("Waitt a sec..");
                const media = await m.downloadMedia();
                if(media?.mimetype === "image/png"||media?.mimetype === "image/jpeg"||media?.mimetype === "image/gif"||media?.mimetype === "image/webp"){
                  await m.react("✅");
                  await m.reply(media, null, { sendMediaAsSticker: true, stickerAuthor: "SGStudio", stickerName: "Ai Botz|NaonBotz" });
                }else {
                  await m.reply("Unknown Format");
                  console.log(media.mimetype);
                }
              }else if(m.hasQuotedMsg){
                const quoted = await m.getQuotedMessage();
                if(quoted.hasMedia){
                  const chat = await m.getChat();
                  await chat.sendMessage("Waitt a sec..");
                  const media = await quoted.downloadMedia();
                  if(media?.mimetype === "image/png"||media?.mimetype === "image/jpeg"||media?.mimetype === "image/gif"||media?.mimetype === "image/webp"){
                    await m.react("✅");
                    await m.reply(media, null, { sendMediaAsSticker: true, stickerAuthor: "SGStudio", stickerName: "Ai Botz|NaonBotz" });
                  }else {
                    await m.reply("Unknown Format");
                    console.log(media.mimetype);
                  }
                }else {
                  await m.reply(`Is not a photo, is a ${m.type}`);
                }
              }else {
                await m.reply("Where Photo?")
              }
            }if(m.hasQuotedMsg&&matchItem(m.body.toLowerCase(), ".toimg", systemConf.sim.high)){
              menuList["common"]["toimg"][1]++;
              const quoted = await m.getQuotedMessage();
              if(quoted.type === "sticker"){
                const chat = await m.getChat();
                await chat.sendMessage("Waitt a sec..");
                const media = await quoted.downloadMedia();
                if(media?.mimetype === "image/png"||media?.mimetype === "image/gif"||media?.mimetype === "image/jpeg"||media?.mimetype === "image/webp"){
                  // await chat.sendMessage(media, { mentions: [ await host.getContactById(senderID) ] });
                  await m.react("⌛");
                  await m.reply("Done!!", null, { media: media });
                }else {
                  await m.reply("unknown Format");
                  console.log(media.mimetype);
                }
              }else {
                await m.reply(`Is not a sticker, is a ${m.type}`);
              }
            }else if(matchItem(m.body, ".tagall", systemConf.sim.high)&&chat.isGroup){
              menuList["common"]["tagall"][1]++;
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
            }else if(matchItem(m.body.split(" ")[0], ".hidetag", systemConf.sim.high)&&chat.isGroup){
              menuList["common"]["hidetag"][1]++;
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
                    text = m.body.replace(".hidetag", "");
                  }
                }else {
                  text = m.body.replace(".hidetag", "");
                }
                chat.sendMessage(await text, { mentions })
              }else {
                await m.reply("You not *Admin*");
              }
            }else if(matchItem(m.body, ".totext", systemConf.sim.high)){
              menuList["common"]["totext"][1]++;
              const rawMedia = (m.hasQuotedMsg) ? (((await m.getQuotedMessage()).hasMedia) ? ((await m.getQuotedMessage()).downloadMedia()) : ((m.hasMedia) ? (await m.downloadMedia()) : false)) : ((m.hasMedia) ? (await m.downloadMedia()) : false);
              const media = await rawMedia;
              if(media){
                if(media?.mimetype === "image/png"||media?.mimetype === "image/jpeg"||media?.mimetype === "image/jpg"||media?.mimetype === "image/gif"){
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
                      await m.react("🖨");
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
            }else if(matchItem(m.body.toLowerCase(), ".tovn", systemConf.sim.high)){
              menuList["common"]["tovn"][1]++;
              const quoted = (m.hasQuotedMsg) ? await m.getQuotedMessage() : false;
              if(quoted&&quoted.hasMedia){
                const audio = await quoted.downloadMedia();
                if(audio&&(audio.mimetype.split(";")[0] === "audio/mpeg"||audio.mimetype.split(";")[0] === "audio/ogg")){
                  await m.react("🔃");
                  await m.reply(audio, null, { sendAudioAsVoice: true });
                }else { await m.reply(`Is not audio, is ${audio.mimetype}`); }
              }else { await m.reply("Where Audio?") }
            }else if(matchItem(m.body.toLowerCase().split(" ")[0], ".aiimg", systemConf.sim.high)){
              const mBody = m.body.replace(".aiimg", "").replace(" ", "");
              if (mBody.length > 0){
                queueAdd({
                  id: makeid(8),
                  chat: chat,
                  message: mBody,
                  senderContact: await host.getContactById(senderID),
                  assistant: false
                }, m, "image");
              }else { await m.reply("Use .aiimg <query>") }
            }else if(matchItem(m.body.toLowerCase(), ".aiimgvar", systemConf.sim.high)){
              menuList["premium"]["aiimgvar"][1]++;
              const quoted = (m.hasQuotedMsg) ? await m.getQuotedMessage() : false;
              const image = (m.hasMedia) ? await m.downloadMedia() : ((quoted&&quoted.hasMedia) ? await quoted.downloadMedia() : false);
              if(image){
                const buffer = await Buffer.from(image.data, "base64");
                await fs.writeFile("./temp.png", buffer, async (err)=>{
                  if(err){
                    m.reply("Failed Save State");
                  }else{
                    queueAdd({
                      id: makeid(8),
                      chat: chat,
                      message: m.body,
                      senderContact: await host.getContactById(senderID),
                      assistant: false
                    }, m, "imageVariation");
                  }
                })
              }else {
                await m.react("🤣");
                await m.reply("I think i loss the image");
              }
            }else if(matchItem(m.body.toLowerCase(), ".owner", systemConf.sim.high)){
              menuList["info"]["owner"][1]++;
              const ownerLists = user.map((userlist)=>{
                if (userlist.isOwner){
                  return userlist.number + "@c.us";
                };
                return "none";
              }).filter(list => list !== "none");
              await m.reply(await host.getContactById(ownerLists[0]));
            }else if(matchItem(m.body.toLowerCase(), ".speed", systemConf.sim.high)){
              menuList["info"]["speed"][1]++;
              try {
                const start = Date.now();
                const res = await fetch("https://google.com", { method: "GET" });
                const end = Date.now();
                const ping = end - start;
                if(res.status === 200){
                  await m.reply(`Speed : ${ping.toFixed(2)}MS`);
                }else {
                  await m.reply(`Failed Status : ${res.statusText}(${res.status})`)
                }
              }catch(err){
                await m.reply("An Error to fetch");
              }
            }else if(matchItem(m.body.toLowerCase(), ".menu", systemConf.sim.high)){
              menuList["genral"]["menu"][1]++;
              await m.react("✅");
              const listOfMenu = Object.keys(menuList);
              let listOfSubMenu = {};
              const date = new Date();
              await listOfMenu.map((list)=>{
                listOfSubMenu[list] = Object.keys(menuList[list]);
              });
              const uptimeInSeconds = process.uptime();
              const upHours = Math.floor(uptimeInSeconds / 3600);
              const upMinutes = Math.floor((uptimeInSeconds % 3600) / 60);
              const upSeconds = Math.floor(uptimeInSeconds % 60);
              var messages = `╭─「 ${host.info.pushname} 🤖」\n│ 👋🏻 Hey, ${m._data.notifyName}!\n│\n│ 🧱 Limit : *${pricing.limit_avabile.toFixed(4)}$*\n│ 📅 Day: *${date.getUTCDay()} ${date.getUTCMonth()} ${date.getUTCFullYear()}*\n│ 🕰️ Time: *${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}(UTC)*\n│\n│ 📈 Uptime: *${upHours}H ${upMinutes}M ${upSeconds}S*\n╰────\n`;
              await listOfMenu.map(async (menu)=>{
                messages += `╭─「 *${capitalLetter(menu)}* 」\n`;
                listOfSubMenu[menu].map((subMenu)=>{
                  messages += (menuList[menu][subMenu][3]) ? `│ • ${menuList[menu][subMenu][0]} (${menuList[menu][subMenu][1]}) : ${menuList[menu][subMenu][2]}\n`:"";
                });
                messages += `╰────\n`;
              });
              await m.reply(messages);
              // await m.reply(`Hello *${m._data.notifyName}*\n *>General Command<*\n ${"```"}- Reply Bot${"```"} : Trigger AI Chat\n ${"```"}- .joingpt${"```"} : Make gpt joined and response all chat on group\n ${"```"}- .leavegpt${"```"} : Make gpt leave and can't response all chat on group\n ${"```"}- .startgpt${"```"} : Make bot make first chat to reply\n *>Common Command<*\n ${"```"}- .aiimg${"```"} : AI Create Image\n ${"```"}- .sticker / .s${"```"} : Make image to sticker\n ${"```"}- .toimg${"```"} : Make image to Sticker\n ${"```"}- .totext${"```"} : Detect text on Image\n ${"```"}- .tagall${"```"} : Tag all member on group\n ${"```"}- .hidetag${"```"} : Hide tag message\n ${"```"}- .tovn${"```"} : Send Audio as VN\n ${"```"}- .limit${"```"} : Check Global limit`)
            }else if(matchItem(m.body.toLowerCase(), ".limit", systemConf.sim.high)){
              menuList["common"]["limit"][1]++;
              await m.react("✅");
              await m.reply(`Global Limit : *${pricing.limit_avabile.toFixed(4)}$*`);
              await chat.sendMessage(`*-->List Price of Premium Command<--*\n Create Image(.aiimg) : *${pricing.image_cost}$/image*`);
            }else {
              if(m.hasQuotedMsg){
                try {
                  const qMsg = await m.getQuotedMessage();
                  next(((qMsg.fromMe) ? qMsg.body : false));
                }catch(e){
                  next(false);
                }
              }else { next(false); }
            };
          }else if(m.type === "chat"){ 
            if(m.hasQuotedMsg){
              try {
                const qMsg = await m.getQuotedMessage();
                next(((qMsg.fromMe) ? qMsg.body : false));
              }catch(e){
                next(false);
              }
            }else { next(false); }
          }
          else if(m.type === "sticker"||m.type === "image"){
            if(m.hasQuotedMsg&&m.hasMedia){
              try{
                const quoted = await m.getQuotedMessage();
                if(quoted.fromMe){
                  readText(quoted.body);
                };
              }catch(e){
                console.log("terjad error : A")
              }
            }else if(!chat.isGroup&&m.hasMedia){
              readText(false);
            }
          };
        }
        //Genral Command
        if (chat.isGroup) {
          if(m.type === "chat"){
            if(matchItem(m.body, ".joingpt", systemConf.sim.high)){
              menuList["genral"]["joingpt"][1]++;
              if(isWhiteList){
                await m.reply("Already joined");
              }else {
                await m.reply("Succes added GPT");
                groupWhitelist.push(m.from);
              }
            }else if(matchItem(m.body, ".leavegpt", systemConf.sim.high)){
              menuList["genral"]["leavegpt"][1]++;
              if(!isWhiteList){
                await m.reply("Already leave");
              }else {
                await m.reply("Succes leave");
                groupWhitelist = groupWhitelist.filter(item => item !== m.from)
              }
            }else if(matchItem(m.body, ".startgpt", systemConf.sim.high)){
              menuList["genral"]["startgpt"][1]++;
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
                    senderContact: await host.getContactById(senderID),
                    assistant: false
                  }, m, "text");
                }else if (quoted.body.length > 0&&quoted.fromMe){
                  queueAdd({
                    id: makeid(8),
                    chat: chat,
                    message: m.body,
                    senderContact: await host.getContactById(senderID),
                    assistant: quoted.body
                  }, m, "text");
              }else { commonCommand(); }
              }catch(e){ console.log("Terjadi Error : B") }
            }else { commonCommand(); };
          }else { commonCommand(); }
        }else { commonCommand(); };
      }catch(error){
        console.log("Failed load message")
      }
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