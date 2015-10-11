$(function() {
  var canvas = document.getElementById('paintCanvas');
  var ctx = canvas.getContext("2d");
  var fileloader = document.getElementById('fileUpload');

  var modes = {
    DRAW: 1,
    ERASE: 2,
    PICTURE: 3,
    KEYBOARD: 4,
  };
  currentMode = modes.DRAW;
  var previousMode;

  var isDrawing = false;
  var menuShow = false;
  var menuCounter = false;

  var colors = ['black', 'blue', 'red', 'yellow'];
  var sizes = [5, 10, 20, 40];

  /* add here if need more colors */
  var moreColors = [];
  
  /* add here if need more sizes */
  var moreSizes = [];

  var erases = ['erase', 'reset'];
  var menuChoose = ['#size', '#color', '#zoom', '#erase', '#keyboard', '#pic', '#back', '#off'];
  var MENU_NONE = menuChoose.length;

  var menuMaxHeight = 350;

  // Keep full draw points and informations
  var fullDrawX = new Array();
  var fullDrawY = new Array();
  var fullDrawColor = new Array();
  var fullDrawSize = new Array();

  var openMenu = '#menu';
  var currentMenu = MENU_NONE;
  var currentColor = 0;
  var currentSize = 0;

  var counterId;

  // Image information
  var imageCount = 0;
  var currentChooseImage = -1;
  var anchorSize = 16;
  var isResizeChoose = 0;
  var isPictureChoose = false;
  var img = new Array();
  var imageWidth = new Array();
  var imageHeight = new Array();
  var imagePos = new Array();

  initCanvasSettings();
  initImageLoader();
  initMenuSettings();
  initTouchListeners();
  initMouseListeners();

  function initCanvasSettings() {
    // Make canvas full page
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
  }
  
  function initImageLoader() {
    fileloader.addEventListener('change', function(e) {
      var reader = new FileReader();
      reader.onload = function(evt) {
        img[imageCount] = new Image();
	img[imageCount].onload = function() {
	  imageWidth[imageCount] = img[imageCount].width / 2;
	  imageHeight[imageCount] = img[imageCount].height / 2;
	  ctx.drawImage(img[imageCount], 0, 0, img[imageCount].width, img[imageCount].height, 
	  		imagePos[imageCount].x, imagePos[imageCount].y, imageWidth[imageCount], imageHeight[imageCount]);
	  drawImageAnchorEdge(imageCount);
	  currentChooseImage = imageCount;
	  imageCount ++;
	}
	img[imageCount].src = evt.target.result;
      }
      reader.readAsDataURL(e.target.files[0]);
    }, false);
  }

  function drawAnchor(x, y) {
    ctx.save();
    ctx.fillStyle = 'black';
    ctx.fillRect(x, y, anchorSize, anchorSize);
    ctx.restore();
  }
  
  function drawImageAnchorEdge(imageNum) {
    // top left, top middle, top right
    drawAnchor(imagePos[imageNum].x - anchorSize / 2, imagePos[imageNum].y - anchorSize / 2);
    drawAnchor(imagePos[imageNum].x + imageWidth[imageNum] / 2 - anchorSize / 2, imagePos[imageNum].y - anchorSize / 2);
    drawAnchor(imagePos[imageNum].x + imageWidth[imageNum] - anchorSize / 2, imagePos[imageNum].y - anchorSize / 2);
    // middle left, middle right
    drawAnchor(imagePos[imageNum].x - anchorSize / 2, imagePos[imageNum].y + imageHeight[imageNum] / 2 - anchorSize / 2);
    drawAnchor(imagePos[imageNum].x + imageWidth[imageNum] - anchorSize / 2, imagePos[imageNum].y + imageHeight[imageNum] / 2 - anchorSize / 2);
    // bottom left, bottom middle, bottom right
    drawAnchor(imagePos[imageNum].x - anchorSize / 2, imagePos[imageNum].y + imageHeight[imageNum] - anchorSize / 2);
    drawAnchor(imagePos[imageNum].x + imageWidth[imageNum] / 2 - anchorSize / 2, imagePos[imageNum].y + imageHeight[imageNum] - anchorSize / 2);
    drawAnchor(imagePos[imageNum].x + imageWidth[imageNum] - anchorSize / 2, imagePos[imageNum].y + imageHeight[imageNum] - anchorSize / 2);

    // draw edge
    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(imagePos[imageNum].x, imagePos[imageNum].y);
    ctx.lineTo(imagePos[imageNum].x + imageWidth[imageNum], imagePos[imageNum].y);
    ctx.lineTo(imagePos[imageNum].x + imageWidth[imageNum], imagePos[imageNum].y + imageHeight[imageNum]);
    ctx.lineTo(imagePos[imageNum].x, imagePos[imageNum].y + imageHeight[imageNum]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
  
  function clearImageInfo() {
    imageCount = 0;
    currentChooseImage = -1;
    isResizeChoose = 0;
    isPictureChoose = false;
    img = [];
    imageWidth = [];
    imageHeight = [];
    imagePos = [];
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

    drawExample(_canvas, _ctx, sizes[(sizes.length - 1)], colors[i]);
  }

  // Eraser menu listener
  function initEraseListener() {
    for  (var i = 0; i < erases.length; i ++) {
      addEraseListener(i);
    }
  }

  function appendNewColorAndSize() {
    var colorLen = colors.length;
    var sizeLen = sizes.length;
    
    for (var i = 0; i < moreColors.length; i ++) {
      $("#color ul").append('<li><canvas id=\'color_' + colorLen + '\' class=\'color_canvas\'></canvas></li>');
      colorLen ++;
    }
    colors = colors.concat(moreColors);

    for (var i = 0; i < moreSizes.length; i ++) {
      $("#size ul").append('<li><canvas id=\'size_' + sizeLen + '\' class=\'size_canvas\'></canvas></li>');
      sizeLen ++;
    }
    sizes = sizes.concat(moreSizes);
    sizes.sort(function(a, b) {
      return (a - b);
    })

    if (sizes.length + moreSizes.length > colors.length + moreColors.length)
      menuMaxHeight = menuMaxHeight + 60 * (moreSizes.length);
    else
      menuMaxHeight = menuMaxHeight + 60 * (moreColors.length);
  }

  // Menu settings
  function initMenuSettings() {
    if (moreColors.length > 0 || moreSizes.length > 0) {
      appendNewColorAndSize();
    }
    
    // Show or hide menu
    $("#setting").click(function() {
      if (!menuShow)
        showHideMenu('#menu' ,true);
      else
        showHideMenu(openMenu, false);
    });

    for (var i = 0; i < menuChoose.length; i ++)
      addMenuListener(i);

    initColorListener();
    initSizeListener();
    initEraseListener();
  }
  
  // Menu show, hide
  function showHideMenu(menu, enable) {
    if (enable) {
      menuShow = true;
      $(menu).css({
        "visibility": "visible",
	"opacity": "1",
	"transition-delay": "0s",
	"z-index": "1"
      });
      $("#setting").css("background-color", "#dedede");
    } else {
      menuShow = false;
      $(menu).css({
        "visibility": "hidden",
	"opacity": "0",
	"transition": "visibility 0s linear 0.3s,opacity 0.3s linear",
	"z-index": "0"
      });
      $("#setting").css("background-color", "white");
      menuChoosed(currentMenu, false);
      $(menuChoose[currentMenu] + ' ul').css("max-height", "0px");
      currentMenu = MENU_NONE;
      openMenu = '#menu';
    }
  }

  /* 012 */
  /* 3 4 */
  /* 567 */
  function resizeClicked(x, y) {
    if (currentChooseImage < 0) {
      return 0;
    }

    // 123
    if (y < imagePos[currentChooseImage].y + anchorSize / 2 && 
        y > imagePos[currentChooseImage].y - anchorSize / 2) {
      if (x < imagePos[currentChooseImage].x + anchorSize / 2 && 
          x > imagePos[currentChooseImage].x - anchorSize / 2) {
        console.log('1 clicked');
	return 1;
      } else if (x < imagePos[currentChooseImage].x + imageWidth[currentChooseImage] / 2 + anchorSize / 2 && 
                 x > imagePos[currentChooseImage].x + imageWidth[currentChooseImage] / 2 - anchorSize / 2) {
        console.log('2 clicked');
	return 2;
      } else if (x < imagePos[currentChooseImage].x + imageWidth[currentChooseImage] + anchorSize / 2 &&
                 x > imagePos[currentChooseImage].x + imageWidth[currentChooseImage] - anchorSize / 2) {
        console.log('3 clicked');
	return 3;
      }
    } 
    // 45
    else if (y < imagePos[currentChooseImage].y + imageHeight[currentChooseImage] / 2 + anchorSize / 2 &&
             y > imagePos[currentChooseImage].y + imageHeight[currentChooseImage] / 2 - anchorSize / 2) {
      if (x < imagePos[currentChooseImage].x + anchorSize / 2 &&
          x > imagePos[currentChooseImage].x - anchorSize / 2) {
        console.log('4 clicked');
	return 4;
      } else if (x < imagePos[currentChooseImage].x + imageWidth[currentChooseImage] + anchorSize / 2 &&
                 x > imagePos[currentChooseImage].x + imageWidth[currentChooseImage] - anchorSize / 2) {
        console.log('5 clicked');
	return 5;
      }
    }
    // 678
    else if (y < imagePos[currentChooseImage].y + imageHeight[currentChooseImage] + anchorSize / 2 &&
             y > imagePos[currentChooseImage].y + imageHeight[currentChooseImage] - anchorSize / 2) {
      if (x < imagePos[currentChooseImage].x + anchorSize / 2 &&
          x > imagePos[currentChooseImage].x - anchorSize / 2) {
	console.log('6 clicked');
	return 6;
      } else if (x < imagePos[currentChooseImage].x + imageWidth[currentChooseImage] / 2 + anchorSize / 2 &&
                 x > imagePos[currentChooseImage].x + imageWidth[currentChooseImage] / 2 - anchorSize / 2) {
        console.log('7 clicked');
	return 7;
      } else if (x < imagePos[currentChooseImage].x + imageWidth[currentChooseImage] + anchorSize / 2 &&
                 x > imagePos[currentChooseImage].x + imageWidth[currentChooseImage] - anchorSize / 2) {
        console.log('8 clicked');
	return 8;
      }
    } else
      return 0;
  }

  function pictureClicked(x, y) {
    return false;
  }

  // Add touch events
  function initTouchListeners() {
    canvas.addEventListener('touchstart', function (evt) {
      if (menuShow) {
        showHideMenu(openMenu, false);
	return;
      }
      
      setMenuTimer(true);

      evt.preventDefault();
      switch (currentMode) {
        case modes.DRAW:
        case modes.ERASE:      
          var pos = getTouchPos(canvas, evt);
          drawStart(pos.x, pos.y);
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y);
          isDrawing = true;
	  break;
	default:
	  //console.log('touchdown default!');
      }
    });

    canvas.addEventListener('touchmove', function (evt) {
      if (menuCounter)
        setMenuTimer(false);

      evt.preventDefault();
      switch (currentMode) {
        case modes.DRAW:
        case modes.ERASE:
          if (isDrawing) {
            evt.preventDefault();
            var pos = getTouchPos(canvas, evt);
	    drawContinue(pos.x, pos.y);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
          }
	  break;
	default:
	  //console.log('touchmove default!');
      }
    }, false);

    canvas.addEventListener('touchend', function (evt) {
      if (menuCounter)
        setMenuTimer(false);

      switch (currentMode) {
        case modes.DRAW:
        case modes.ERASE:
          if (isDrawing) {
            var pos = getTouchPos(canvas, evt);
            ctx.lineTo(pos.x, pos.y + 0.5);
	    drawContinue(pos.x, pos.y + 0.5);
            ctx.stroke();
            isDrawing = false;
	  }
	  break;
	default:
	  //console.log('touchend default!');
      }
    }, false);
  }

  // Add mouse events
  function initMouseListeners() {
    canvas.addEventListener('mousedown', function (evt) {
      if (menuShow) {
        showHideMenu(openMenu, false);
	return;
      }
      setMenuTimer(true);
      evt.preventDefault();

      var pos = getMousePos(canvas, evt);
      switch (currentMode) {
        case modes.DRAW:
	case modes.ERASE:
          drawStart(pos.x, pos.y);
          ctx.beginPath();
          ctx.moveTo(pos.x , pos.y);
          evt.preventDefault();
          isDrawing = true;
	  break;
	case modes.PICTURE:
	  var ret;
	  if ((ret = resizeClicked(pos.x, pos.y)) > 0) {
	    isResizeChoose = ret;
	  } else if (pictureClicked(pos.x, pos.y)) {
	    isPictureChoose = true;
	  }
	default:
	  //console.log('mousedown default!');
      }
    });

    canvas.addEventListener('mousemove', function (evt) {
      if (menuCounter)
        setMenuTimer(false);

      var pos = getMousePos(canvas, evt);
      switch (currentMode) {
        case modes.DRAW:
        case modes.ERASE:
          if (isDrawing) {
	    drawContinue(pos.x, pos.y);
	    ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
          }
	  break;
	case modes.PICTURE:
	  if (isResizeChoose > 0) {
	    handleResize(isResizeChoose, pos.x, pos.y);
	  }
	default:
	  //console.log('mousemove default!');
      }
    }, false);

    canvas.addEventListener('mouseup', function (evt) {
      if (menuCounter)
        setMenuTimer(false);

      switch (currentMode) {
        case modes.DRAW:
        case modes.ERASE:
          if (isDrawing) {
            var pos = getMousePos(canvas, evt);
	    drawContinue(pos.x, pos.y + 0.5);
	    ctx.lineTo(pos.x, pos.y + 0.5);
            ctx.stroke();
            isDrawing = false;
          }
	  break;
	case modes.PICTURE:
	  if (isResizeChoose == 0 && isPictureChoose == false)
	    handlePictureInput(evt);
	  else {
	    isResizeChoose = 0;
	    isPictureChoose = false;
	  }
	    
	default:
	  //$('input').click();
	  //console.log('mouseup default!');
      }
    }, false);
  
    canvas.addEventListener('mouseleave', function (evt) {
      switch (currentMode) {
        case modes.DRAW:
        case modes.ERASE:
          isDrawing = false;
	  break;
	case modes.PICTURE:
	  isResizeChoose = 0;
	  isPictureChoose = false;
	default:
	  //console.log('mouseleave default!');
      }
    }, false);
  }

  function redrawAll(needAnchor) {
    clearCanvas();
    ctx.drawImage(img[currentChooseImage], 0, 0, img[currentChooseImage].width, img[currentChooseImage].height, 
      imagePos[currentChooseImage].x, imagePos[currentChooseImage].y, imageWidth[currentChooseImage], imageHeight[currentChooseImage]);
    if (needAnchor)
      drawImageAnchorEdge(currentChooseImage);
  }

  function handleResize(num, x, y) {
    switch (num) {
      case 1:
        imageWidth[currentChooseImage] = imagePos[currentChooseImage].x + imageWidth[currentChooseImage] - x;
	imageHeight[currentChooseImage] = imagePos[currentChooseImage].y + imageHeight[currentChooseImage] - y;
        imagePos[currentChooseImage].x = x;
        imagePos[currentChooseImage].y = y;
	break;
      case 2:
        imageHeight[currentChooseImage] = imagePos[currentChooseImage].y + imageHeight[currentChooseImage] - y;
	imagePos[currentChooseImage].y = y;
	break;
      case 3:
        imageWidth[currentChooseImage] = x - imagePos[currentChooseImage].x;
	imageHeight[currentChooseImage] = imagePos[currentChooseImage].y + imageHeight[currentChooseImage] - y;
	imagePos[currentChooseImage].y = y;
	break;
      case 4:
        imageWidth[currentChooseImage] = imagePos[currentChooseImage].x + imageWidth[currentChooseImage] - x;
	imagePos[currentChooseImage].x = x;
	break;
      case 5:
        imageWidth[currentChooseImage] = x - imagePos[currentChooseImage].x;
	break;
      case 6:
        imageWidth[currentChooseImage] = imagePos[currentChooseImage].x + imageWidth[currentChooseImage] - x;
	imageHeight[currentChooseImage] = y - imagePos[currentChooseImage].y;
	imagePos[currentChooseImage].x = x;
	break;
      case 7:
        imageHeight[currentChooseImage] = y - imagePos[currentChooseImage].y;
	break;
      case 8:
        imageWidth[currentChooseImage] = x - imagePos[currentChooseImage].x;
	imageHeight[currentChooseImage] = y - imagePos[currentChooseImage].y;
	break;
    }
    // limited
    if (imageHeight[currentChooseImage] < 25) imageHeight[currentChooseImage] = 25;
    if (imageWidth[currentChooseImage] < 25) imageWidth[currentChooseImage] = 25
    redrawAll(true);
  }

  function handlePictureInput(evt) {
    imagePos[imageCount] = getMousePos(canvas, evt);
    $('input').click();
  }

  function setMenuTimer(enable) {
    if (enable) {
      menuCounter = true;
      counterId = setTimeout(function() {
        isDrawing = false;
	openMenu = '#menu';
        showHideMenu('#menu' ,true);
      }, 1000);
    } else {
      menuCounter = false;
      clearTimeout(counterId);
    }
  }

  function drawStart(x, y) {
    fullDrawX.push('d');
    fullDrawX.push(x);
    fullDrawY.push('d');
    fullDrawY.push(y);
    if (currentMode == modes.ERASE)
      fullDrawColor.push('white');
    else if (currentMode == modes.Draw)
      fullDrawColor.push(colors[currentColor - 1]);
    fullDrawSize.push(currentSize);
  }

  function drawContinue(x, y) {
    fullDrawX.push(x);
    fullDrawY.push(y);
  }

/* keep it for future use
  function drawCircle(x, y, color) {
    ctx.beginPath();
    ctx.arc(x, y, 50, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();  
  }

  function handleZoom(evt) {
    var len = evt.targetTouches.length;
    var rect = canvas.getBoundingClientRect();
    
    if (len == 2) {
      touch = evt.targetTouches[0];
      drawCircle(touch.pageX - rect.left, touch.pageY - rect.top, "green");
      touch = evt.targetTouches[1];
      drawCircle(touch.pageX - rect.left, touch.pageY - rect.top, "red");
    } else if (len == 1) {
      touch = evt.targetTouches[0];
      drawCircle(touch.pageX - rect.left, touch.pageY - rect.top, "green");
    }
  }
*/

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
    if (currentMode == modes.ERASE) {
      toDefaultColor('#erase', 1);
      currentMode = modes.DRAW;
    } else if (currentMode == modes.PICTURE || currentMode == modes.KEYBOARD) {
      if (previousMode == modes.ERASE) {
        previousMode = modes.DRAW;
	toDefaultColor('#erase', 1);
      }
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
    if (currentMode == modes.DRAW) {
      toDefaultColor('#color', currentColor);
      currentColor = 0;
      currentMode = modes.ERASE;
    } else if (currentMode == modes.PICTURE || currentMode == modes.KEYBOARD) {
      if (previousMode == modes.DRAW) {
        previousMode = modes.ERASE;
	toDefaultColor('#color', currentColor);
      }
    }
    
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
    switch (menuChoose[i]) {
      case '#size':
      case '#keyboard':
        if (isChoose)
          $(menuChoose[i]).css("background-color", "#94d7ed");
        else
          $(menuChoose[i]).css("background-color", "#53bfe2");
        break;
      case '#color':
      case '#off':
        if (isChoose)
          $(menuChoose[i]).css("background-color", "#fbdd97");
        else
          $(menuChoose[i]).css("background-color", "#f8c54d");
        break;
      case '#zoom':
      case '#back':
        if (isChoose)
          $(menuChoose[i]).css("background-color", "#f294b2");
        else
          $(menuChoose[i]).css("background-color", "#ea5080");
        break;
      case '#erase':
      case '#pic':
        if (isChoose)
          $(menuChoose[i]).css("background-color", "#0effbc");
        else
          $(menuChoose[i]).css("background-color", "#00c08b");
        break;
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

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function addEraseListener(i) {
    $("#erase ul li:nth-child(" + (i + 1).toString() + ")").click(function() {
      if (i) {
        clearCanvas();
	clearArray();
	clearImageInfo();
      }
      else
	eraserChoose();
    });
  }

  function addMenuListener(i) {
    $(menuChoose[i]).click(function(e) {
      var target = $(e.target);
      
      // Avoid wrong area be clicked
      if (target.attr('class') != 'white_block' && 
         (target.attr('class') != null && target.attr('class').indexOf('main_menu') != -1)) {

	if (menuChoose[i] == '#zoom') {
	  showHideMenu('#menu', false);
	  openMenu = '#menu2';
	  showHideMenu(openMenu, true);
	  return;
	} else if (menuChoose[i] == '#back') {
          showHideMenu('#menu2', false);
          openMenu = '#menu';
          showHideMenu(openMenu, true);
          return;
	} else if (menuChoose[i] == '#pic') {
	  if (currentMode == modes.PICTURE) {
	    currentMode = previousMode;
	    menuChoosed(i, false);
	  } else if (currentMode == modes.KEYBOARD) {
	    currentMode = modes.PICTURE;
	    menuChoosed(i, true);
	    menuChoosed(4, false);
	    showHideMenu(openMenu, false);
	  } else {
	    previousMode = currentMode;
	    currentMode = modes.PICTURE;
	    menuChoosed(i, true);
	    showHideMenu(openMenu, false);
	  }
	  return;
	} else if (menuChoose[i] == '#keyboard') {
	  if (currentMode == modes.KEYBOARD) {
	    currentMode = previousMode;
	    menuChoosed(i, false);
	  } else if (currentMode == modes.PICTURE) {
	    currentMode = modes.KEYBOARD;
	    menuChoosed(i, true);
	    menuChoosed(5, false);
	    showHideMenu(openMenu, false);
	  } else {
	    previousMode = currentMode;
	    currentMode = modes.KEYBOARD;
	    menuChoosed(i, true);
	    showHideMenu(openMenu, false);
	  }
	  return;
	}

	switch (currentMenu) {
          case MENU_NONE:
	    // show choosed menu
	    currentMenu = i;
	    $(menuChoose[i] + ' ul').css("max-height", menuMaxHeight + "px");
	    menuChoosed(i, true);
	    break;
	  case i:
	    // close choosed menu
	    $(menuChoose[i] + ' ul').css("max-height", "0px");
	    menuChoosed(i, false);
	    currentMenu = MENU_NONE;
	    break;
	  default:
	    // close current menu and show new menu
	    $(menuChoose[currentMenu] + ' ul').css("max-height", "0px");
	    menuChoosed(currentMenu, false);
	    $(menuChoose[i] + ' ul').css("max-height", menuMaxHeight + "px");
	    menuChoosed(i, true);
	    currentMenu = i;
	    break;
        }
      }
    });
  }
});
