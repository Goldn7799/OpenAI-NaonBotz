const fs = require("fs");
const { bot } = require("../../globalConfig.js");

const defaultData = {
  "users": {},
  "chats": {},
  "state": {
    "limit": 0
  }
}

fs.mkdir(`${process.cwd()}/backups`, (err)=>{
  if(err){
    // console.log(err);
  };
})

const read = ()=>{
  return new Promise((resolve, reject)=>{
    fs.readFile(`${process.cwd()}/database.json`, "utf-8", (err, res)=>{
      if(err){
        resolve(false);
      }else {
        resolve(JSON.parse(res));
      }
    });
  })
}

const write = (data)=>{
  return new Promise((resolve, reject)=>{
    fs.writeFile(`${process.cwd()}/database.json`, JSON.stringify(data), (err)=>{
      if(err){
        resolve(false);
      }else {
        resolve(true);
      }
    })
  })
}

const reset = (sure)=>{
  return new Promise((resolve, reject)=>{
    if(sure){
      fs.writeFile(`${process.cwd()}/database.json`, JSON.stringify(defaultData), (err)=>{
        if(err){
          resolve(false);
        }else {
          resolve(true);
        }
      })
    }else {
      resolve(false);
    }
  })
}

const backupTime = async ()=>{
  const date = new Date();
  const hours = (date.getHours() === bot.backupTime[0]) ? true : false;
  const minute = (date.getMinutes() === bot.backupTime[1]) ? true : false;
  if(hours&&minute){
    fs.writeFile(`${process.cwd()}/backups/${Date().substring(0, 24).replaceAll(" ", "-")}.json`, JSON.stringify(await read()), (err)=>{
      if(err){
        console.log(err);
      }else {
        console.log("----- Backups Created -----")
      }
    });
    setTimeout(()=>{
      backupTime();
    },120000)
  }else {
    setTimeout(() => {
      backupTime();
    }, 30000);
  }
};
backupTime();

module.exports = database = {
  read,
  write,
  reset
}