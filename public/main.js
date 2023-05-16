// setup
const root = document.getElementById('root')
const ip = location.hostname
const port = location.port
const ipUrl = `http://${ip}:${port}`
let myIp = 'check'
let cred = {}
let pings = 0
let logs = []
let userlist = {}
let message = {}
let botState = {}

// pages
const pageState = {
  login: false,
  home: false
}

// Ping
const ipCheck = async () => {
  await fetch('http://ip-api.com/json/')
    .then(response => response.json())
    .then(data => {
      myIp = data.query
    })
    .catch(() => {
      myIp = 'check'
    })
}
ipCheck()

const getResource = async () => {
  let fuse = true
  const start = Date.now()
  fetch(`${ipUrl}/log/${cred.user.auth}`, { method: 'GET' })
    .then(ress => {
      if (ress.status === 200) {
        const end = Date.now()
        pings = end - start
      } else {
        pings = ress.statusText
      }
      return ress.json()
    })
    .then(res => {
      if (res.success) {
        logs = res.data
      } else {
        logs.push('[.red.]Auth code Experied, please the reload page')
        fuse = false
      };
    })
    .catch(() => {
      pings = 'Unreacable'
      logs.push('[.red.]Disconnected, Reconneting')
    })
  fetch(`${ipUrl}/message/${cred.user.auth}`, { method: 'GET' })
    .then(ress => { return ress.json() })
    .then(res => {
      if (res.success) {
        message = res.data
      };
    })
  fetch(`${ipUrl}/botstate/${cred.user.auth}`, { method: 'GET' })
    .then(ress => { return ress.json() })
    .then(res => {
      if (res.success) {
        botState = res.data
      };
    })
  if (cred.user.isAdministator || cred.user.permission.manageUsers) {
    fetch(`${ipUrl}/userlist/${cred.user.auth}`, { method: 'GET' })
      .then(ress => { return ress.json() })
      .then(res => {
        if (res.success) {
          userlist = res.data
        } else {
          userlist = {}
        };
      })
  } else {
    userlist = {}
  };
  if (fuse) {
    setTimeout(() => {
      getResource()
    }, 1250)
  };
}

// function
function timeParse (hours, minute, second) {
  if (`${hours}` && `${minute}` && `${second}` !== 'undefined') {
    return `${(`${hours}`.length > 1) ? `${hours}` : `0${hours}`}:${(`${minute}`.length > 1) ? `${minute}` : `0${minute}`}:${(`${second}`.length > 1) ? `${second}` : `0${second}`}`
  } else if (`${hours}` && `${minute}`) {
    return `${(`${hours}`.length > 1) ? `${hours}` : `0${hours}`}:${(`${minute}`.length > 1) ? `${minute}` : `0${minute}`}`
  } else {
    return false
  }
}

const deleteUser = (email) => {
  if (email) {
    Notipin.Confirm({
      msg: `Really to delete <b>${email}</b>?`, // Pesan kamu
      yes: 'Yes', // Tulisan di tombol 'Yes'
      no: 'No', // Tulisan di tombol 'No'
      onYes: () => {
        fetch(`${ipUrl}/delete/user/${email}/${cred.user.auth}`, { method: 'POST' })
          .then(ress => { return ress.json() })
          .then(res => {
            if (res.success) {
              Notipin.Alert({
                msg: `${res.message}`, // Pesan kamu
                yes: 'Ok', // Tulisan di tombol 'Yes'
                onYes: () => { /* Kode di sini */ },
                type: 'INFO',
                mode: 'DARK'
              })
            } else {
              Notipin.Alert({
                msg: `${res.message}`, // Pesan kamu
                yes: 'Ok', // Tulisan di tombol 'Yes'
                onYes: () => { /* Kode di sini */ },
                type: 'NORMAL',
                mode: 'DARK'
              })
            }
          })
          .catch(() => {
            Notipin.Alert({
              msg: 'Failed to delete', // Pesan kamu
              yes: 'Ok', // Tulisan di tombol 'Yes'
              onYes: () => { /* Kode di sini */ },
              type: 'NORMAL',
              mode: 'DARK'
            })
          })
      },
      onNo: () => { /* Kode di sini */ },
      type: 'DANGER',
      mode: 'DARK'
    })
  } else {
    Notipin.Alert({
      msg: 'Email Can\'t be null', // Pesan kamu
      yes: 'Ok', // Tulisan di tombol 'Yes'
      onYes: () => { /* Kode di sini */ },
      type: 'NORMAL',
      mode: 'DARK'
    })
  }
}

