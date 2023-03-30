const { generateText } = require("./lib/OpenAI/OpenAI.js");

const a = async ()=>{
  console.log(await generateText("Do you know jokowi", "one"))
}
a()