const similarity = require("similarity");
const sharp = require('sharp');
const speech = require("@google-cloud/speech");

async function speechToText(base64Audio) {
  const client = new speech.SpeechClient();
  const audioBuffer = Buffer.from(base64Audio, "base64");
  const audioConfig = {
    sampleRateHertz: 16000,
    encoding: "LINEAR16",
    laguageCode: "en-US"
  }
  const audio = {
    content: audioBuffer
  }
  const request = {
    audio: audio,
    config: audioConfig
  }

  return await client.recognize(request)
  .then((response) => {
    const transcription = response[0].results
    .map(result => result.alternatives[0].transcript)
    .join("\n");
    console.log(`Result : ${transcription}`);
    return transcription;
  })
  .catch((err)=>{
    console.log(`Error : ${err}`);
  })
}

async function convertWebPtoPNG(base64String) {
  try {
    // decode base64 string menjadi buffer
    const buffer = Buffer.from(base64String.split(',')[1], 'base64');

    // mengubah gambar WebP menjadi PNG menggunakan sharp
    const pngBuffer = await sharp(buffer).png().toBuffer();

    // encode buffer gambar PNG menjadi base64 string
    const pngBase64String = `data:image/png;base64,${pngBuffer.toString('base64')}`;

    return pngBase64String;
  } catch (err) {
    // handle error
    console.error(err);
    return false;
  }
}


function matchItem(A, B, dificult){
  if(similarity(A, B) >= dificult){
    return true;
  }else {
    return false;
  }
}

function drawProgressBar(rawProgress) {
  let progress = 0;
  const next = ()=>{
    try {
      const barWidth = 20;
      const percent = Math.round(progress);
      const completeWidth = Math.round((barWidth * progress) / 100);
      const incompleteWidth = barWidth - completeWidth;
  
      process.stdout.write(`Loading [${'='.repeat(completeWidth)}${' '.repeat(incompleteWidth)}] ${percent}%`);
  
      // kembali ke awal baris
      process.stdout.write('\r');
    }catch(e){
      console.log("Progress Error : %s", e);
    }
  }
  if (rawProgress > 100){
    progress = 100;
    next();
  }else {
    progress = rawProgress;
    next();
  }
}

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
  }
  return result;
}

module.exports = {
  drawProgressBar,
  makeid,
  matchItem,
  convertWebPtoPNG,
  speechToText
}