const createUser = () => {
  Notipin.Prompt({
    msg: 'Please input E-Mail <p>(min 5 char)</p>', // Pesan kamu
    placeholder: 'Email..',
    max: 0, // Maksimal karakter (integer)
    textarea: false, // tag element (boolean)
    yes: 'Next', // Tulisan di tombol 'Yes'
    no: 'Cancel', // Tulisan di tombol 'No'
    onYes: (email) => {
      if (email && email.length > 4) {
        Notipin.Prompt({
          msg: 'Please input Username <p>(min 5 char)</p>', // Pesan kamu
          placeholder: 'Username..',
          max: 0, // Maksimal karakter (integer)
          textarea: false, // tag element (boolean)
          yes: 'Next', // Tulisan di tombol 'Yes'
          no: 'Cancel', // Tulisan di tombol 'No'
          onYes: (username) => {
            if (username && username.length > 4) {
              Notipin.Prompt({
                msg: 'Please input Password <p>(min 5 char)</p>', // Pesan kamu
                placeholder: 'Password..',
                max: 0, // Maksimal karakter (integer)
                textarea: false, // tag element (boolean)
                yes: 'Next', // Tulisan di tombol 'Yes'
                no: 'Cancel', // Tulisan di tombol 'No'
                onYes: (password) => {
                  if (password && password.length > 4) {
                    Notipin.Confirm({
                      msg: `<div class="confirmCreate"><p>Check the format below</p><p>E-Mail : <b>${email}</b></p><p>Username : <b>${username}</b></p><p>Password : <b>${password}</b></p><p>Continue ?</p></div>`, // Pesan kamu
                      yes: 'Ok', // Tulisan di tombol 'Yes'
                      no: 'Cancel', // Tulisan di tombol 'No'
                      onYes: () => {
                        fetch(`${ipUrl}/add/user/${cred.user.auth}`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            email,
                            username,
                            password
                          })
                        })
                          .then(ress => { return ress.json() })
                          .then(res => {
                            if (res.success) {
                              Notipin.Alert({
                                msg: 'Succes Create User', // Pesan kamu
                                yes: 'Ok', // Tulisan di tombol 'Yes'
                                onYes: () => { /* Kode di sini */ },
                                type: 'INFO',
                                mode: 'DARK'
                              })
                            } else {
                              Notipin.Alert({
                                msg: `${res.message}`, // Pesan kamu
                                yes: 'Ok', // Tulisan di tombol 'Yes'
                                onYes: () => { /* Kode di sini */ },
                                type: 'NORMAL',
                                mode: 'DARK'
                              })
                            }
                          })
                          .catch(() => {
                            Notipin.Alert({
                              msg: 'Failed to connect to server', // Pesan kamu
                              yes: 'Ok', // Tulisan di tombol 'Yes'
                              onYes: () => { /* Kode di sini */ },
                              type: 'DANGER',
                              mode: 'DARK'
                            })
                          })
                      },
                      onNo: () => { /* Kode di sini */ },
                      type: 'NORMAL',
                      mode: 'DARK'
                    })
                  } else {
                    Notipin.Alert({
                      msg: 'Min 5 Char', // Pesan kamu
                      yes: 'Ok', // Tulisan di tombol 'Yes'
                      onYes: () => { /* Kode di sini */ },
                      type: 'NORMAL',
                      mode: 'DARK'
                    })
                  }
                },
                onNo: () => { /* Kode di sini */ },
                type: 'BLUE',
                mode: 'DARK'
              })
            } else {
              Notipin.Alert({
                msg: 'Min 5 Char', // Pesan kamu
                yes: 'Ok', // Tulisan di tombol 'Yes'
                onYes: () => { /* Kode di sini */ },
                type: 'NORMAL',
                mode: 'DARK'
              })
            }
          },
          onNo: () => { /* Kode di sini */ },
          type: 'BLUE',
          mode: 'DARK'
        })
      } else {
        Notipin.Alert({
          msg: 'Min 5 Char', // Pesan kamu
          yes: 'Ok', // Tulisan di tombol 'Yes'
          onYes: () => { /* Kode di sini */ },
          type: 'NORMAL',
          mode: 'DARK'
        })
      }
    },
    onNo: () => { /* Kode di sini */ },
    type: 'BLUE',
    mode: 'DARK'
  })
}

