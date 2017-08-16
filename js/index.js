$(document).ready(function () {
  "use strict";

  var platform = $('.platform');
  var platformHeight = platform.height();
  var platformWidth = platform.width();
  var platformY = platform.position().top
  var platformX = platform.position().left;

  var field = $('#field');
  var fieldTop = field.position().top;
  var fieldHeight = field.height();
  var fieldWidth = field.width();

  var ball = $('#ball');
  var ballX = ball.position().left;
  var ballY = ball.position().top;
  var ballDiameter = ball.width();
  var velocityX = 5;
  var velocityY = 5;

  var launched = false;
  var debugElements = [];

  field.click(function() {
    // Launche ball
    if(!launched) {
      launched = true;
    }
  });
  
  $(document).mousemove(function(e) {
    platformY = e.pageY - fieldTop - platformHeight/2;
    if (platformY < 0) platformY = 0;
    if (platformY > fieldHeight - platformHeight) platformY = fieldHeight - platformHeight;
  });

  function moveBall() {
    ballX += velocityX;
    ballY += velocityY;

    // Можливо при великій швидкості потрібно буде ставити мяч на ці координати щоб мяч не застряв у стіні
    // When the ball touched the wall
    if (ballX < 0 || ballX > fieldWidth - ballDiameter) {
      velocityX = -velocityX;
    }
    if (ballY < 0 || ballY > fieldHeight- ballDiameter) {
      velocityY = -velocityY;
    }
  
    // When the ball touched the platform
    if (!MacroCollision(ball, platform)) { return } 
    if (ballTouchedLeftSide()) {
      velocityX = -Math.abs(velocityX);
    }
    if (ballTouchedBotSide()) {
      velocityY = Math.abs(velocityY);
    }
    else if (ballTouchedTopSide()) {
      velocityY = -Math.abs(velocityY);
    }
  }

  function ballTouchedLeftSide() {
    // Right side coordinates
    var x = ballX + ballDiameter;
    var y = ballY + ballDiameter/2;
    return x > platformX && ballX < platformX+platformWidth && y > platformY && y < platformY+platformHeight
  }

  function ballTouchedTopSide() {
    return (ballY < platformY+platformHeight/2 || ballY+ballDiameter > platformY) && ballX+ballDiameter/2 > platformX && ballX+ballDiameter/2 < platformX+platformWidth
  }

  function ballTouchedBotSide() {
    return (ballY < platformY+platformHeight && ballY+ballDiameter > platformY+platformHeight/2) && ballX+ballDiameter/2 > platformX && ballX+ballDiameter/2 < platformX+platformWidth
  }

  function MacroCollision(obj1,obj2){
    var XColl=false;
    var YColl=false;
    var obj1_x = obj1.position().left;
    var obj1_y = obj1.position().top;
    var obj1_width = obj1.width();
    var obj1_height = obj1.height();

    var obj2_x = obj2.position().left;
    var obj2_y = obj2.position().top;
    var obj2_width = obj2.width();
    var obj2_height = obj2.height();

    if ((obj1_x + obj1_width >= obj2_x) && (obj1_x <= obj2_x + obj2_width)) XColl = true;
    if ((obj1_y + obj1_height >= obj2_y) && (obj1_y <= obj2_y + obj2_height)) YColl = true;

    if (XColl&YColl){return true;}
    return false;
  }

  function d(text, elem, number) {
    var debugLength = debugElements.length;
    var element = {text: text, elem: elem}
    if(number > debugLength) {
      $("body").append(`<div class="log" id="log${debugLength}">${text}: ${elem}</div>`);
      debugElements.push(element);
    }
    debugElements[number - 1] = element;
  }

  function updateDebug() {
    var debugLength = debugElements.length;
    for(var i = 0; i < debugLength; i++) {
      var dElem = debugElements[i];
      var log = $(".log")[i].textContent;
      var logStr = log.substr(log.lastIndexOf(":")+2);
      if (logStr != dElem.elem.toString()) {
        console.log("yes");
        $(`#log${i}`).text(dElem.text + ": " + dElem.elem);
      }
    }
  }

  function render() {
    updateDebug();
    platform.css("top", platformY);
    ball.css("top", ballY);
    ball.css("left", ballX);
  }

  (function animloop() {
    moveBall();
    render();
    setTimeout(animloop, 1000/60);
  })();
});  
