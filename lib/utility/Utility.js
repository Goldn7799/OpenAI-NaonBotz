const similarity = require("similarity");

function matchItem(A, B, dificult){
  if(similarity(A, B) >= dificult){
    return true;
  }else {
    return false;
  }
}

function drawProgressBar(progress) {
  const barWidth = 20;
  const percent = Math.round(progress);
  const completeWidth = Math.round((barWidth * progress) / 100);
  const incompleteWidth = barWidth - completeWidth;

  process.stdout.write(`Loading [${'='.repeat(completeWidth)}${' '.repeat(incompleteWidth)}] ${percent}%`);

  // kembali ke awal baris
  process.stdout.write('\r');
}

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
  }
  return result;
}

module.exports = {
  drawProgressBar,
  makeid,
  matchItem
}