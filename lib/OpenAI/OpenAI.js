const { Configuration, OpenAIApi } = require("openai");
const { bot } = require("../../globalConfig.js");
require("dotenv").config();

//setup
const configApi = new Configuration({
  apiKey: bot.openAI_APIKEY
})
const openai = new OpenAIApi(configApi);

//run completition
const generateText = async (text)=>{
  if(text.length > 0){
    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ "role": "user", content: text }]
      })
      return await completion["data"]["choices"][0]["message"]["content"];
    }catch(e){
      return "Failed to getting data";
    }
  }else {
    return false;
  }
}

module.exports = {
  generateText
}