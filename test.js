
const a = () => {
  fetch('http://localhost:8090/add/user/4FYY7qYl2A19J6uxd9', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'babi@asu.cok',
      username: 'Ardian',
      password: 'bambang'
    })
  }).then(ress => { return ress.json() })
    .then(res => console.log(res))
    .catch(e => console.error(e))
}
a()
