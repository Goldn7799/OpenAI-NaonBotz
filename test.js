const { generateVariationImage } = require("./lib/OpenAI/OpenAI");

const a = async ()=>{
  console.log(await generateVariationImage());
};
a()