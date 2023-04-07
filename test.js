const { generateImage } = require("./lib/OpenAI/OpenAI");

const a = async ()=>{
  console.log(await generateImage("Rich Home"));
};
a()