// setup
const root = document.getElementById('root')
const ip = location.hostname
const port = location.port
const ipUrl = `http://${ip}:${port}`
let myIp = 'check'
console.log(ipUrl)
let cred = {};
let pings = 0;

// pages
const pageState = {
  login: false,
  home: false
}

// Ping
const pingTest = async ()=>{
  await fetch('http://ip-api.com/json/')
  .then(response => response.json())
  .then(data => {
    myIp = data.query
  })
  .catch(() => {
    myIp = "check"
  });

  const start = Date.now()
  await fetch(`${ipUrl}/ping`, { method: "GET" })
  .then(res => {
    if(res.status === 200){
      const end = Date.now()
      pings = end - start
    }else {
      pings = res.statusText
    }
    setTimeout(() => {
      pingTest()
    }, 1250);
  })
  .catch((err)=>{
    pings = "Unreacable"
    console.log(err)
    setTimeout(() => {
      pingTest()
    }, 1250);
  })
}
pingTest()

// function
const logOut = () => {
  Notipin.Confirm({
    msg: "Do you want to LogOut?", // Pesan kamu
    yes: "Yes", // Tulisan di tombol 'Yes'
    no: "No", // Tulisan di tombol 'No'
    onYes: () => {
      localStorage.setItem('isLogin', 'false')
      page.login()
    },
    onNo: () => { /* Kode di sini */ },
    type: "NORMAL",
    mode: "DARK",
  })
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
      fetch(`${ipUrl}/user/${myIp}/${username.value}/${password.value}`, { method: 'GET' })
        .then(rawRes => { return rawRes.json() })
        .then(res => {
          if (res.success) {
            cred = res.data
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
        <nav class="navbar navbar-expand-lg bg-body-tertiary navbars" data-bs-theme="dark">
          <div class="container-fluid">
            <a class="navbar-brand" href="#">
            <img src="./assets/logo.png" alt="Bootstrap" width="30" height="30">
            Naon Botz
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
              <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item">
                  <a class="nav-link active" aria-current="page" href="#">Home</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#">Settings</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#">Console</a>
                </li>
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Shorcut
                  </a>
                  <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#">Action</a></li>
                    <li><a class="dropdown-item" href="#">Another action</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#">Something else here</a></li>
                  </ul>
                </li>
                <li class="nav-item">
                  <a class="nav-link disabled" style="font-weight: bold;" id="ping">loading..</a>
                </li>
              </ul>
              <p id="username"></p>
              <button id="logout" class="btn btn-danger"><i class="fa-solid fa-right-from-bracket"></i></button>
            </div>
          </div>
        </nav>
      </div>
    `
    document.getElementById("logout").addEventListener("click", ()=>{
      logOut()
    })
    const ping = document.getElementById('ping')
    const runHome = ()=>{
      if(pageState.home){
        if (typeof(pings) === 'number'){
          if (`${pings}`.length > 3) {
            ping.style.color = "red"
          } else if (`${pings}`.length > 2) {
            ping.style.color = "yellow"
          } else if (`${pings}`.length > 1) {
            ping.style.color = "lightgreen"
          };
          ping.innerText = pings + "MS"
        } else if (typeof(pings) === 'string'){
          ping.style.color = "gray"
          ping.innerText = pings
        };
        document.getElementById("username").innerText = cred.user.username
        setTimeout(() => {
          runHome()
        }, 250);
      };
    }
    runHome()
  }
}

window.onload = () => {
  setTimeout(() => {
    if (localStorage.getItem('isLogin') === 'true') {
      fetch(`${ipUrl}/user/check/${localStorage.getItem('username')}/${localStorage.getItem('password')}`, { method: 'GET' })
        .then(rawRes => { return rawRes.json() })
        .then(res => {
          if (res.success) {
            cred = res.data
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
