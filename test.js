const databases = require('./lib/Database/Database')

const runMain = async () => {
  console.log('ready')
  await databases.func.editChats('a', { p: 'p' })
  await databases.func.editGroups('a', { p: 'p' })
  console.log(databases.getDb())
}

const checkState = () => {
  console.log(databases.getStateReady())
  if (databases.getStateReady()) {
    runMain()
  } else {
    setTimeout(() => {
      checkState()
    }, 1500)
  }
}
checkState()
