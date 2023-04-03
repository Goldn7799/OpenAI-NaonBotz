const { generateText } = require("./OpenAI.js");

//setup global variable
let queue = [];
let selectedQueue = {};

//adding new queue
const queueAdd = async (rawData, m)=>{
  try {
    let data = rawData;
    data.m = m;
    queue.push(data);
    if (queue.length > 1){
      await data.chat.sendMessage(`Queue at ${queue.length}`, { mentions: [ await data.senderContact ] });
    };
  }catch(e){
    await m.reply("Terjadi kesalahan saat memuat antrian")
  }
}

//check and complete queue
const detect = async ()=>{
  if (queue.length > 0){
    selectedQueue = queue[0];
    await selectedQueue.chat.sendMessage("Generating response...", { mentions: [(await selectedQueue.senderContact) ? await selectedQueue.senderContact : ""] });
    const response = await generateText(selectedQueue.message);
    selectedQueue.chat.sendStateTyping();
    await selectedQueue.m.reply(response);
    queue = queue.filter(items => items.id !== selectedQueue.id);
    setTimeout(() => {
      detect();
    }, 250);
  }else {
    setTimeout(() => {
      detect();
    }, 250);
  }
}
//run first detect
detect();

//export
module.exports = {
  queueAdd,
  queue
}