const editUser = (email) => {
  const selectedUser = userlist[email]
  Notipin.Confirm({
    msg: `<div>
      <h6>${selectedUser.username}</h6>
      <p>${email}</p>
      <div class="btn-group" role="group" aria-label="Basic checkbox toggle button group">
        <input type="checkbox" class="btn-check" id="sendMsg" autocomplete="off" ${(selectedUser.permission.sendMessage) ? 'checked' : ''}>
        <label class="btn btn-outline-primary" for="sendMsg">Send Message</label>

        <input type="checkbox" class="btn-check" id="manageCon" autocomplete="off" ${(selectedUser.permission.manageConnection) ? 'checked' : ''}>
        <label class="btn btn-outline-primary" for="manageCon">Manage Connection</label>

        <input type="checkbox" class="btn-check" id="manageUsr" autocomplete="off" ${(selectedUser.permission.manageUsers) ? 'checked' : ''}>
        <label class="btn btn-outline-primary" for="manageUsr">Manage Users</label>
      </div>
      <div class="form-floating mb-3">
        <input type="username" class="form-control" id="conUsername" placeholder="Username..">
        <label for="conUsername">New Username</label>
      </div>
      <div class="form-floating">
        <input type="password" class="form-control" id="conPassword" placeholder="Password">
        <label for="conPassword">New Password</label>
      </div>
    </div>`, // Pesan kamu
    yes: 'Save', // Tulisan di tombol 'Yes'
    no: 'Cancel', // Tulisan di tombol 'No'
    onYes: async () => {
      const conUsername = document.getElementById('conUsername')
      const conPassword = document.getElementById('conPassword')
      const sendMsg = document.getElementById('sendMsg')
      const manageCon = document.getElementById('manageCon')
      const manageUsr = document.getElementById('manageUsr')
      let editUsrNPass = false
      let editPermis = false
      if (conUsername.value || conPassword.value || (conUsername.value && conPassword.value)) {
        await fetch(`${ipUrl}/edit/user/${selectedUser.auth}/${cred.user.auth}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            currentPassword: conPassword.value,
            username: conUsername.value,
            password: conPassword.value
          })
        })
          .then(ress => { return ress.json() })
          .then(res => {
            editUsrNPass = res.message
          })
          .catch(() => {
            editUsrNPass = 'Server not avabile'
          })
      };
      await fetch(`${ipUrl}/edit/permission/${selectedUser.auth}/${cred.user.auth}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          manageUsers: manageUsr.checked,
          manageConnection: manageCon.checked,
          sendMessage: sendMsg.checked
        })
      })
        .then(ress => { return ress.json() })
        .then(res => {
          editPermis = res.message
        })
        .catch(() => {
          editPermis = 'Server not avabile'
        })
      Notipin.Alert({
        msg: `${(editUsrNPass) ? `<p><b>Edit User Status</b> : ${editUsrNPass}</p>` : ''}<p><b>Edit Permission Status</b> : ${editPermis}</p>`, // Pesan kamu
        yes: 'Ok', // Tulisan di tombol 'Yes'
        onYes: () => { /* Kode di sini */ },
        type: 'INFO',
        mode: 'DARK'
      })
    },
    onNo: () => { /* Kode di sini */ },
    type: 'NORMAL',
    mode: 'DARK'
  })
}

const logOut = () => {
  Notipin.Confirm({
    msg: 'Do you want to LogOut?', // Pesan kamu
    yes: 'Yes', // Tulisan di tombol 'Yes'
    no: 'No', // Tulisan di tombol 'No'
    onYes: () => {
      localStorage.setItem('isLogin', 'false')
      page.login()
    },
    onNo: () => { /* Kode di sini */ },
    type: 'NORMAL',
    mode: 'DARK'
  })
}

