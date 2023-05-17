// const databases = require("./lib/Database/Database")
// const { exec } = require('child_process')
// const executeCmd = (cmd) => {
//   return new Promise((resolve) => {
//     exec(cmd, (error, stdout, stderr) => {
//       // if (error) {
//       //   resolve(`[.err.]${cmd}`)
//       //   return;
//       // };
//       // if (stderr) {
//       //   resolve(`[.stderr.]${stderr}`)
//       //   return;
//       // };
//       resolve(`[.stdout.]${stdout}`)
//     })
//   })
// }

const a = async () => {
  fetch('http://localhost:8090/sendchat/Bi46YzSIiqgq7sIyNV', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chatId: '120363136605874416@g.us',
      message: 'Test'
    })
  }).then(ress => { return ress.json() })
    .then(res => console.log(res))
    .catch(e => console.error('err : ',e))
  // const rawSpeedtest = `\n   Speedtest by Ookla\n\n      Server: HYPERNET - Bandung (id: 5065)\n         ISP: INDOSAT Internet Network Provider\nIdle Latency:    43.99 ms   (jitter: 3.05ms, low: 38.67ms, high: 50.87ms)\n\r    Download:     3.31 Mbps (data used: 5.0 MB)                                                   \n                340.75 ms   (jitter: 75.20ms, low: 82.28ms, high: 1194.27ms)\n\r      Upload:     9.68 Mbps (data used: 15.8 MB)                                                   \n                247.76 ms   (jitter: 68.83ms, low: 61.32ms, high: 1047.99ms)\n Packet Loss: Not available.\n  Result URL: https://www.speedtest.net/result/c/5b7f9845-b568-4527-921e-d29f0063a0ab\n`
  //         const speedtest = `${`${rawSpeedtest}`.replace(/\n/g, '[?.?]')}`.replace(/\s{2,}/g, '')
  //         const server = (speedtest.match(/Server:(.*?)\[\?\.\?\]/))[1].replaceAll('*', '')
  //         const isp = (speedtest.match(/ISP:(.*?)\[\?\.\?\]/))[1].replaceAll('*', '')
  //         const idleLatency = (speedtest.match(/Idle Latency:(.*?)\[\?\.\?\]/))[1].replaceAll('*', '')
  //         const upload = (speedtest.match(/Upload:(.*?)\[\?\.\?\]/))[1].replaceAll('*', '')
  //         const download = (speedtest.match(/Download:(.*?)\[\?\.\?\]/))[1].replaceAll('*', '')
  //         const resultUrl = (speedtest.match(/Result URL:(.*?)\[\?\.\?\]/))[1].replaceAll(' ', '')
  // console.log({
  //   server,
  //   isp,
  //   idleLatency,
  //   upload,
  //   download,
  //   resultUrl
  // })
  // for (let i = 0; i < 5; i++) {
  //   console.log(i)
  // }
}
a()
// setTimeout(() => {
//   console.log(databases.getChats('6282180394350@c.us'))
// }, 2500);
