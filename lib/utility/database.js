const fs = require("fs");

const defaultData = {
  "users": {},
  "chats": {},
  "state": {
    "limit": 0
  }
}

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

module.exports = database = {
  read,
  write,
  reset
}