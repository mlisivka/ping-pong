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
  var ballRadius = ball.width()/2;
  // Coordinates of the ball center
  var ballX = ball.position().left + ballRadius*2;
  var ballY = ball.position().top + ballRadius*2;
  var velocityX = 10;
  var velocityY = 10;

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
    if (ballX < 0 || ballX > fieldWidth - ballRadius*2) {
      velocityX = -velocityX;
    }
    if (ballY < 0 || ballY > fieldHeight- ballRadius*2) {
      velocityY = -velocityY;
    }
    
    // When the ball touched the platform
    if (!MacroCollision(ball, platform)) { return } 
    repelBall()
    if (ballTouchedLeftSide()) {
    //  velocityX = -Math.abs(velocityX);
    }
  }

  function repelBall() {
    var interPoint = getIntersectionPoint();
    buildReflection(interPoint);
  }

  function getIntersectionPoint() {

    // Compute previous ball points
    var bY = ballY - velocityY;
    var bX = ballX - velocityX;
    var point = horizontalReflection(bX, bY);
    if (!point) {
      point = verticalReflection(bX, bY);
    }
    return point;
  }

  function buildReflection(point) {

  }

  function horizontalReflection(bX, bY) {
    var distanceBetweenY = Math.abs(bY - ballY);
    var distanceBYPlatform;
    var distanceBallYPlatform;
    var pointX;
    var pointY;
    if (bX - ballRadius <= platformX) { // When the ball came to the left
      distanceBYPlatform = Math.abs(bY - platformY);
      distanceBallYPlatform = Math.abs(ballY - platformY);
      pointX = platformX;
      pointY = bY + (distanceBetweenY*distanceBYPlatform)/(distanceBYPlatform + distanceBallYPlatform);
     
      if (pointY <= platformY || pointY >= platformY+platformHeight) { return; }
      ballX = pointX - ballRadius - 1;
      velocityX = -Math.abs(velocityX);
    }
    else if (bX + ballRadius >= platformX+platformWidth) { // When the ball came to the right
      distanceBYPlatform = Math.abs(bY - platformY) + platformWidth;
      distanceBallYPlatform = Math.abs(ballY - platformY) + platformWidth;
      pointX = platformX + platformWidth;
      pointY = bY + (distanceBetweenY*distanceBYPlatform)/(distanceBYPlatform + distanceBallYPlatform);
      // if the point is outside 
      if (pointY <= platformY || pointY >= platformY+platformHeight) { return; }
      ballX = pointX + ballRadius + 1;
      velocityX = Math.abs(velocityX);
    }
    else {
      return;
    }
    return [pointX, pointY];
  }
  
  function verticalReflection(bX, bY) {
    var distanceBetweenX = Math.abs(bX - ballX);
    var distanceBXPlatform;
    var distanceBallXPlatform;
    var pointX;
    var pointY;
    if (bY - ballRadius < platformY) { // When the ball came to the top
      distanceBXPlatform = Math.abs(bX - platformX);
      distanceBallXPlatform = Math.abs(ballX - platformX);
      pointY = platformY;
      pointX = bX + (distanceBetweenX*distanceBXPlatform)/(distanceBXPlatform + distanceBallXPlatform);
      // ballX = pointX;
      ballY = pointY - ballRadius - 1;
      velocityY = -Math.abs(velocityY);
    }
    else if (bY + ballRadius > platformY+platformHeight) { // When the ball came to the bottom
      distanceBXPlatform = Math.abs(bX - platformX) + platformHeight;
      distanceBallXPlatform = Math.abs(ballX - platformX) + platformHeight;
      pointY = platformY + platformHeight;
      pointX = bX + (distanceBetweenX*distanceBXPlatform)/(distanceBXPlatform + distanceBallXPlatform);
      // ballX = pointX;
      ballY = pointY + ballRadius + 1;
      velocityY = Math.abs(velocityY);
    }
    else {
      return;
    }
    return [pointX, pointY];
  }

  function ballTouchedLeftSide() {
    // Right side coordinates
    var x = ballX + ballRadius*2;
    var y = ballY + ballRadius;
    return x > platformX && ballX < platformX+platformWidth && y > platformY && y < platformY+platformHeight
  }

  function ballTouchedTopSide() {
    return (ballY < platformY+platformHeight/2 || ballY+ballRadius*2 > platformY) && ballX+ballRadius > platformX && ballX+ballRadius < platformX+platformWidth
  }

  function ballTouchedBotSide() {
    return (ballY < platformY+platformHeight && ballY+ballRadius*2 > platformY+platformHeight/2) && ballX+ballRadius > platformX && ballX+ballRadius < platformX+platformWidth
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
        $(`#log${i}`).text(dElem.text + ": " + dElem.elem);
      }
    }
  }

  function render() {
    updateDebug();
    platform.css("top", platformY);
    ball.css("top", ballY-ballRadius);
    ball.css("left", ballX-ballRadius);
  }

  (function animloop() {
    moveBall();
    render();
    setTimeout(animloop, 1000/30);
  })();
});  
