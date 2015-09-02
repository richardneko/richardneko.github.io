var canvas;
var ctx;
var isDrawing = false;
var colors = ['black', 'blue', 'red', 'yellow', 'white'];

function init() {
  canvas = document.getElementById('paintCanvas');
  ctx = canvas.getContext('2d');
  
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.lineWidth = 15;
  
  initMouseListeners();
  
  for (var i = 0; i < colors.length; i ++)
    addColorListeners(i);

  document.getElementById('reset').addEventListener('click', function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, false);
}

// Add mouse events
function initMouseListeners() {
  canvas.addEventListener('mousedown', function (evt) {
    var pos = getMousePos(canvas, evt);
    ctx.beginPath();
    ctx.moveTo(pos.x , pos.y);
    evt.preventDefault();
    isDrawing = true;
  });

  canvas.addEventListener('mousemove', function (evt) {
    if (isDrawing) {
      var pos = getMousePos(canvas, evt);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  }, false);

  canvas.addEventListener('mouseup', function (evt) {
    if (isDrawing) {
      var pos = getMousePos(canvas, evt);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      isDrawing = false;
    }
  }, false);
  
  canvas.addEventListener('mouseleave', function (evt) {
    isDrawing = false;
  }, false);
}

function writeMessage(canvas, message) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '18pt Calibri';
  ctx.fillStyle = 'black';
  ctx.fillText(message, 10, 25);
}

// Get Mouse Position(X, Y)
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function addColorListeners(i) {
  document.getElementById(colors[i]).addEventListener('click', function () {
    ctx.strokeStyle = colors[i];
  }, false);
}
