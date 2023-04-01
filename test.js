const Tesseract = require("tesseract.js")

const a = async ()=>{
  const worker = await Tesseract.createWorker({
    logger: mc => console.log(mc)
  })
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  const { data: { text } } = await worker.recognize("https://tesseract.projectnaptha.com/img/eng_bw.png");
  console.log(text);
}
a()