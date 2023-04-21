const { Configuration, OpenAIApi } = require("openai");
const bot = require("./globalConfig.js")

//setup buat konfig nya
const configApi = new Configuration({
  apiKey: bot.bot.openAI_APIKEY
})
const openai = new OpenAIApi(configApi);

//fungsi nya masbro
const ai = async (text)=>{
  try {
    //cobak ambil respon
    const responAi = await openai.createChatCompletion({
      "model": "gpt-3.5-turbo",
      "messages": [{ "content": text, "role": "user" }],
      "temperature": 0.5
    })
    //mengeluarkan pejuh, eh respon
    return await responAi["data"]["choices"][0]["message"]["content"];
  }catch(error){
    //kalau error
    return "Aduh Error Masbro";
  }
}

//contoh penggunaan nya bego
//"Halo Apa kabar, ada yang bisa saya bantu?";
const a = async ()=>{
  console.log(await ai("Halo"))
}
a()