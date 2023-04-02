const express = require("express");
const { systemConf } = require("../../globalConfig.js");
const os = require("os");
const { queue } = require("../OpenAI/Queue.js");

let data = {
  log: [],
  chatLog: []
};

const addLog = (text)=>{
  data.log.push(text);
}

const addChatLog = (datas)=>{
  data.chatLog.push(datas);
}

const start = ()=>{
  const app = express();

  app.get("/", (req, res)=>{
    res.send(`
    <html>
      <head>
        <title>NaonBotz - OpenAI</title>
      </head>
      <body style="background-color: rgb(53,53,53); color: white;">
        <center>
          <h1 style="margin-top: 25px;">Interface is READY!!</h1>
        </center>
      </body>
    </html>
    `)
  })
  app.get("/data", async (req, res)=>{
    data.os = await {
      arch: os.arch(),
      cpu: os.cpus(),
      freemem: os.freemem(),
      hostname: os.hostname(),
      loadAvg: os.loadavg(),
      machine: os.machine(),
      network: os.networkInterfaces(),
      platform: os.platform(),
      release: os.release(),
      tmpDir: os.tmpdir(),
      totalMem: os.totalmem(),
      uptime: os.uptime(),
      userInfo: os.userInfo(),
      version: os.version()
    },
    data.queue = queue;
    res.json(data);
  })

  app.listen(systemConf.interface.port, ()=>{
    console.log("\x1b[32m\x1b[1m%s\x1b[0m", "-- Interface Server Started --")
  })
}

module.exports = {
  interface: {
    start,
    addLog,
    addChatLog
  }
}