const fs = require("fs");
const { speechToText } = require("./lib/utility/Utility.js");

const a = async ()=>{
  const rawData = await fs.readFileSync("./tts.mp3");
  const rawBase64 = await rawData.toString("base64");
  const data = `data:audio/mp3;base64,${rawBase64}`;
  const translete = await speechToText(data);
  console.log(translete)
}
a()