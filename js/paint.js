$(function() {
  console.log('init');
  var canvas = document.getElementById('paintCanvas');
  var ctx = canvas.getContext("2d");
  
  var isDrawing = false;
  var isEraserChoose = false;
  var menuShow = false;
  
  var colors = ['black', 'blue', 'red', 'yellow'];
  var sizes = [5, 10, 20, 40];
  var erases = ['erase', 'reset'];
  var menuChoose = ['#size', '#color', '#zoom', '#erase'];
  
  // Keep full draw points and informations
  var fullDrawX = new Array();
  var fullDrawY = new Array();
  var fullDrawColor = new Array();
  var fullDrawSize = new Array();

  var MENU_NONE = menuChoose.length;
  var MENU_SIZE = 0;
  var MENU_COLOR = 1;
  var MENU_ZOOM = 2;
  var MENU_ERASE = 3;
  
  var currentMenu = MENU_NONE;
  var currentColor = 0;
  var currentSize = 0;

  initCanvasSettings();
  initTouchListeners();
  initMouseListeners();
  initMenuSettings();

  function initCanvasSettings() {
    // Make canvas full page
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
  }
  
  // Size menu listener
  function initSizeListener() {
    for (var i = 0; i < sizes.length; i ++) {
      drawSizeExample(i);
      addSizeListener(i);
    }
  }

  function drawSizeExample(i) {
    var _canvas = document.getElementById('size_' + i.toString());
    var _ctx = _canvas.getContext("2d");

    drawExample(_canvas, _ctx, sizes[i], colors[0]);
  }

  function drawExample(ex_canvas, ex_ctx, ex_size, ex_color) {
    ex_canvas.height = 50;
    ex_canvas.width = 50;
    var centerX = ex_canvas.width / 2;
    var centerY = ex_canvas.height / 2;
    ex_ctx.lineWidth = ex_size;
    ex_ctx.strokeStyle = ex_color;
    ex_ctx.lineJoin = 'round';
    ex_ctx.lineCap = 'round';
    ex_ctx.beginPath();
    ex_ctx.moveTo(centerX, centerY);
    ex_ctx.lineTo(centerX, centerY + 0.5);
    ex_ctx.stroke();
  }

  // Color menu listener
  function initColorListener() {
    for (var i = 0; i < colors.length; i ++) {
      drawColorExample(i);
      addColorListeners(i);
    }
  }

  function drawColorExample(i) {
    var _canvas = document.getElementById('color_' + i.toString());
    var _ctx = _canvas.getContext("2d");

    drawExample(_canvas, _ctx, sizes[3], colors[i]);
  }

  // Eraser menu listener
  function initEraseListener() {
    for  (var i = 0; i < erases.length; i ++) {
      addEraseListener(i);
    }
  }

  // Menu settings
  function initMenuSettings() {
    // Show or hide menu
    $("#setting").click(function() {
      if (!menuShow)
        showHideMenu(true);
      else
        showHideMenu(false);
    });

    for (var i = 0; i < menuChoose.length; i ++)
      addMenuListener(i);

    initColorListener();
    initSizeListener();
    initEraseListener();
  }
  
  // Menu show, hide
  function showHideMenu(enable) {
    if (enable) {
      menuShow = true;
      $("#menu").css({
        "visibility": "visible",
	"opacity": "1",
	"transition-delay": "0s"
      });
      $("#setting").css("background-color", "#444");
    } else {
      menuShow = false;
      $("#menu").css({
        "visibility": "hidden",
	"opacity": "0",
	"transition": "visibility 0s linear 0.3s,opacity 0.3s linear"
      });
      $("#setting").css("background-color", "black");
      $(menuChoose[currentMenu] + ' ul').css("max-height", "0px");
      menuChoosed(currentMenu, false);
      currentMenu = MENU_NONE;
    }
  }

  // Add touch events
  function initTouchListeners() {
    canvas.addEventListener('touchstart', function (evt) {
      if (menuShow)
        showHideMenu(false);
      
      evt.preventDefault();
      var pos = getTouchPos(canvas, evt);
      drawStart(pos.x, pos.y);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      isDrawing = true;
    });

    canvas.addEventListener('touchmove', function (evt) {
      if (isDrawing) {
        evt.preventDefault();
        var pos = getTouchPos(canvas, evt);
	drawContinue(pos.x, pos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    }, false);

    canvas.addEventListener('touchend', function (evt) {
      if (isDrawing) {
        var pos = getTouchPos(canvas, evt);
        ctx.lineTo(pos.x, pos.y + 0.5);
	drawContinue(pos.x, pos.y + 0.5);
        ctx.stroke();
        isDrawing = false;
      }
    }, false);
  }

  // Add mouse events
  function initMouseListeners() {
    canvas.addEventListener('mousedown', function (evt) {
      if (menuShow)
        showHideMenu(false);
    
      var pos = getMousePos(canvas, evt);
      drawStart(pos.x, pos.y);
      ctx.beginPath();
      ctx.moveTo(pos.x , pos.y);
      evt.preventDefault();
      isDrawing = true;
    });

    canvas.addEventListener('mousemove', function (evt) {
      if (isDrawing) {
	var pos = getMousePos(canvas, evt);
	drawContinue(pos.x, pos.y);
	ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    }, false);

    canvas.addEventListener('mouseup', function (evt) {
      if (isDrawing) {
        var pos = getMousePos(canvas, evt);
	drawContinue(pos.x, pos.y + 0.5);
	ctx.lineTo(pos.x, pos.y + 0.5);
        ctx.stroke();
        isDrawing = false;
      }
    }, false);
  
    canvas.addEventListener('mouseleave', function (evt) {
      isDrawing = false;
    }, false);
  }

  function drawStart(x, y) {
    fullDrawX.push('d');
    fullDrawX.push(x);
    fullDrawY.push('d');
    fullDrawY.push(y);
    if (isEraserChoose)
      fullDrawColor.push('white');
    else
      fullDrawColor.push(colors[currentColor - 1]);
    fullDrawSize.push(currentSize);
  }

  function drawContinue(x, y) {
    fullDrawX.push(x);
    fullDrawY.push(y);
  }

  // Redraw full images
  function redraw() {
    var chooseLen = -1;
    
    for (var i = 0; i < fullDrawX.length; i ++) {
      if (fullDrawX[i] == 'd') {
	chooseLen = chooseLen + 1;
	ctx.lineWidth = sizes[fullDrawSize[chooseLen] - 1];
	ctx.strokeStyle = fullDrawColor[chooseLen];
	ctx.beginPath();
	ctx.moveTo(fullDrawX[i + 1], fullDrawY[i + 1]);
	i = i + 1;
      } else {
        ctx.lineTo(fullDrawX[i], fullDrawY[i]);
	ctx.stroke();
      }
    }
  }

  function clearArray() {
    fullDrawX = [];
    fullDrawY = [];
    fullDrawColor = [];
    fullDrawSize = [];
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

  // Get Touch Position(X, Y)
  function getTouchPos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    var touch = evt.targetTouches[0];
    return {
      x: touch.pageX - rect.left,
      y: touch.pageY - rect.top
    };
  }

  function colorChoose(i) {
    // May be eraser choose
    if (isEraserChoose) {
      toDefaultColor('#erase', 1);
      isEraserChoose = false;
    }
    
    ctx.strokeStyle = colors[i];
    $("#color ul li:nth-child( " + (i + 1).toString() + ")").css("background-color", "#fbdd97");
    currentColor = (i + 1);
  }

  function sizeChoose(i) {
    ctx.lineWidth = sizes[i];
    $("#size ul li:nth-child( " + (i + 1).toString() + ")").css("background-color", "#94d7ed");
    currentSize = (i + 1);
  }

  function eraserChoose() {
    if (currentColor) {
      toDefaultColor('#color', currentColor);
      currentColor = 0;
    }

    isEraserChoose = true;
    ctx.strokeStyle = 'white';
    $("#erase ul li:nth-child(1)").css("background-color", "#0effbc");
  }
  
  function toDefaultColor(id, i) {
    switch (id) {
      case '#size':
        $(id + " ul li:nth-child(" + i.toString() + ")").css("background-color", "#53bfe2");
	break;
      case '#erase':
        $(id + " ul li:nth-child(" + i.toString() + ")").css("background-color", "#00c08b");
	break;
      case '#color':
        $(id + " ul li:nth-child(" + i.toString() + ")").css("background-color", "#f8c54d");
	break;
      case '#zoom':
        $(id + " ul li:nth-child(" + i.toString() + ")").css("background-color", "#ea5080");
	break;
      default:
        // can't be here.
        break;
    }
  }

  function menuChoosed(i, isChoose) {
    if (isChoose) {
      switch (i) {
        case MENU_SIZE:
	  $(menuChoose[i]).css("background-color", "#94d7ed");
	  break;
	case MENU_COLOR:
	  $(menuChoose[i]).css("background-color", "#fbdd97");
	  break;
	case MENU_ZOOM:
          $(menuChoose[i]).css("background-color", "#f294b2");
          break;
        case MENU_ERASE:
          $(menuChoose[i]).css("background-color", "#0effbc");
          break;
      }
    } else {
      switch (i) {
        case MENU_SIZE:
          $(menuChoose[i]).css("background-color", "#53bfe2");
          break;
        case MENU_COLOR:
          $(menuChoose[i]).css("background-color", "#f8c54d");
          break;
        case MENU_ZOOM:
          $(menuChoose[i]).css("background-color", "#ea5080");
          break;
        case MENU_ERASE:
          $(menuChoose[i]).css("background-color", "#00c08b");
          break;
      }

    }
  }

  function addColorListeners(i) {
    // Default black
    if (currentColor == 0)
      colorChoose(i);
    
    $("#color ul li:nth-child(" + (i + 1).toString() + ")").click(function() {
      // Return to default background color
      if ((i + 1) != currentColor)
        toDefaultColor('#color', currentColor);

      // Change choosing background color
      colorChoose(i);
    });
  }

  function addSizeListener(i) {
    // Default size 5px
    if (currentSize == 0)
      sizeChoose(i);

    $("#size ul li:nth-child(" + (i + 1).toString() + ")").click(function() {
      // Return to default background color
      if ((i + 1) != currentSize)
        toDefaultColor('#size', currentSize);

      // Change choosing size
      sizeChoose(i);
    });
  }

  function addEraseListener(i) {
    $("#erase ul li:nth-child(" + (i + 1).toString() + ")").click(function() {
      if (i) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	clearArray();
      }
      else
	eraserChoose();
    });
  }

  function addMenuListener(i) {
    $(menuChoose[i]).click(function(e) {
      var target = $(e.target);
      
      // Avoid wrong area be clicked
      if (target.attr('class') != 'white_block' && (target.attr('class') != null && target.attr('class').indexOf('main_menu') != -1)) {
        switch (currentMenu) {
          case MENU_NONE:
	    currentMenu = i;
	    $(menuChoose[i] + ' ul').css("max-height", "350px");
	    menuChoosed(i, true);
	    break;
	  case i:
	    $(menuChoose[i] + ' ul').css("max-height", "0px");
	    menuChoosed(i, false);
	    currentMenu = MENU_NONE;
	    break;
	  default:
	    $(menuChoose[currentMenu] + ' ul').css("max-height", "0px");
	    menuChoosed(currentMenu, false);
	    $(menuChoose[i] + ' ul').css("max-height", "350px");
	    menuChoosed(i, true);
	    currentMenu = i;
	    break;
        }
      }
    });
  }
});
