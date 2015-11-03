$(function() {
  // move array element to the top
  Array.prototype.moveTop = function(idx) {
    if (idx == 0 || idx == this.length)
      return;

    this.splice(0, 0, this.splice(idx, 1)[0]);
  };

  // move array element to the back
  Array.prototype.moveBack = function(idx) {
    if (idx >= this.length - 1)
      return;
    var tmp = this[idx];
    this.splice(idx, 1);
    this.push(tmp);
  };

  var canvas = document.getElementById('paintCanvas');
  var ctx = canvas.getContext("2d");
  var fileloader = document.getElementById('fileUpload');
  var textInput = document.getElementById('textBox');

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
  var isImageOnload = false;
  var isTexting = false;

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
  var MAX_IMAGE_NUM = 5;
  var newImagePos = -1;
  var imageCount = 0;
  var currentChooseImage = -1;
  var anchorSize = 16;
  var isResizeChoose = 0;
  var isPictureChoose = false;
  var moveStartPos;
  var img = new Array();
  var imageWidth = new Array();
  var imageHeight = new Array();
  var imagePos = new Array();
  var imagePriority = new Array();
 
  var deleteButtonSize = 50;
  var deleteButtonGap = 20;

  var needOpenUpload = true;

  // Text area information
  var TEXT_DEFAULT_LEN = 10;
  var textareaMaxRows = 0;
  var textareaMaxCols = 0;
  var textareaColSize = new Array();
  
  // Text information
  var currentText = 0;
  var maxText = 0;
  var textMessage = new Array();
  var textPos = new Array();
  var textSize = new Array();
  var textColor = new Array();

  // Keyboard Layout
  var kbItemsLower = [];
  kbItemsLower[0] = [ '`','1','2','3','4','5','6','7','8','9','0','-','=','Delete' ];
  kbItemsLower[1] = [ 'Tab','q','w','e','r','t','y','u','i','o','p','[',']','\\' ];
  kbItemsLower[2] = [ 'Caps','a','s','d','f','g','h','j','k','l', ';','\'','Enter' ];
  kbItemsLower[3] = [ 'Shift','z','x','c','v','b','n','m',',','.','/','Done' ];
  kbItemsLower[4] = [ 'Space'];
  
  var kbItemsUpper = [];
  kbItemsUpper[0] = [ '~','!','@','#','$','%','^','&','*','(',')','_','+','Delete' ];
  kbItemsUpper[1] = [ 'Tab','Q','W','E','R','T','Y','U','I','O','P','{','}','|' ];
  kbItemsUpper[2] = [ 'Caps','A','S','D','F','G','H','J','K','L', ':','\"','Enter' ];
  kbItemsUpper[3] = [ 'Shift','Z','X','C','V','B','N','M','<','>','?','Done' ];
  kbItemsUpper[4] = [ 'Space'];
  
  var kbItems = kbItemsLower;
  var keylayout = 0;
  var keyboardGap = 10;
  var keyDefaultSize = 50;
  var keyLongSize = 100;
  var keyShiftSize = 140;
  var keyReservedSize = 130;
  var keyEnterSize = 110;
  var keySpaceSize = 880;
  var keyboardMaxWidth = 900;
  var keyboardMaxHeight = 310;
  var keyboardPos;
  var keyboardMove = false;
  var keyboardMoveStartPos;
  var keyboardKeyPosX = new Array();
  var keyboardKeyPosY = new Array();
  var keyboardWidth = new Array();

  initCanvasSettings();
  initImageLoader();
  initMenuSettings();
  initTouchListeners();
  initMouseListeners();
  initCanvasKeyboard();

  function initCanvasSettings() {
    // Make canvas full page
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
  }
  
  function initImageLoader() {
    initImgArray();
    fileloader.addEventListener('change', function(e) {
      var reader = new FileReader();
      reader.onload = function(evt) {
        img[newImagePos] = new Image();
	img[newImagePos].onload = function() {
	  imageWidth[newImagePos] = img[newImagePos].width / 2;
	  imageHeight[newImagePos] = img[newImagePos].height / 2;
	  ctx.drawImage(img[newImagePos], 0, 0, img[newImagePos].width, img[newImagePos].height, 
	  		imagePos[newImagePos].x, imagePos[newImagePos].y, imageWidth[newImagePos], imageHeight[newImagePos]);
	  currentChooseImage = newImagePos;
	  //imageCount ++;
	  isImageOnload = true;
	  redrawAll();
	}
	img[newImagePos].src = evt.target.result;
      }
      reader.readAsDataURL(e.target.files[0]);
    }, false);
  }

  // init canvas keyboard
  function initCanvasKeyboard() {
    var pos;
    var rect;
    
    // append html for canvas keyboard
    $('body').append('<canvas id="kcanvas" draggable="true"></canvas>');
    
    // css for keyboard
    $('#kcanvas').css({
      'border': 'black 1px solid',
      'top': '0px',
      'left': '0px',
      'visibility': "hidden",
      'background-color': 'white'
    });

    canvas_k = document.getElementById('kcanvas');
    ctx_k = canvas_k.getContext("2d");
    canvas_k.height = 330;
    canvas_k.width = 920;
    drawCanvasKeyboardButtons(pos, ctx_k);
    initCanvasKeyboardListeners();
  }

  function showCanvasKeyboard(enable) {
    if (enable) {
      $('#kcanvas').css({
        "visibility": "visible",
        "opacity": "1",
        "transition-delay": "0s",
        "z-index": "3"
      });
    } else {
      $('#kcanvas').css({
        "visibility": "hidden",
        "opacity": "0",
        "transition": "visibility 0s linear 0.3s,opacity 0.3s linear",
        "z-index": "0" 
      });
    }
  }

  // get canvas keyboard position
  function getCanvasKeyboardPos() {
    var rect = canvas_k.getBoundingClientRect();
    return {
      x: rect.left,
      y: rect.top
    };
  }

  function drawCanvasKeyboardButtons(pos, context) {
    var defPosX = keyboardGap + 10;
    var defPosY = keyboardGap + 10;
    var curPosX = defPosX;
    var curPosY = defPosY;

    for (var i = 0; i < kbItems.length; ++ i) {
      if (i > 0) {
        curPosX = defPosX;
        curPosY = curPosY + keyDefaultSize + keyboardGap;
      }
      keyboardKeyPosX[i] = new Array();
      keyboardKeyPosY[i] = new Array();
      keyboardWidth[i] = new Array();
      for (var j = 0; j < kbItems[i].length; ++ j) {
        keyboardKeyPosX[i][j] = curPosX;
        keyboardKeyPosY[i][j] = curPosY;
        keyboardWidth[i][j] = chooseKeySize(kbItems[i][j]);
        drawCanvasKeyboardKey(i, j, context);
        curPosX = curPosX + keyboardWidth[i][j] + keyboardGap;
      }
    }
  }

  function drawCanvasKeyboardKey(i, j, context) {
    // draw key edge
    context.save();
    context.rect(keyboardKeyPosX[i][j], keyboardKeyPosY[i][j], keyboardWidth[i][j], keyDefaultSize);
    context.lineWidth = 2;
    context.strokeStyle = 'black';
    context.stroke();
    context.restore();
    // draw key char
    context.save();
    context.font = '20px Arial';
    context.fillStyle = 'black';
    context.textBaseline="hanging";
    var lineWidth = context.measureText(kbItems[i][j]).width;
    var lineHeight = context.measureText('M').width * 1.2;
    context.fillText(kbItems[i][j], keyboardKeyPosX[i][j] + keyboardWidth[i][j] / 2 - lineWidth / 2,
                                keyboardKeyPosY[i][j] + keyDefaultSize / 2 - lineHeight / 2);
    context.restore();
  }

  function initCanvasKeyboardListeners() {
    canvas_k.addEventListener('mousedown', function (evt) {
      if (currentMode == modes.KEYBOARD && isTexting) {
        var p = getMousePos(canvas_k, evt);
        
	evt.preventDefault();
	if (!keyboardKeyClicked(p)) {
          keyboardOffset = getKeyboardOffset(evt);
          keyboardMove = true;
        } else {
          updateText();
        }
      }
    });
    
    canvas_k.addEventListener('mousemove', function (evt) {
      if (keyboardMove) {
        handleCanvasKeyboardMove(evt);
      }
    }, false);

    canvas_k.addEventListener('mouseleave', function (evt) {
      if (keyboardMove) {
        handleCanvasKeyboardMove(evt);
      }
    }, false);
    
    canvas_k.addEventListener('mouseup', function (evt) {
      if (keyboardMove) {
        keyboardMove = false;
      }
    }, false);
  }

  function showTextBox(enable) {
    if (enable) {
      $("#textBox").css({
        "visibility": "visible",
        "top": textPos[currentText].y,
        "left": textPos[currentText].x,
	"z-index": "3"
      });
      $("#textBox").focus();
    } else {
      $("#textBox").css("visibility", "hidden").css("z-index", "0");
    }
  }

  function clearTextInfo() {
    currentText = 0;
    maxText = 0;
    textMessage = [];
    textPos = [];
    textSize = [];
    textColor = [];
    isTexting = false;
  }

  function initImgArray() {
    for (var i = 0; i < MAX_IMAGE_NUM; ++ i)
      img[i] = -1;
  }

  function drawAnchor(x, y) {
    ctx.save();
    ctx.fillStyle = 'black';
    ctx.fillRect(x, y, anchorSize, anchorSize);
    ctx.restore();
  }
  
  function drawImageEdge(imageNum) {
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

    // draw image edge
    drawImageEdge(imageNum);
  }

  function findButtonPosition(imageNum, type) {
    var bottomX;
    var bottomY;
    if (currentMode == modes.PICTURE) {
      // delete
      if (type ==  0) {
        bottomX = imagePos[imageNum].x + imageWidth[imageNum] / 2 + deleteButtonSize / 2;
      // enter
      } else {
        bottomX = imagePos[imageNum].x + imageWidth[imageNum] / 2 - deleteButtonSize * 3 / 2;
      }
      if (imagePos[imageNum].y < canvas.height / 2)
        bottomY = imagePos[imageNum].y + imageHeight[imageNum] + deleteButtonGap;
      else
        bottomY = imagePos[imageNum].y - deleteButtonSize - deleteButtonGap;
    } else if (currentMode == modes.KEYBOARD) {
      // delete
      /*
      if (type ==  0) {
        bottomX = textPos[imageNum].x + deleteButtonSize * 3 / 2;
      */
      // enter
      //} else {
        bottomX = textPos[imageNum].x;
      //}
      if (textPos[imageNum].y < canvas.height / 2) {
        var lineHeight = ctx.measureText("M").width * 1.2 * (textareaMaxRows + 1);
        bottomY = textPos[imageNum].y + lineHeight + deleteButtonGap;
      }
      else
        bottomY = textPos[imageNum].y - deleteButtonSize * 3 / 2 - deleteButtonGap;
    }

    return {
      x: bottomX,
      y: bottomY
    };
  }

  function drawImageDeleteButton(imageNum) {
    var buttonPos = findButtonPosition(imageNum, 0);
    ctx.save();
    ctx.beginPath();
    // draw button
    ctx.fillStyle = '#ff3232';
    ctx.rect(buttonPos.x, buttonPos.y, deleteButtonSize, deleteButtonSize);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'black';
    ctx.stroke();
    // draw 'X'
    ctx.moveTo(buttonPos.x + 10, buttonPos.y + 10);
    ctx.lineTo(buttonPos.x + deleteButtonSize - 10, buttonPos.y + deleteButtonSize - 10);
    ctx.moveTo(buttonPos.x + deleteButtonSize - 10, buttonPos.y + 10);
    ctx.lineTo(buttonPos.x + 10, buttonPos.y + deleteButtonSize - 10);
    ctx.stroke();
    buttonPos = findButtonPosition(imageNum, 1);
    ctx.beginPath();
    // draw button
    ctx.fillStyle = '#32ff32';
    ctx.rect(buttonPos.x, buttonPos.y, deleteButtonSize, deleteButtonSize);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'black';
    ctx.stroke();
    // draw 'V'
    ctx.moveTo(buttonPos.x + 10, buttonPos.y + 10);
    ctx.lineTo(buttonPos.x + deleteButtonSize / 2, buttonPos.y + deleteButtonSize - 10);
    ctx.lineTo(buttonPos.x + deleteButtonSize - 10, buttonPos.y + 10);
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
    imagePriority = [];
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

  function setMode(mode) {
    switch(currentMode) {
      case modes.PICTURE:
        if ((mode != modes.PICTURE) && currentChooseImage != -1)
	  // if image is choosed
	  handlePictureEnter(currentChooseImage);
	break;
      case modes.KEYBOARD:
        if ((mode != modes.KEYBOARD) && isTexting)
          handlePictureEnter(currentText);
        break;
    }
    currentMode = mode;
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
	"z-index": "2"
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
	return 1;
      } else if (x < imagePos[currentChooseImage].x + imageWidth[currentChooseImage] / 2 + anchorSize / 2 && 
                 x > imagePos[currentChooseImage].x + imageWidth[currentChooseImage] / 2 - anchorSize / 2) {
	return 2;
      } else if (x < imagePos[currentChooseImage].x + imageWidth[currentChooseImage] + anchorSize / 2 &&
                 x > imagePos[currentChooseImage].x + imageWidth[currentChooseImage] - anchorSize / 2) {
	return 3;
      }
    } 
    // 45
    else if (y < imagePos[currentChooseImage].y + imageHeight[currentChooseImage] / 2 + anchorSize / 2 &&
             y > imagePos[currentChooseImage].y + imageHeight[currentChooseImage] / 2 - anchorSize / 2) {
      if (x < imagePos[currentChooseImage].x + anchorSize / 2 &&
          x > imagePos[currentChooseImage].x - anchorSize / 2) {
	return 4;
      } else if (x < imagePos[currentChooseImage].x + imageWidth[currentChooseImage] + anchorSize / 2 &&
                 x > imagePos[currentChooseImage].x + imageWidth[currentChooseImage] - anchorSize / 2) {
	return 5;
      }
    }
    // 678
    else if (y < imagePos[currentChooseImage].y + imageHeight[currentChooseImage] + anchorSize / 2 &&
             y > imagePos[currentChooseImage].y + imageHeight[currentChooseImage] - anchorSize / 2) {
      if (x < imagePos[currentChooseImage].x + anchorSize / 2 &&
          x > imagePos[currentChooseImage].x - anchorSize / 2) {
	return 6;
      } else if (x < imagePos[currentChooseImage].x + imageWidth[currentChooseImage] / 2 + anchorSize / 2 &&
                 x > imagePos[currentChooseImage].x + imageWidth[currentChooseImage] / 2 - anchorSize / 2) {
	return 7;
      } else if (x < imagePos[currentChooseImage].x + imageWidth[currentChooseImage] + anchorSize / 2 &&
                 x > imagePos[currentChooseImage].x + imageWidth[currentChooseImage] - anchorSize / 2) {
	return 8;
      }
    } else
      return 0;
  }

  function unchooseImage() {
    currentChooseImage = -1;
    redrawAll();
  }

  function checkPictureClicked(num, x, y) {
    if ((x > imagePos[num].x && x < imagePos[num].x + imageWidth[num]) &&
         (y > imagePos[num].y && y < imagePos[num].y + imageHeight[num])) {
      return true;	 
    }
    return false;
  }

  function pictureClicked(x, y) {
    if (currentChooseImage != -1 && checkPictureClicked(currentChooseImage, x, y)) {
      return currentChooseImage;
    }
    // check other image choosed
    for (var i = (imagePriority.length - 1); i >= 0; -- i) {
      if (imagePriority[i] == currentChooseImage)
        continue;
      
      if (img[imagePriority[i]] != -1 && checkPictureClicked(imagePriority[i], x, y)) {
        return imagePriority[i];
      }
    }
    return -1
  }

  function deleteButtonClicked(imageNum, mousePos) {
    var buttonPos = findButtonPosition(imageNum, 0);

    if ((mousePos.x > buttonPos.x && mousePos.x < buttonPos.x + deleteButtonSize) &&
         mousePos.y > buttonPos.y && mousePos.y <buttonPos.y + deleteButtonSize)
	 return true;
    return false;
  }

  function enterButtonClicked(imageNum, mousePos) {
    var buttonPos = findButtonPosition(imageNum, 1);

    if ((mousePos.x > buttonPos.x && mousePos.x < buttonPos.x + deleteButtonSize) &&
         mousePos.y > buttonPos.y && mousePos.y <buttonPos.y + deleteButtonSize)
         return true;
    return false;
  }

  function checkButtonClicked(p) {
    if (currentChooseImage != -1 && deleteButtonClicked(currentChooseImage, p)) {
      handlePictureDelete(currentChooseImage);
      return true;
    } else if (currentChooseImage != -1 && enterButtonClicked(currentChooseImage, p)) {
      handlePictureEnter(currentChooseImage);
      return true;
    }
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
	if (currentMode == modes.PICTURE)
	  needOpenUpload = false;
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
	  // check ok/delete button click
	  if (checkButtonClicked(pos)) {
	    needOpenUpload = false;
	    return;
	  }

	  // only do move, resize on newly add image
	  if (isImageOnload) {
	    isResizeChoose = resizeClicked(pos.x, pos.y);
	    if (isResizeChoose == 0 && checkPictureClicked(currentChooseImage, pos.x, pos.y)) {
	      moveStartPos = pos;
	      isPictureChoose = true;
	    }
	  } else {
	    var ret;
	    if (currentChooseImage == -1) {
	      ret = pictureClicked(pos.x, pos.y);
	      if (ret != -1) {
	        currentChooseImage = ret;
		redrawAll();
		needOpenUpload = false;
	      }
	    } else {
	      needOpenUpload = false;
	    }
	  }
	  break;
	case modes.KEYBOARD:
	  if (!isTexting) {
	    isTexting = true;
	    // textarea init
	    textAreaInit();
	    // init for new input
	    textInputInit(pos);
	    // show text area box
	    showTextBox(true);
            // show on screen keyboard
            keyboardInit(pos);
	    showCanvasKeyboard(true);
	  } else {
	    changeTextPos(pos);
	  }
	  break;
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
	  // only do move, resize on newly add image
	  if (isResizeChoose > 0) {
	    handleResize(isResizeChoose, pos.x, pos.y);
	  } else if (isPictureChoose) {
	    handleImageMove(pos.x, pos.y);
	  }
	case modes.KEYBOARD:
	  if (keyboardMove) {
	    handleCanvasKeyboardMove(evt);
	  }
	  break;
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
	    drawUp();
	    ctx.lineTo(pos.x, pos.y + 0.5);
            ctx.stroke();
            isDrawing = false;
          }
	  break;
	case modes.PICTURE:
	  if (isResizeChoose == 0 && isPictureChoose == false) {
	    if (!isImageOnload && imageCount < MAX_IMAGE_NUM)
	      handlePictureInput(evt);
	  }
	  else {
	    isResizeChoose = 0;
	    isPictureChoose = false;
	  }
	  break;
	case modes.KEYBOARD:
	  if (keyboardMove) {
	    keyboardMove = false;
	  }
	  break;
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
	  break;
      }
    }, false);
  }

  function dragCanvasKeyboard(evt) {
    var offset = evt.dataTransfer.getData("Text").split(',');
    canvas_k.style.left = (evt.clientX + parseInt(offset[0], 10)) + 'px';
    canvas_k.style.top = (evt.clientY + parseInt(offset[1], 10)) + 'px';
  }

  function keyboardInit(pos) {
    keyboardPos = getKeyboardPos(pos);
    $('#kcanvas').css({
      'left': keyboardPos.x,
      'top': keyboardPos.y,
    });
    kbItems = kbItemsLower;
  }

  function getKeyboardPos(p) {
    var keyY;
    if (p.y > canvas.height / 2)
      keyY = 0;
    else
      keyY = canvas.height / 2;

    return {
      x: canvas.width / 2 - keyboardMaxWidth / 2,
      y: keyY,
    };
  }

  function keyboardKeyClicked(p) {
    var ret = false;
    for (var i = 0; i < kbItems.length; ++ i) {
      for (var j = 0; j < kbItems[i].length; ++ j) {
        if (checkKeyClicked(p, i, j)) {
	  switch (kbItems[i][j]) {
	    case 'Enter':
	      replaceTextarea('\n');
	      break;
	    case 'Space':
	      replaceTextarea(' ');
	      break;
	    case 'Tab':
	      replaceTextarea('\t');
	      break;
	    case 'Delete':
	      handleTextareaDelete();
	      break;
	    case 'Caps':
	    case 'Shift':
	      handleKeyLayout();
	      break;
	    case 'Done':
	      handlePictureEnter(currentText);
	      break;
	    default:
	      replaceTextarea(kbItems[i][j]);
	      break;
	  }
	  ret = true;
	  break;
	}
      }
    }
    return ret;
  }

  function handleKeyLayout() {
    if (keylayout == 0) {
      keylayout = 1;
      kbItems = kbItemsUpper;
    } else {
      keylayout = 0;
      kbItems = kbItemsLower;
    }

    redrawCanvasKeyboard();
  }

  function redrawCanvasKeyboard() {
    ctx_k.clearRect(0, 0, canvas_k.width, canvas_k.height);
    drawCanvasKeyboardButtons(keyboardPos, ctx_k);
  }

  function changeTextPos(p) {
    textPos[currentText] = p;
    showTextBox(true);
  }

  function updateText() {
    textMessage[currentText] = $("#textBox").val();
  }

  function replaceTextarea(c) {
    var oldTxt = $("#textBox").val();

    // we may replaced '\t' to 8 spaces
    if (c == '\t')
      $("#textBox").val(oldTxt + '        ');
    else
      $("#textBox").val(oldTxt + c);
    updateTextarea(c);
  }

  function handleTextareaDelete() {
    var oldTxt = $("#textBox").val();
    var newTxt;

    newTxt = oldTxt.slice(0, -1);
    $("#textBox").val(newTxt);
    if (newTxt.length == 0) {
      textareaMaxRows = 1;
      textareaMaxCols = 0;
      textareaColSize[textareaMaxRows - 1] = 0;
      $("#textBox").val('');
      $("#textBox").attr('cols', TEXT_DEFAULT_LEN);
      $("#textBox").attr('rows', textareaMaxRows);
      return;
    }

    $("#textBox").val(newTxt);

    if (oldTxt[oldTxt.length - 1] == '\n') {
      textareaMaxRows --;
    } else if (oldTxt[oldTxt.length - 1] == '\t') {
      textareaColSize[textareaMaxRows - 1] -= 8;
    } else {
      textareaColSize[textareaMaxRows - 1] --;
    }
    $("#textBox").attr('cols', textareaColSize[textareaMaxRows - 1] >= textareaMaxCols ? textareaColSize[textareaMaxRows - 1] + 1 : textareaMaxCols + 1);
    $("#textBox").attr('rows', textareaMaxRows);
  }

  function updateTextarea(c) {
    if (c == '\n') {
      textareaMaxRows ++;
      textareaColSize[textareaMaxRows - 1] = 0;
    } else if (c == '\t')
      textareaColSize[textareaMaxRows - 1] += 8;
    else
      textareaColSize[textareaMaxRows - 1] ++;

    if (textareaColSize[textareaMaxRows - 1] > textareaMaxCols)
      textareaMaxCols = textareaColSize[textareaMaxRows - 1];
    
    $("#textBox").attr('rows', textareaMaxRows);
    if (textareaMaxCols == 0 && c == '\n') 
      $("#textBox").attr('cols', TEXT_DEFAULT_LEN);
    else
      $("#textBox").attr('cols', textareaMaxCols + 1);
  }

  function checkKeyClicked(p, i, j) {
    if ((p.x > keyboardKeyPosX[i][j] && p.x < keyboardKeyPosX[i][j] + keyboardWidth[i][j]) &&
        (p.y > keyboardKeyPosY[i][j] && p.y < keyboardKeyPosY[i][j] + keyDefaultSize)) {
      return true;
    }
    return false;
  }

  function chooseKeySize(keyStr) {
    var ret;
    switch (keyStr) {
      case 'Space':
        ret = keySpaceSize;
        break;
      case 'Enter':
        ret = keyEnterSize;
	break;
      case 'Shift':
        ret = keyShiftSize;
	break;
      case 'Delete':
      case 'Tab':
      case 'Caps':
        ret = keyLongSize;
	break;
      case 'Done':
        ret = keyReservedSize;
        break;
      default:
        ret = keyDefaultSize;
    }
    return ret;
  }

  function drawKeyboardKey(i, j) {
    // draw key edge
    ctx.save();
    //ctx.beginPath();
    ctx.rect(keyboardKeyPosX[i][j], keyboardKeyPosY[i][j], keyboardWidth[i][j], keyDefaultSize);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.restore();
    // draw key char
    ctx.save();
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.textBaseline="hanging";
    var lineWidth = ctx.measureText(kbItems[i][j]).width;
    var lineHeight = ctx.measureText('M').width * 1.2;
    ctx.fillText(kbItems[i][j], keyboardKeyPosX[i][j] + keyboardWidth[i][j] / 2 - lineWidth / 2, 
                                keyboardKeyPosY[i][j] + keyDefaultSize / 2 - lineHeight / 2);
    ctx.restore();
  }
  
  function textAreaInit() {
    textareaMaxRows = 1;
    textareaColSize = [];
    // text may need bigger px
    $("#textBox").css({
      "font-family": "sans-serif",
      "font-size": sizes[currentSize - 1] + 10 + 'px',
      "color": colors[currentColor - 1],
      "resize": "none"
    });
    $("#textBox").attr('rows', textareaMaxRows).attr('cols', TEXT_DEFAULT_LEN);
    $('#textBox').val('');
    textareaColSize[textareaMaxRows - 1] = 0;
    textareaMaxCols = 0; 
  }
  
  function textInputInit(pos) {
    currentText = findAvaliableTextSpace();
    textMessage[currentText] = '';
    textPos[currentText] = pos;
    textColor[currentText] = colors[currentColor - 1];
    // text may need bigger px
    textSize[currentText] = sizes[currentSize - 1] + 10 + 'px';
  }

  function findAvaliableTextSpace() {
    var i;
    
    if (maxText == 0)
      return maxText;

    for (i = 0; i < maxText; ++ i) {
      if (textMessage[i] == '')
        break;
    }

    return i;
  }

  function redrawImage(num) {
    ctx.drawImage(img[num], 0, 0, img[num].width, img[num].height,
        imagePos[num].x, imagePos[num].y, imageWidth[num], imageHeight[num]);
  }
  
  function redrawAll() {
    clearCanvas();
    // redraw all canvas except current image
    redraw();
    // redraw current image
    if (currentChooseImage != -1) {
      redrawImage(currentChooseImage);
      drawImageDeleteButton(currentChooseImage);
      if (isImageOnload)
        drawImageAnchorEdge(currentChooseImage);
      else
        drawImageEdge(currentChooseImage);
    }
  }

  function handleImageMove(x, y) {
    var dx = x - moveStartPos.x;
    var dy = y - moveStartPos.y;
    imagePos[currentChooseImage].x += dx;
    imagePos[currentChooseImage].y += dy;
    moveStartPos.x = x;
    moveStartPos.y = y;
    redrawAll();
  }

  function getKeyboardOffset(evt) {
    var curTop = parseInt($('#kcanvas').css('top'), 10);
    var curLeft = parseInt($('#kcanvas').css('left'), 10);
    var dx = evt.clientX - curLeft;
    var dy = evt.clientY - curTop;

    return {
      x: dx,
      y: dy,
    };
  }

  function handleCanvasKeyboardMove(evt) {
    $('#kcanvas').css({
      'left': evt.clientX - keyboardOffset.x,
      'top': evt.clientY - keyboardOffset.y,
    });
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
    redrawAll();
  }

  function findAvaliableImageSpace() {
    var i;
    for (i = 0; i < MAX_IMAGE_NUM; ++ i) {
      if (img[i] == -1)
        break;
    }
    if (i == MAX_IMAGE_NUM)
      return -1;
    return i;
  }

  function handlePictureInput(evt) {
    if (!needOpenUpload) {
      needOpenUpload = true;
      return;
    }
    newImagePos = findAvaliableImageSpace();
    if (newImagePos == -1)
      return;
    imagePos[newImagePos] = getMousePos(canvas, evt);
    $('#fileUpload').click();
  }

  function handlePictureDelete(imageNum) {
    if (isImageOnload)
      isImageOnload = false;
    
    var idx = imagePriority.indexOf(imageNum);
    if (idx != -1)
      imagePriority.splice(imagePriority.indexOf(imageNum), 1);

    img[imageNum] = -1;
    unchooseImage();
    imageCount --;
  }

  function handlePictureEnter(imageNum) {
    switch (currentMode) {
      case modes.PICTURE:
        if (isImageOnload) {
	  imagePriority.push(imageNum);
          imageCount ++;
          pushImage(currentChooseImage);
          unchooseImage();
          isImageOnload = false;
        } else {
          unchooseImage();
        }
        break;
      case modes.KEYBOARD:
        // text is null
	if (textMessage[currentText].length == 0) {
	  textMessage[currentText] = '';
	} else {
	  pushText(currentText);
	  maxText ++;
	}
	isTexting = false;
	redrawAll();
	showTextBox(false);
	showCanvasKeyboard(false);
	break;
    }
  }

  function drawText(textNum) {
    ctx.save();
    var fontArgs = ctx.font.split(' ');
    ctx.font = textSize[textNum] + ' ' + fontArgs[fontArgs.length - 1];
    ctx.fillStyle = textColor[textNum];
    ctx.textBaseline="hanging";
    fillAllText(textMessage[textNum], textPos[textNum].x, textPos[textNum].y);
    ctx.restore();
  }

  function fillAllText(text, x, y) {
    var lineHeight = ctx.measureText("M").width * 1.2;
    var lines = text.split("\n");
    for (var i = 0; i < lines.length; ++i) {
      ctx.fillText(lines[i], x, y);
      y += lineHeight;
    }
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

  function pushImage(num) {
    // x indicate that image push
    fullDrawX.push('p');
    // y indicate which image been pushed
    fullDrawY.push(num);
  }

  function pushText(num) {
    // x indicate that text push
    fullDrawX.push('t');
    // y indicate which text been pushed
    fullDrawY.push(num);
  }

  function drawStart(x, y) {
    fullDrawX.push('d');
    fullDrawX.push(x);
    fullDrawY.push('d');
    fullDrawY.push(y);
    if (currentMode == modes.ERASE)
      fullDrawColor.push('white');
    else if (currentMode == modes.DRAW)
      fullDrawColor.push(colors[currentColor - 1]);
    fullDrawSize.push(currentSize);
  }

  function drawContinue(x, y) {
    fullDrawX.push(x);
    fullDrawY.push(y);
  }
  
  function drawUp() {
    fullDrawX.push('u');
    fullDrawY.push('u');
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
      if (fullDrawX[i] == 'd') {  // mouse down
	chooseLen = chooseLen + 1;
	ctx.lineWidth = sizes[fullDrawSize[chooseLen] - 1];
	ctx.strokeStyle = fullDrawColor[chooseLen];
	ctx.beginPath();
	ctx.moveTo(fullDrawX[i + 1], fullDrawY[i + 1]);
	i = i + 1;
      } else if(fullDrawX[i] == 'p') {  // picture
	if (currentChooseImage != -1 && currentChooseImage == fullDrawY[i] && isImageOnload) {
	  // position changed
	  fullDrawX[i] = 'x';
	  continue;
	}
	if (img[fullDrawY[i]] == -1) {
	  fullDrawX[i] = 'x';
	  continue;
	}
	redrawImage(fullDrawY[i]);
      } else if (fullDrawX[i] == 't') {  // text
        drawText(fullDrawY[i]);
      } else if (fullDrawX[i] == 'x') {  // deleted
        continue;
      } else if (fullDrawX[i] == 'u') {  // mouse up
        ctx.stroke();
      } else {
        ctx.lineTo(fullDrawX[i], fullDrawY[i]);
	//ctx.stroke();
      }
    }
    if (chooseLen != -1 && fullDrawX[fullDrawX.length - 1] != 'p' && fullDrawX[fullDrawX.length - 1] != 't')
      ctx.stroke();
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
      setMode(modes.DRAW);
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
      setMode(modes.ERASE);
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
	clearTextInfo();
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
	    setMode(previousMode);
	    menuChoosed(i, false);
	  } else if (currentMode == modes.KEYBOARD) {
	    setMode(modes.PICTURE);
	    menuChoosed(i, true);
	    menuChoosed(4, false);
	    showHideMenu(openMenu, false);
	  } else {
	    previousMode = currentMode;
	    setMode(modes.PICTURE);
	    menuChoosed(i, true);
	    showHideMenu(openMenu, false);
	  }
	  return;
	} else if (menuChoose[i] == '#keyboard') {
	  if (currentMode == modes.KEYBOARD) {
	    setMode(previousMode);
	    menuChoosed(i, false);
	  } else if (currentMode == modes.PICTURE) {
	    setMode(modes.KEYBOARD);
	    menuChoosed(i, true);
	    menuChoosed(5, false);
	    showHideMenu(openMenu, false);
	  } else {
	    previousMode = currentMode;
	    setMode(modes.KEYBOARD);
	    menuChoosed(i, true);
	    showHideMenu(openMenu, false);
	  }
	  return;
	} else if (menuChoose[i] == '#off') {
	  menuChoosed(i, true);
	  $('#power_off').click();
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
