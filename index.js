const { primaryHost } = require("./lib/whatsapp/Connection.js");
const { generateText } = require("./lib/OpenAI/OpenAI.js");
const { queueAdd, queue } = require("./lib/OpenAI/queue.js");
const { makeid } = require("./lib/utility/Utility.js");
const host = primaryHost;

//connect
host.initialize();

//setup
let groupWhitelist = []

//Ans
host.on("message", async (m)=>{
  const chat = await m.getChat();
  let isWhiteList = false;
  groupWhitelist.map(items =>{
    if(items === m.from){
      isWhiteList = true;
    };
  })
  const next = async ()=>{
    console.log(groupWhitelist)
    if(((!chat.isGroup)||isWhiteList)&&m.type === "chat"){
      const senderID = (chat.isGroup) ? m.author : m.from;
      // const senderContact = host.getContactById(await senderID);
      queueAdd({
        id: makeid(8),
        chat: chat,
        message: m.body
      }, m);
      // chat.sendMessage("Generating Response...", { mentions: [ await senderContact ] })
      // m.reply(await generateText(m.body));
    };
  }
  if (chat.isGroup) {
    if(m.type === "chat"){
      if(m.body === ".joingpt"){
        m.reply("Berhasil menambahkan");
        groupWhitelist.push(m.from);
      }else if(m.body === ".leavegpt"){
        m.reply("Berhasil keluar");
        groupWhitelist = groupWhitelist.filter(item => item !== m.from)
      }else { next(); };
    };
  }else { next(); };
})