const { Configuration, OpenAIApi } = require('openai')
const config = require('../../config.json')
const databases = require('../Database/Database')
const fs = require('fs')

// Setup
const openAiConfig = new Configuration({
  apiKey: config.bot.openaiApiKey
})
const openaiApi = new OpenAIApi(openAiConfig)

/// / Main Function
// Chat Completion
const chatCompletion = async (user, assistant) => {
  try {
    const messages = []
    if (assistant) {
      messages.push({role: 'assistant', content: assistant})
    };
    messages.push({role: 'user', content: user})
    const completion = await openaiApi.createChatCompletion({
      model: 'gpt-3.5-turbo',
      temperature: 0.5,
      messages
    })
    return await completion.data.choices[0].message.content
  } catch (e) {
    databases.func.putLog(`[.red.]OpenAI-ChatCompletion : ${e}`)
    return `Failed to getting data *${e?.response?.statusText}*`
  }
}

// Image Generation
const generateImage = async (query)=>{
  try {
    const imageResult = await openaiApi.createImage({
      prompt: query,
      n: 1,
      size: '512x512',
      response_format: 'url'
    })
    return await imageResult.data.data[0].url
  } catch (e) {
    databases.func.putLog(`[.red.]OpenAI-GenerateImage : ${e}`)
    return false
  }
}

// Edit Image
const editImage = async (request, rawImagePath, maskImagePath) => {
  try {
    const response = await openaiApi.createImageEdit(
      fs.createReadStream(rawImagePath),
      fs.createReadStream(maskImagePath),
      request,
      1,
      "512x512"
    );
    return await response.data.data[0].url;
  } catch (e) {
    databases.func.putLog(`[.red.]OpenAI-GenerateImageVariation : ${e}`)
    return false
  }
}

// Image Variation
const generateImageVariation = async (imagePath) =>{
  try {
    const response = await openaiApi.createImageVariation(
      fs.createReadStream(imagePath),
      1,
      "512x512"
    )
    return await response.data.data[0].url
  } catch (e) {
    databases.func.putLog(`[.red.]OpenAI-GenerateImageVariation : ${e}`)
    return false
  }
}

const openai = {
  chatCompletion,
  generateImage,
  editImage,
  generateImage,
  generateImageVariation
}

module.exports = openai