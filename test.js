const db = require("./lib/utility/database.js")

async function a(){
  console.log((await db.read()).users)
}
a()