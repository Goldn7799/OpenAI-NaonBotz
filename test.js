const databases = require("./lib/Database/Database")

const a = () => {
  fetch('http://localhost:8090/edit/user/gnsfSOl2OZ0SjRTofC/2YuKpD5OnfZCLNCm9f/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      currentPassword: 'gbKJAAm1dA5t5Xdeq5',
      password: '',
      username: 'Ardian'
    })
  }).then(ress => { return ress.json() })
    .then(res => console.log(res))
    .catch(e => console.error(e))
}
// a()
setTimeout(() => {
  console.log(databases.getChats('6282180394350@c.us'))
}, 2500);
