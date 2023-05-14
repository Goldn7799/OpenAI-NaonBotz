
const a = () => {
  fetch('http://localhost:8090/execute/pAWIbyQKYylCuq99ot', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      commands: 'p'
    })
  }).then(ress => { return ress.json() })
    .then(res => console.log(res))
    .catch(e => console.error(e))
}
a()
