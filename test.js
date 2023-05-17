const openai = require("./lib/Utility/OpenAI");

const a = async ()=>{
  console.log('searching..')
  console.log(await openai.generateImage("Rich Home"))
}
a()