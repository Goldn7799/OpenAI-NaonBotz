const databases = require("./lib/Database/Database");
const openai = require("./lib/Utility/OpenAI");

const a = async ()=>{
  // console.log('searching..')
  // console.log(await openai.generateImage("Rich Home"))
  setTimeout(() => {
    databases.limit.openaiSell(1)
    console.log(databases.limit.getOpenaiBalance())
  }, 1000);
}
a()