
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
a()