const shortMessage = () => {
  const keys = Object.keys(message)
  const msgArray = keys.map((key) => {
    return {
      key,
      value: message[key].metadata.lastUpdate
    }
  })
  return msgArray.sort((ka, kb) => kb.value - ka.value)
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
                  <a  id="homeBtn" class="nav-link active" aria-current="page" href="#">Home</a>
                </li>
                <li class="nav-item">
                  <a id="settingsBtn" class="nav-link" href="#">Settings</a>
                </li>
                <li class="nav-item">
                  <a  id="consoleBtn" class="nav-link" href="#">Console</a>
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
        <center>
          <div class="animationAll" id="home" style="display: block; opacity: 1; margin-left: 0px;">
            <div id="qr-code" style="display: none;"><div id="QrPlace"></div></div>
            <center id="waitingLogs">
              <svg
                class="ring"
                viewBox="25 25 50 50"
                stroke-width="5"
              >
                <circle cx="50" cy="50" r="20" />
              </svg>
              <h4><b>Waiting Logs..</b></h4>
            </center>
            <div id="chatsPlace"></div>
          </div>
          <div class="animationAll" id="settings" style="display: none; opacity: 0; margin-left: -1000px;">
            <div id="settingsSelector">
              <h5>Genral</h5>
              <p class="activated" id="accountBtn">Account</p>
              <p id="usersBtn">Users</p>
              <p id="whatsappBtn">WhatsApp</p>
              </div>
            <div id="settingsView">
              <div class="animationAll" id="setAccount" style="opacity: 1;">
                <h4 style="font-weight: bold;">My Account</h4>
                <div class="optionAB">
                <div class="divAB">
                    <div class="input-group mb-3">
                      <input id="newUsername" type="text" class="form-control" placeholder="New Username" aria-label="Username" aria-describedby="basic-addon1">
                    </div>
                    <div class="input-group mb-3">
                      <input id="newPassword" type="text" class="form-control" placeholder="New Password" aria-label="Username" aria-describedby="basic-addon1">
                    </div>
                  </div>
                  <div class="divAB">
                    <div class="input-group mb-3">
                      <input id="currentPassword" type="password" class="form-control" placeholder="Current Password" aria-label="Username" aria-describedby="basic-addon1">
                    </div>
                    <button id="saveAccBtn" class="btn btn-primary">Save Change</button>
                  </div>
                </div>
              </div>
              <div class="animationAll" id="setUsers" style="display: none; opacity: 0;"></div>
              <div class="animationAll" id="setWhatsapp" style="display: none; opacity: 0;">
                <p>Session : <b id="session"></b></p>
                <p>OpenIA Limit : <b id="openaiLimit"></b></p>
                <p>Prefix : <b id="prefix"></b></p>
                <p>Uptime : <b id="uptime"></b></p>
              </div>
            </div>
          </div>
          <div class="animationAll" id="console" style="display: none; opacity: 0; margin-left: -1000px;">
            <div id="consoleRoom">p</div>
            <input id="commandInput" type="text" placeholder="Command Here"></input>
          </div>
        </center>
      </div>
    `
    document.getElementById('logout').addEventListener('click', () => {
      logOut()
    })
    const ping = document.getElementById('ping')
    const home = document.getElementById('home')
    const settings = document.getElementById('settings')
    const consoles = document.getElementById('console')
    const homeBtn = document.getElementById('homeBtn')
    const settingsBtn = document.getElementById('settingsBtn')
    const consolesBtn = document.getElementById('consoleBtn')
    const commandInput = document.getElementById('commandInput')
    const consolesRoom = document.getElementById('consoleRoom')
    const accountBtn = document.getElementById('accountBtn')
    const usersBtn = document.getElementById('usersBtn')
    const whatsappBtn = document.getElementById('whatsappBtn')
    const setAccount = document.getElementById('setAccount')
    const setUsers = document.getElementById('setUsers')
    const setWhatsapp = document.getElementById('setWhatsapp')
    const newUsername = document.getElementById('newUsername')
    const newPassword = document.getElementById('newPassword')
    const currentPassword = document.getElementById('currentPassword')
    const saveAccBtn = document.getElementById('saveAccBtn')
    const qrCode = document.getElementById('qr-code')
    const waitingLogs = document.getElementById('waitingLogs')
    const chatsRoom = document.getElementById('chatsPlace')

    const qrcodes = new QRCode(document.getElementById('QrPlace'), {
      text: 'Example',
      width: 275,
      height: 275,
      colorDark: '#122e31',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.L,
      small: true
    })
    const generateQrCode = (text) => {
      qrcodes.clear()
      qrcodes.makeCode(text)
      qrCode.style.display = ''
      waitingLogs.innerHTML = '<h4>Scan This Code</h4>'
    }
    const clearQrCode = () => {
      qrCode.style.display = 'none'
    }

    const showLoading = (state) => {
      waitingLogs.innerHTML = `<h5>${state}%</h5>
      <div style="width: 250px; height: 10px;" class="progress" role="progressbar" aria-label="Basic example" aria-valuenow="${state}" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar animated" style="width: ${state}%"></div>
      </div>
      <h4>Loading Chats..</h4>`
      waitingLogs.style.display = ''
    }
    const hideLoading = () => {
      waitingLogs.style.display = 'none'
    }

    homeBtn.addEventListener('click', () => {
      homeBtn.classList.add('active')
      settingsBtn.classList.remove('active')
      consolesBtn.classList.remove('active')
      settings.style.marginLeft = '-1000px'
      consoles.style.marginLeft = '-1000px'
      settings.style.opacity = '0'
      consoles.style.opacity = '0'
      setTimeout(() => {
        home.style.display = 'block'
        settings.style.display = 'none'
        consoles.style.display = 'none'
        setTimeout(() => {
          home.style.marginLeft = ''
          home.style.opacity = '1'
        }, 50)
      }, 250)
    })
    settingsBtn.addEventListener('click', () => {
      homeBtn.classList.remove('active')
      settingsBtn.classList.add('active')
      consolesBtn.classList.remove('active')
      consoles.style.marginLeft = '-1000px'
      home.style.marginLeft = '-1000px'
      consoles.style.opacity = '0'
      home.style.opacity = '0'
      setTimeout(() => {
        settings.style.display = ''
        consoles.style.display = 'none'
        home.style.display = 'none'
        setTimeout(() => {
          settings.style.opacity = '1'
          settings.style.marginLeft = ''
        }, 50)
      }, 250)
    })
    consolesBtn.addEventListener('click', () => {
      homeBtn.classList.remove('active')
      settingsBtn.classList.remove('active')
      consolesBtn.classList.add('active')
      home.style.marginLeft = '-1000px'
      settings.style.marginLeft = '-1000px'
      home.style.opacity = '0'
      settings.style.opacity = '0'
      setTimeout(() => {
        consoles.style.display = 'flex'
        home.style.display = 'none'
        settings.style.display = 'none'
        setTimeout(() => {
          consoles.style.marginLeft = ''
          consoles.style.opacity = '1'
        }, 50)
      }, 250)
    })
    accountBtn.addEventListener('click', () => {
      accountBtn.classList.add('activated')
      usersBtn.classList.remove('activated')
      whatsappBtn.classList.remove('activated')
      setUsers.style.opacity = '0'
      setWhatsapp.style.opacity = '0'
      setTimeout(() => {
        setAccount.style.display = ''
        setUsers.style.display = 'none'
        setWhatsapp.style.display = 'none'
        setTimeout(() => {
          setAccount.style.opacity = '1'
        }, 50)
      }, 250)
    })
    usersBtn.addEventListener('click', () => {
      accountBtn.classList.remove('activated')
      usersBtn.classList.add('activated')
      whatsappBtn.classList.remove('activated')
      setAccount.style.opacity = '0'
      setWhatsapp.style.opacity = '0'
      setTimeout(() => {
        setUsers.style.display = ''
        setAccount.style.display = 'none'
        setWhatsapp.style.display = 'none'
        setTimeout(() => {
          setUsers.style.opacity = '1'
        }, 50)
      }, 250)
    })
    whatsappBtn.addEventListener('click', () => {
      accountBtn.classList.remove('activated')
      usersBtn.classList.remove('activated')
      whatsappBtn.classList.add('activated')
      setUsers.style.opacity = '0'
      setAccount.style.opacity = '0'
      setTimeout(() => {
        setWhatsapp.style.display = ''
        setUsers.style.display = 'none'
        setAccount.style.display = 'none'
        setTimeout(() => {
          setWhatsapp.style.opacity = '1'
        }, 50)
      }, 250)
    })
    saveAccBtn.addEventListener('click', () => {
      fetch(`${ipUrl}/edit/user/${cred.user.auth}/no`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: currentPassword.value,
          username: newUsername.value,
          password: newPassword.value
        })
      })
        .then(ress => { return ress.json() })
        .then(res => {
          if (res.success) {
            Notipin.Alert({
              msg: `${res.message}`, // Pesan kamu
              yes: 'Ok', // Tulisan di tombol 'Yes'
              onYes: () => { /* Kode di sini */ },
              type: 'INFO',
              mode: 'DARK'
            })
          } else {
            Notipin.Alert({
              msg: `${res.message}`, // Pesan kamu
              yes: 'Ok', // Tulisan di tombol 'Yes'
              onYes: () => { /* Kode di sini */ },
              type: 'NORMAL',
              mode: 'DARK'
            })
          }
        })
        .catch(() => {
          Notipin.Alert({
            msg: 'Server not avabile', // Pesan kamu
            yes: 'Ok', // Tulisan di tombol 'Yes'
            onYes: () => { /* Kode di sini */ },
            type: 'NORMAL',
            mode: 'DARK'
          })
        })
    })
    let cmd = ''
    commandInput.addEventListener('keydown', (events) => {
      if (events.key === 'Enter') {
        if (commandInput.value.length > 0) {
          cmd = commandInput.value
          commandInput.value = ''
          fetch(`${ipUrl}/execute/${cred.user.auth}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              commands: cmd
            })
          })
            .then(ress => { return ress.json() })
            .then(res => {
              if (!res.success) {
                consolesRoom.innerHTML += '<p style="color: red;">Failed execute</p>'
              };
            })
            .catch(() => {
              consolesRoom.innerHTML += '<p style="color: red;">Disconnected</p>'
            })
        };
      };
      if (commandInput.value === '' && events.key === ' ') {
        setTimeout(() => {
          commandInput.value = ''
        }, 100)
      };
    })
    let currentLog = ''
    let currentUserlist = ''
    let userViewValue = ''
    let currentMessage = ''
    let messageViewList = ''
    let commandsValue = ''
    const runHome = () => {
      if (pageState.home) {
        if (typeof (pings) === 'number') {
          if (`${pings}`.length > 3) {
            ping.style.color = 'red'
          } else if (`${pings}`.length > 2) {
            ping.style.color = 'yellow'
          } else if (`${pings}`.length > 1) {
            ping.style.color = 'lightgreen'
          };
          ping.innerText = pings + 'MS'
        } else if (typeof (pings) === 'string') {
          ping.style.color = 'gray'
          ping.innerText = pings
        };
        if (JSON.stringify(logs) !== currentLog) {
          if (logs.length > 0) {
            currentLog = JSON.stringify(logs)
            commandsValue = ''
            for (const rawLog of logs) {
              if (rawLog.includes('[.qr.]')) {
                const qr = `${rawLog}`.replaceAll(/\[\.(.*)\.\]/g, '')
                generateQrCode(qr)
              };
              if (rawLog.includes('[.qrDone.]')) {
                clearQrCode()
              };
              if (rawLog.includes('[.loading.]')) {
                const state = rawLog.split('%')[1]
                showLoading(state)
              };
              if (rawLog.includes('[.loadingDone.]')) {
                hideLoading()
              }
              const log = rawLog.split(/\n/g)
              for (const rtxt of log) {
                const txt = (`${rtxt}`.includes('[.') && `${rtxt}`.includes('.]')) ? rtxt : ('[.white.]' + rtxt)
                const textMatch = txt.match(/\[\.(.*?)\.\](.*)/)
                if (textMatch[2]) {
                  commandsValue += `<p style="margin-bottom: -5px; color: ${textMatch[1]};">${textMatch[2]}</p>`
                };
              }
            }
            consolesRoom.innerHTML = commandsValue
            consolesRoom.scrollTop = consolesRoom.scrollHeight
          } else {
            consolesRoom.innerHTML = '<center><h4 style="margin-top: 10px; color: gray;">No Logs must be View</h4></center>'
          }
        }
        if (JSON.stringify(userlist) !== currentUserlist) {
          if (JSON.stringify(userlist).length > 25) {
            currentUserlist = JSON.stringify(userlist)
            userViewValue = ''
            const usersEmailList = Object.keys(userlist)
            for (const email of usersEmailList) {
              const selectedUser = userlist[email]
              userViewValue += `<div class="userList">
                <div class="title">
                  <h6><span class="username">${selectedUser.username}</span>${(selectedUser.isAdministator) ? '<span class="admin">[Admin]</span>' : ''}${(email === cred.email) ? '<span>(ME)</span>' : ''}</h6>
                  <p><span style="color: ${(selectedUser.permission.sendMessage) ? 'lightgreen' : 'crimson'};">Send Message</span>, <span style="color: ${(selectedUser.permission.manageConnection) ? 'lightgreen' : 'crimson'};">Manage Connection</span>, <span style="color: ${(selectedUser.permission.manageUsers) ? 'lightgreen' : 'crimson'};">Manage Users</span></p>
                  </div>
                  ${(cred.email === email) ? '<button class="btn btn-warning" onClick="document.getElementById(\'accountBtn\').click() "><i class="fa-solid fa-wrench"></i></button>' : ''}
                ${(cred.email !== email && (cred.user.isAdministator || (cred.user.permission.manageUsers && !selectedUser.isAdministator))) ? `<button class="btn btn-success" onClick="editUser('${email}')"><i class="fa-solid fa-wrench"></i></button>` : ''}
                ${(cred.email !== email && (cred.user.isAdministator || (cred.user.permission.manageUsers && !selectedUser.isAdministator))) ? `<button class="btn btn-danger" onClick="deleteUser('${email}')"><i class="fa-solid fa-trash"></i></button>` : ''}
                ${(cred.email !== email && !(cred.user.isAdministator || (cred.user.permission.manageUsers && !selectedUser.isAdministator))) ? '<button class="btn btn-info"><i class="fa-solid fa-question"></i></button>' : ''}
              </div>`
            }
            setUsers.innerHTML = userViewValue
            setUsers.innerHTML += '<button class="btn btn-primary btnAdd" onClick="createUser()"><i class="fa-solid fa-plus"></i></button>'
          } else {
            setUsers.innerHTML = '<center><h4 style="margin-top: 10px; color: gray;">You dont have Permission</h4></center>'
          }
        }
        if (currentPassword.value && ((newUsername.value && newUsername.value.length > 4) || (newPassword.value && newPassword.value.length > 4) || ((newUsername.value && newUsername.value.length > 4) && (newPassword.value && newPassword.value.length > 4)))) {
          saveAccBtn.disabled = false
        } else {
          saveAccBtn.disabled = true
        }
        if (currentMessage !== JSON.stringify(message).length) {
          currentMessage = JSON.stringify(message).length
          const shortMessageList = shortMessage()
          messageViewList = ''
          for (const { key } of shortMessageList) {
            const metaMsg = message[key].metadata
            const lastChat = message[key].chat[(message[key].chat).length - 1]
            const time = new Date(lastChat.timeStamp * 1000)
            messageViewList += `<div class="chatList">
              <img src="${(metaMsg.profile) ? metaMsg.profile : './assets/user.png'}" alt="${metaMsg.name} icon">
              <div class="clTitle">
                <h6>${metaMsg.name}</h6>
                <p><span>[${lastChat.type}]</span> ${(lastChat.notifyName) ? `${(lastChat.fromMe) ? `<span style="color: blue;">${lastChat.notifyName}</span>` : lastChat.notifyName}` : '<span style="color: blue;">BOT</span>'} : ${(lastChat.body).substring(0, 30)}${((lastChat.body).length > 29) ? '...' : ''}</p>
              </div>
              <div class="clSubTitle">
                <p ${(metaMsg.unreadCount === 0) ? 'style="opacity: 0;"' : ''}>${metaMsg.unreadCount}</p>
                <p>${timeParse(time.getHours(), time.getMinutes())}</p>
              </div>
            </div>`
          }
          if (messageViewList) {
            chatsRoom.innerHTML = messageViewList
          };
        }
        document.getElementById('username').innerText = (cred.user?.username) ? cred.user.username : '';
        if (botState) {
          const upTime = `${botState.upTime}`.split(':')
          document.getElementById('session').innerText = botState.session
          document.getElementById('openaiLimit').innerText = botState.openaiLimit + '$'
          document.getElementById('prefix').innerText = botState.prefix 
          document.getElementById('uptime').innerText = upTime[0] + 'H ' + upTime[1] + 'M ' +upTime[2] + 'S '
        };
        setTimeout(() => {
          runHome()
        }, 250)
      };
    }
    runHome()
    getResource()
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

// export
document.deleteUser = deleteUser
document.createUser = createUser
document.editUser = editUser
