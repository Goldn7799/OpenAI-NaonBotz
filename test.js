const databases = require("./lib/Database/Database");
const openai = require("./lib/Utility/OpenAI");

const a = async ()=>{
  // console.log('searching..')
  // console.log(await openai.generateImage("Rich Home"))
  setTimeout(async () => {
    console.log(await openai.generateImageVariation('data-store/varTemp.png'))
  }, 1000);
}
a()