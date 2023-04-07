const { Configuration, OpenAIApi } = require("openai");
const { bot } = require("../../globalConfig.js");
const fs = require("fs");
require("dotenv").config();

//setup
const configApi = new Configuration({
  apiKey: bot.openAI_APIKEY
})
const openai = new OpenAIApi(configApi);

//run completition
const generateText = async (text, assistant)=>{
  if(text.length > 0){
    let messages = [];
    if(assistant){
      messages.push({"role": "assistant", "content": assistant});
    };
    messages.push({"role": "user", "content": text});
    try {
      const completion = await openai.createChatCompletion({
        "model": "gpt-3.5-turbo",
        messages,
        "temperature": 0.5
      })
      return await completion["data"]["choices"][0]["message"]["content"];
    }catch(e){
      return "Failed to getting data";
    }
  }else {
    return false;
  }
}

const generateImage = async (textQuery)=>{
  return false
  // try {
  //   const result = await openai.createImage({
  //     "prompt": textQuery,
  //     "n": 1,
  //     "size": "512x512",
  //     "response_format": "b64_json"
  //   })
  //   return await result.data.data[0].b64_json;
  // }catch (e){
  //   return false;
  // }
}

const generateVariationImage = async () =>{
  return false;
  // try {
  //   const result = await openai.createImageVariation(
  //     fs.createReadStream(`./temp.png`),
  //     1,
  //     "512x512",
  //     "b64_json"
  //   );
  //   return await result.data.data[0].b64_json;
  // }catch(e){ return false; }
}

module.exports = {
  generateText,
  generateImage,
  generateVariationImage
}