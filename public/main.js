//setup
const root = document.getElementById('root');

// pages
const pageState = {
  login: false
}

const page = {
  login: ()=>{
    pageState.login = true;
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
          <div class="invalid-feedback">
            Please choose a username.
          </div>
          <center><button style="margin-top: -60px; opacity: 0;" id="loginBtn"loginBtn>Login</button></center>
        </div>
        <p class="copyright">© 2023 SGStudio Project</p>
      </div>
    `
    const username = document.getElementById("floatingInput");
    const password = document.getElementById("floatingPassword");
    const passwordStyle = document.getElementById("pass");
    const loginBtn = document.getElementById("loginBtn")
    const loginRun = ()=>{
      if(pageState.login){ 
        if (`${username.value}`.length > 0){
          passwordStyle.style.marginTop = "";
          passwordStyle.style.opacity = "1";
        }else {
          passwordStyle.style.marginTop = "-60px";
          passwordStyle.style.opacity = "0";
        }
        if (`${username.value}`.length > 0&&`${password.value}`.length > 0){
          loginBtn.style.marginTop = "20px";
          loginBtn.style.opacity = "1";
        }else {
          loginBtn.style.marginTop = "-60px";
          loginBtn.style.opacity = "0";
        }
        setTimeout(() => {
          loginRun();
        }, 250);
      };
    };
    loginRun();
  }
}

window.onload = () => {
  setTimeout(() => {
    page.login();
  }, 1000);
}