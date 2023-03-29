const { generateText } = require("./OpenAI.js");

let queue = [];

const queueAdd = (data, m)=>{
  try {
    queue.push(data);
    if (queue.length > 1){
      m.reply(`Queue at ${queue.length}`)
    };
  }catch(e){
    m.reply("Terjadi kesalahan saat memuat antrian")
  }
}

const detect = async ()=>{
  if (queue.length > 0){
    selectedQueue = queue[0];
    selectedQueue.chat.sendMessage("Generating response...");
    const response = await generateText(selectedQueue.message);
    selectedQueue.chat.sendMessage(response);
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
detect();

module.exports = {
  queueAdd,
  queue
}