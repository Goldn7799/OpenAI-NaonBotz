const { generateText } = require("./OpenAI.js");

//setup global variable
let queue = [];
let selectedQueue = {};

//adding new queue
const queueAdd = async (rawData, m, assistant)=>{
  try {
    let data = rawData;
    data.m = m;
    data.assistant = assistant;
    queue.push(data);
    if (queue.length > 1){
      await data.chat.sendMessage(`Queue at ${queue.length}`, { mentions: [ await data.senderContact ] });
    };
  }catch(e){
    await m.reply("Terjadi kesalahan saat memuat antrian")
  }
}
const getQueue = async ()=>{
  return await queue;
}

// let activated = false, looadState = -1;
// const emojiLoad = `🕛,🕐,🕑,🕒,🕓,🕔,🕕,🕖,🕗,🕘,🕙,🕚`.split(" ");
// const loadingReaction = (m)=>{
//   activated = true;
//   looadState = -1;
//   const loops = ()=>{
//     looadState++;
//     m.react(emojiLoad[looadState]);
//     if(looadState > emojiLoad.length -1){ looadState = -1; }
//     if(activated){ setTimeout(()=>{ loops(); }, 100); };
//   }
// }

//check and complete queue
const detect = async ()=>{
  if (queue.length > 0){
    try {
      selectedQueue = queue[0];
      await selectedQueue.chat.sendMessage("Generating response...", { mentions: [(await selectedQueue.senderContact) ? await selectedQueue.senderContact : ""] });
      const response = await generateText(selectedQueue.message, selectedQueue.assistant);
      selectedQueue.chat.sendStateTyping();
      await selectedQueue.m.reply(response);
      queue = queue.filter(items => items.id !== selectedQueue.id);
    }catch (e){
      console.log("Error At detect")
    }
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
  getQueue
}