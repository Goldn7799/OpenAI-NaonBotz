const similarity = require("similarity");
const sharp = require('sharp');
const fs = require('fs');
const ffmpeg = require('ffmpeg-static');
const ffmpegPath = require('ffmpeg-static').path;
const cp = require('child_process');
const request = require("request");
// const Jimp = require("jimp");
// const speech = require("@google-cloud/speech");

// async function speechToText(base64Audio) {
//   const client = new speech.SpeechClient();
//   const audioBuffer = Buffer.from(base64Audio, "base64");
//   const audioConfig = {
//     sampleRateHertz: 16000,
//     encoding: "LINEAR16",
//     laguageCode: "en-US"
//   }
//   const audio = {
//     content: audioBuffer
//   }
//   const request = {
//     audio: audio,
//     config: audioConfig
//   }

//   return await client.recognize(request)
//   .then((response) => {
//     const transcription = response[0].results
//     .map(result => result.alternatives[0].transcript)
//     .join("\n");
//     console.log(`Result : ${transcription}`);
//     return transcription;
//   })
//   .catch((err)=>{
//     console.log(`Error : ${err}`);
//   })
// }

function getImageFromUrl(url) {
  return new Promise((resolve, reject)=>{
    request(
      {
        url,
        encoding: null
      },
      (err, res, body)=>{
        if(err){
          reject(err);
          return;
        }
        const base64Image = Buffer.from(body).toString("base64");
        resolve(base64Image);
      }
    )
  })
}

const pickRandomObject = (wordList)=>{
  return wordList[Math.floor(Math.random() * wordList.length)]
};
const pickRandomString = (wordList)=>{
  return `${wordList[Math.floor(Math.random() * wordList.length)]}`
}

function capitalLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function convertVideoToImage(videoBase64) {
  // convert base64 string to buffer
  const videoBuffer = Buffer.from(videoBase64, 'base64');
  
  // write the video buffer to a temporary file
  const tempVideoPath = '/tmp/input.mp4'; // set temporary path for video file
  fs.writeFileSync(tempVideoPath, videoBuffer);
  
  // extract first frame from video as png
  const framePath = '/tmp/frame.png'; // set temporary path for frame file
  await new Promise((resolve, reject) => {
    const args = ['-i', tempVideoPath, '-ss', '00:00:01.000', '-vframes', '1', '-vf', 'scale=320:-2', framePath];
    const child = cp.spawn(ffmpegPath, args, {
      stdio: 'inherit'
    });
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code} and signal ${signal}`));
      }
    });
  });

  // read the frame and convert to webp
  const webpBuffer = await sharp(framePath)
    .webp()
    .toBuffer();

  // convert the webp buffer to base64 string
  const webpBase64 = webpBuffer.toString('base64');
  
  // delete temporary files
  fs.unlinkSync(tempVideoPath);
  fs.unlinkSync(framePath);

  return webpBase64;
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

// const imagePreProcessing = async (base64Image)=>{
//   try {
//     const bufferImage = Buffer.from(base64Image.split(',')[1], 'base64');
//     return await Jimp.read(bufferImage, function (err, image) {
//       if (err) {
//         console.log(err);
//         return false;
//       }
  
//       // Melakukan operasi preprocessing, kontras, pengurangan noise, dan normalisasi
//       return image
//         .grayscale() // Mengubah gambar menjadi skala abu-abu
//         .contrast(0.5) // Mengatur kontras
//         // .noise(0.5) // Mengurangi noise
//         .normalize() // Melakukan normalisasi
//         .getBase64(Jimp.MIME_PNG, (err, base64) => {
//           if (err) {
//             console.log(err);
//             return false;
//           }
  
//           // Mengembalikan output gambar dalam bentuk base64
//           // console.log(base64);
//           return base64;
//         });
//     });
//   }catch(e) {
//     console.log("Terjadi kesalahan pada preProcessing gambar")
//   }
// }

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
  convertVideoToImage,
  capitalLetter,
  getImageFromUrl,
  pickRandomObject,
  pickRandomString
}