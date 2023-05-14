// setup
const root = document.getElementById('root')
const ip = location.hostname
const port = location.port
const ipUrl = `http://${ip}:${port}`
console.log(ipUrl)

// pages
const pageState = {
  login: false,
  home: false
}

// function
const logOut = () => {
  localStorage.setItem('isLogin', 'false')
  page.login()
}

// pages
const page = {
  login: () => {
    pageState.login = true
    pageState.home = false
    root.innerHTML = `
      <div class="container">
        <div class="login">
          <h2 class="title">Naon Botz Login</h2>
          <div class="form-floating mb-3 text-dark username">
            <input type="text" class="form-control" id="floatingInput" placeholder="Username">
            <label for="floatingInput">Username or Email</label>
          </div>
          <div id="pass" style="margin-top: -60px; opacity: 0;" class="form-floating text-dark">
            <input type="password" class="form-control" id="floatingPassword" placeholder="Password">
            <label for="floatingPassword">Password</label>
          </div>
          <div id="invalid" class="invalid-feedback">
            Please choose a username.
          </div>
          <center><button style="margin-top: -60px; opacity: 0;" id="loginBtn">Login</button></center>
        </div>
        <p class="copyright">© 2023 SGStudio Project</p>
      </div>
    `
    const username = document.getElementById('floatingInput')
    const password = document.getElementById('floatingPassword')
    const passwordStyle = document.getElementById('pass')
    const loginBtn = document.getElementById('loginBtn')
    const invalidMsg = document.getElementById('invalid')
    const loginRun = () => {
      if (pageState.login) {
        if (`${username.value}`.length > 3) {
          passwordStyle.style.marginTop = ''
          passwordStyle.style.opacity = '1'
        } else {
          passwordStyle.style.marginTop = '-60px'
          passwordStyle.style.opacity = '0'
        }
        if (`${username.value}`.length > 3 && `${password.value}`.length > 3) {
          loginBtn.style.marginTop = '20px'
          loginBtn.style.opacity = '1'
        } else {
          loginBtn.style.marginTop = '-60px'
          loginBtn.style.opacity = '0'
        }
        setTimeout(() => {
          loginRun()
        }, 250)
      };
    }
    loginRun()
    loginBtn.addEventListener('click', async () => {
      loginBtn.innerHTML = '<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span> Login'
      fetch(`${ipUrl}/user/${username.value}/${password.value}`, { method: 'GET' })
        .then(rawRes => { return rawRes.json() })
        .then(res => {
          if (res.success) {
            loginBtn.innerHTML = 'Login'
            passwordStyle.classList.remove('is-invalid')
            localStorage.setItem('username', username.value)
            localStorage.setItem('password', password.value)
            localStorage.setItem('isLogin', 'true')
            page.home()
          } else {
            loginBtn.innerHTML = 'Login'
            invalidMsg.innerText = ((username.value).includes('@')) ? 'Email or Password Wrong' : 'Username or Password Wrong'
            passwordStyle.classList.add('is-invalid')
          }
        })
        .catch(() => {
          Notipin.Alert({
            msg: 'Service Not Avabile', // Pesan kamu
            yes: 'Ok', // Tulisan di tombol 'Yes'
            onYes: () => { /* Kode di sini */ },
            type: 'DANGER',
            mode: 'DARK'
          })
        })
    })
  },
  home: () => {
    pageState.login = false
    pageState.home = true
    root.innerHTML = `
      <div>
        Home
      </div>
    `
  }
}

window.onload = () => {
  setTimeout(() => {
    if (localStorage.getItem('isLogin') === 'true') {
      fetch(`${ipUrl}/user/${localStorage.getItem('username')}/${localStorage.getItem('password')}`, { method: 'GET' })
        .then(rawRes => { return rawRes.json() })
        .then(res => {
          if (res.success) {
            localStorage.setItem('isLogin', 'true')
            page.home()
          } else {
            localStorage.setItem('isLogin', 'false')
            page.login()
          }
        })
        .catch(() => {
          page.login()
        })
    } else {
      page.login()
    }
  }, 1000)
}
