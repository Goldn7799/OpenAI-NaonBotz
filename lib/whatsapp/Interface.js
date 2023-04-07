const express = require("express");
const cors = require("cors");
const { systemConf, setLimit, pricing } = require("../../globalConfig.js");
const os = require("os");
const { getQueue } = require("../OpenAI/Queue.js");

let data = {
  log: [],
  chatLog: []
};

let state = "";

const addLog = (text)=>{
  data.log.push(text);
}

const setState = (text)=>{
  state = text;
}

const addChatLog = (datas)=>{
  data.chatLog.push(datas);
  if (data.chatLog.length > 100){
    data.chatLog.splice(0, 1);
  };
}

const clearLog = ()=>{
  data.log = [];
}
const clearChatLog = ()=>{
  data.chatLog = [];
}

const start = ()=>{
  const app = express();
  app.use(cors({
    origin: "*"
  }))
  const colors = [
    "AliceBlue",
    "Beige",
    "Cornsilk",
    "FloralWhite",
    "Gainsboro",
    "GhostWhite",
    "HoneyDew",
    "Ivory",
    "Lavender",
    "LavenderBlush",
    "LemonChiffon",
    "LightBlue",
    "LightCoral",
    "LightCyan",
    "LightGoldenRodYellow",
    "LightGray",
    "LightGrey",
    "LightGreen",
    "LightPink",
    "LightSalmon",
    "LightSeaGreen",
    "LightSkyBlue",
    "LightSlateGray",
    "LightSlateGrey",
    "LightSteelBlue",
    "LightYellow",
    "MintCream",
    "MistyRose",
    "NavajoWhite",
    "OldLace",
    "PaleGoldenRod",
    "PaleGreen",
    "PaleTurquoise",
    "PaleVioletRed",
    "PapayaWhip",
    "PeachPuff",
    "SeaShell",
    "Snow",
    "WhiteSmoke",
    "Yellow",
    "YellowGreen"
  ];

  app.get("/", (req, res)=>{
    const rawIp = Object.values(os.networkInterfaces()).flatMap(x => x.map(y => y.address));
    let ip = "";
    let colorList = colors;
    rawIp.map(d => {
      const color = colorList[Math.floor(Math.random() * colorList.length)];
      colorList = colorList.filter(f => f !== color);
      ip += `<span style="color: ${color};">${d},</span> ` 
    });
    const uptimeInSeconds = process.uptime();
    const sUptimeInSeconds = os.uptime();
    const supHours = Math.floor(sUptimeInSeconds / 3600);
    const supMinutes = Math.floor((sUptimeInSeconds % 3600) / 60);
    const supSeconds = Math.floor(sUptimeInSeconds % 60);
    const upHours = Math.floor(uptimeInSeconds / 3600);
    const upMinutes = Math.floor((uptimeInSeconds % 3600) / 60);
    const upSeconds = Math.floor(uptimeInSeconds % 60);
    res.send(`
    <html>
      <head>
        <title>NaonBotz - OpenAI</title>
      </head>
      <body style="background-color: rgb(53,53,53); color: white;">
        <center>
          <h1 style="margin-top: 25px;">Interface is READY!!</h1>
          <div style="text-align: left;">
            <h4>--- SystemInfo ---</h4>
            <p>Memory : <b>${(os.freemem() / 1000000).toFixed(2)}MB Free of ${(os.totalmem() / 1000000).toFixed(2)}MB</b></p>
            <p>Memory Usage : <b>${((os.totalmem() / 1000000) - (os.freemem() / 1000000)).toFixed(2)}MB</b></p>
            <p>Nodejs Memory : <b>${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB Used</b></p>
            <p>Uptime : <b>${upHours}H ${upMinutes}M ${upSeconds}S</b></p>
            <p>System Uptime : <b>${supHours}H ${supMinutes}M ${supSeconds}S</b></p>
            <p>Ip : <b><span id="ip"><button onClick="showIp()">Show Ip</button></span></b></p>
            <button onClick="window.open('/monitor')">Monitor Mode</button>
          </div>
        </center>
        <script type="application/javascript">
          const showIp = ()=>{
            document.getElementById("ip").innerHTML = '${ip}';
          }
        </script>
      </body>
    </html>
    `)
  })
  app.get("/data/:password", async (req, res)=>{
    const { password } = req.params;
    if(password === systemConf.interface.password){
      data.os = await {
        arch: os.arch(),
        cpu: os.cpus(),
        freemem: os.freemem(),
        nodemem: process.memoryUsage().heapUsed,
        hostName: os.hostname(),
        loadAvg: os.loadavg(),
        machine: os.machine(),
        network: os.networkInterfaces(),
        platform: os.platform(),
        release: os.release(),
        tmpDir: os.tmpdir(),
        totalmem: os.totalmem(),
        uptime: process.uptime(),
        userInfo: os.userInfo(),
        version: os.version(),
        state: state,
        limit: pricing.limit_avabile
      },
      data.queue = await getQueue();
      res.status(200).json(data);
    }else {
      res.status(403).json({
        "status": "Invalid Request"
      });
    }
  });
  app.get("/monitor", (req, res)=>{
    const workingPath = process.cwd();
    res.sendFile(`${workingPath}/index.html`);
  })
  app.post("/request/clearlog/:password", (req, res)=>{
    const { password } = req.params;
    if (password === systemConf.interface.password){
      clearLog();
      res.status(200).json({
        success: true,
        message: "Succes clearing logs"
      });
    }else {
      res.status(403).json({
        success: false,
        message: "invalid request"
      });
    }
  })
  app.post("/request/clearchatlog/:password", (req, res)=>{
    const { password } = req.params;
    if (password === systemConf.interface.password){
      clearChatLog();
      res.status(200).json({
        success: true,
        message: "Succes clearing chat logs"
      });
    }else {
      res.status(403).json({
        success: false,
        message: "invalid request"
      });
    }
  })
  app.post("/request/setlimit/:limit/:password", async (req, res)=>{
    const { password, limit } = req.params;
    if(password === systemConf.interface.password){
      if(limit.length > 0&&parseFloat(limit)){
        const bLimit = await parseFloat(limit);
        setLimit(await bLimit);
        res.status(200).json({
          success: true
        })
      }else {
        res.status(403).json({
          success: false
        })
      }
    }else {
      res.status(403).json({
        success: false
      })
    }
  })
  app.listen(systemConf.interface.port, ()=>{
    console.log("\x1b[32m\x1b[1m%s\x1b[0m", "-- Interface Server Started --");
    console.log("Interface web port : \x1b[1m%s\x1b[0m", systemConf.interface.port)
  })
}

module.exports = {
  interface: {
    start,
    addLog,
    addChatLog,
    setState
  }
}