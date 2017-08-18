$(document).ready(function () {
  "use strict";

  var platform = $('.platform');
  var platformHeight = platform.height();
  var platformWidth = platform.width();
  var platformY = platform.position().top
  var platformX = platform.position().left;

  var platform_id;
  var enemy_id;
  $('#field').append("<div class='platform' id='enemy'></div>");
  var enemy_platform = $('#enemy');
  var enemyY;
  
  var field = $('#field');
  var fieldTop = field.position().top;
  var fieldHeight = field.height();
  var fieldWidth = field.width();

  var ball = $('#ball');
  var ballRadius = ball.width()/2;
  // Coordinates of the ball center
  var ballX = ball.position().left + ballRadius*2;
  var ballY = ball.position().top + ballRadius*2;
  var velocityX = 5;
  var velocityY = 5;

  var launched = false;

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
    
    var prevPlatformY = platform.position().top;
    if (platform_id && prevPlatformY != platformY) {
      savePlatformCoordinates();
    }
  });

  function moveBall() {
    ballX += velocityX;
    ballY += velocityY;

    // When the ball touched the wall
    if (ballY-ballRadius < 0) {
      velocityY = Math.abs(velocityY);
    }
    else if (ballY+ballRadius > fieldHeight) {
      velocityY = -Math.abs(velocityY);
    }
    
    if (ballX-ballRadius < 0) {
      velocityX = Math.abs(velocityX);
      console.log("0:1");
    }
    else if (ballX+ballRadius > fieldWidth) {
      velocityX = -Math.abs(velocityX);
      console.log("1:0");
    }
    
    // When the ball touched the platform
    if (collisionBallWith(platform)) {
      repelBall()
    }
  }

  function repelBall() {
    
    
    // Compute previous ball points
    var bY = ballY - velocityY;
    var bX = ballX - velocityX;
  
    // Reflection of the ball
    var point = horizontalReflection(bX, bY);
    if (!point) {
      point = verticalReflection(bX, bY);
    }
  }

  function horizontalReflection(bX, bY) {
    var distanceBetweenY = Math.abs(bY - ballY);
    var distanceBYPlatform;
    var distanceBallYPlatform;
   
    // Points intersections with the platform
    var pointX;
    var pointY;
    console.log(bX);
    console.log(platformX);
    if (bX < platformX) { // When the ball came to the left
      distanceBYPlatform = Math.abs(bY - platformY);
      distanceBallYPlatform = Math.abs(ballY - platformY);
     
      pointX = platformX;
      pointY = bY + (distanceBetweenY*distanceBYPlatform)/(distanceBYPlatform + distanceBallYPlatform);
     
      if (pointOutsidePlatform(pointX, pointY)) { return; }
      ballX = pointX - ballRadius;
      velocityX = -Math.abs(velocityX);
    }
    else if (bX >= platformX+platformWidth) { // When the ball came to the right
      distanceBYPlatform = Math.abs(bY - platformY) + platformWidth;
      distanceBallYPlatform = Math.abs(ballY - platformY) + platformWidth;
      
      pointX = platformX + platformWidth;
      pointY = bY + (distanceBetweenY*distanceBYPlatform)/(distanceBYPlatform + distanceBallYPlatform);
    
      if (pointOutsidePlatform(pointX, pointY)) { return; }
      ballX = pointX + ballRadius;
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
   
    // Points intersections with the platform
    var pointX;
    var pointY;
    if (bY < platformY) { // When the ball came to the top
      distanceBXPlatform = Math.abs(bX - platformX);
      distanceBallXPlatform = Math.abs(ballX - platformX);
     
      pointY = platformY;
      pointX = bX + (distanceBetweenX*distanceBXPlatform)/(distanceBXPlatform + distanceBallXPlatform);
     
      ballY = pointY - ballRadius;
      velocityY = -Math.abs(velocityY);
    }
    else if (bY > platformY+platformHeight) { // When the ball came to the bottom
      distanceBXPlatform = Math.abs(bX - platformX) + platformHeight;
      distanceBallXPlatform = Math.abs(ballX - platformX) + platformHeight;
    
      pointY = platformY + platformHeight;
      pointX = bX + (distanceBetweenX*distanceBXPlatform)/(distanceBXPlatform + distanceBallXPlatform);
     
      ballY = pointY + ballRadius;
      velocityY = Math.abs(velocityY);
    }
    else {
      return;
    }
    return [pointX, pointY];
  }

  function pointOutsidePlatform(pointX, pointY) {
    return pointY <= platformY || pointY >= platformY+platformHeight;
  }

  function collisionBallWith(obj) {
    // Intersection of the axes
    var XColl=false;
    var YColl=false;

    var objX = obj.position().left;
    var objY = obj.position().top;
    var objWidth = obj.width();
    var objHeight = obj.height();
    
    if ((ballX+ballRadius >= objX) && (ballX-ballRadius <= objX+objWidth)) XColl = true;
    if ((ballY+ballRadius >= objY) && (ballY-ballRadius <= objY+objHeight)) YColl = true;

    if (XColl&YColl){return true;}
    return false;
  }

  // WebSocket
  var ws = new WebSocket("ws://localhost:8080");
  ws.onopen = function() { onOpen() };

  ws.onmessage = function(event) { onMessage(event) };

  function onOpen() {
    savePlatformCoordinates();
  }

  function onMessage(message) {
    var data = JSON.parse(message.data);
    var type = Object.keys(data)[0];
    if (type == "platform_id" && !platform_id) {
      platform_id = data.platform_id;
    }
    else if(type == "save_coordinates" && data.data.user_id != platform_id) {
      enemyY = data.data.coor;
    }
  }

  function savePlatformCoordinates() {
    ws.send(JSON.stringify({
      path: "save_coordinates",
      data: { user_id: platform_id, coor: platformY }
    }));
  }

  function render() {
    platform.css("top", platformY);
    enemy_platform.css("top", enemyY);
    ball.css("top", ballY-ballRadius);
    ball.css("left", ballX-ballRadius);
  }

  (function animloop() {
    moveBall();
    render();
    setTimeout(animloop, 1000/60);
  })();

});  
