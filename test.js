const { generateText } = require("./lib/OpenAI/OpenAI");

const a = async ()=>{
  console.log(await generateText("Translete to indonesian", "As an AI language model, I don't have emotions or feelings, but I'm functioning well. Thanks for asking! How can I assist you today?"))
};
a()