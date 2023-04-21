const db = require("./lib/utility/database.js")

async function a(){
  let data = await db.read();
  const lists = Object.keys(data.chats);
  for (id of lists){
    data.chats[id].state.welcome = true;
  }
  console.log(data.chats)
  console.log(await db.write(data))
}
a()