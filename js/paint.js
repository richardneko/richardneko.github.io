$(function() {
  var canvas = document.getElementById('paintCanvas');
  var ctx = canvas.getContext("2d");
  
  var isDrawing = false;
  var menuShow = false;
  
  var colors = ['black', 'blue', 'red', 'yellow'];
  var sizes = [5, 10, 20, 40];
  var menuChoose = ['#size', '#color', '#zoom', '#erase'];
  

  var MENU_NONE = menuChoose.length;
  var MENU_SIZE = 0;
  var MENU_COLOR = 1;
  var MENU_ZOOM = 2;
  var MENU_ERASE = 3;
  var currentMenu = MENU_NONE;
  var defaultColor = 0;

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.lineWidth = 15;
  
  initMouseListeners();
  initMenuSettings();
  for (var i = 0; i < colors.length; i ++)
    addColorListeners(i);

/*
  document.getElementById('reset').addEventListener('click', function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, false);
*/
  
  // Menu settings
  function initMenuSettings() {
    // Show or hide menu
    $("#setting").click(function() {
      if (!menuShow) {
        menuShow = true;
        $("#menu").css("visibility", "visible").css("opacity", "1").css("transition-delay", "0s");
        $("#setting").css("background-color", "#444");
      } else {
        menuShow = false;
        $("#menu").css("visibility", "hidden").css("opacity", "0").css("transition", "visibility 0s linear 0.5s,opacity 0.5s linear");
        $("#setting").css("background-color", "black");
	$(menuChoose[currentMenu] + ' ul').css("max-height", "0px");
	currentMenu = MENU_NONE;
      }
    });

    for (var i = 0; i < menuChoose.length; i ++)
      addMenuListener(i);

    for (var i = 0; i < colors.length; i ++)
      addColorListeners(i);
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
    var val = i + 1;
    
    // Default black
    if (defaultColor == 0) {
      ctx.strokeStyle = colors[i];
      $("#color ul li:nth-child(1)").css("background-color", "#444");
      defaultColor = colors.length;
    }
    
    $("#color ul li:nth-child(" + val.toString() + ")").click(function() {
      // Return to default background color
      for (var j = 1; j <= colors.length; j ++) {
        $("#color ul li:nth-child(" + j.toString() + ")").css("background-color", "#313131");
        $("#color ul li:nth-child(odd)").css("background-color", "#363636");
      }

      // Change choosing background color
      ctx.strokeStyle = colors[i]; 
      $("#color ul li:nth-child(" + val.toString() + ")").css("background-color", "#444");
    });
  }

  function addMenuListener(i) {
    $(menuChoose[i]).click(function() {
      switch (currentMenu) {
         case MENU_NONE:
	   currentMenu = i;
	   $(menuChoose[i] + ' ul').css("max-height", "300px");
	   break;
	 case i:
	   break;
	 default:
	   $(menuChoose[currentMenu] + ' ul').css("max-height", "0px");
	   $(menuChoose[i] + ' ul').css("max-height", "300px");
	   currentMenu = i;
	   break;
      }
    });
  }
});















