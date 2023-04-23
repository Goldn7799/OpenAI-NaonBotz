const { rolePicker } = require('./globalConfig')

async function a () {
  console.log(await rolePicker(70))
}
a()
