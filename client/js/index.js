$(document).ready(function () {
  "use strict";

  var platform = $('#myself');
  var platformHeight = platform.height();
  var platformWidth = platform.width();
  var platformY = platform.position().top

  var platform_id;
  var enemy_id;
  var enemy_platform = $('#enemy');
  var enemyY;
  var touchablePlatform; 
  
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
    
    // Send to server platform coordinates if it was changed
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
    
    touchablePlatform = collisionBallWith([platform, enemy_platform]);
    if (touchablePlatform) {
      repelBall();
      touchablePlatform = false;
    }
  }

  function collisionBallWith(obj) {
    for (var i = 0; i < obj.length; i++) {
      // Intersection of the axes
      var XColl=false;
      var YColl=false;

      var objX = obj[i].position().left;
      var objY = obj[i].position().top;
      var objWidth = obj[i].width();
      var objHeight = obj[i].height();
      
      if ((ballX+ballRadius >= objX) && (ballX-ballRadius <= objX+objWidth)) XColl = true;
      if ((ballY+ballRadius >= objY) && (ballY-ballRadius <= objY+objHeight)) YColl = true;

      if (XColl&YColl){ return obj[i]; }
    }
    return false;
  }

  // Не повинен приймати параметрів
  function repelBall() {
    // Calculate points in which the ball was before
    var bY = ballY - velocityY;
    var bX = ballX - velocityX;
  
    // Repelling the ball
    horizontalRepelling(bX, bY) || verticalRepelling(bX, bY);
  }

  function horizontalRepelling(bX, bY) {
    var platformX = touchablePlatform.position().left;
    var platformY = touchablePlatform.position().top;

    var distanceBetweenY = distance(bY, ballY);
    var distanceBYPlatform = distance(bY, platformY);
    var distanceBallYPlatform = distance(ballY, platformY);
   
    // Point intersections with the platform
    var pointY = bY + (distanceBetweenY*distanceBYPlatform)/(distanceBYPlatform + distanceBallYPlatform);
    if (bX < platformX) { // When the ball came to the left
      if (pointYOutsidePlatform(pointY, platformY)) { return; }
      ballX = platformX - ballRadius;
      velocityX = -Math.abs(velocityX);
    }
    else if (bX >= platformX+platformWidth) { // When the ball came to the right
      if (pointYOutsidePlatform(pointY, platformY)) { return; }
      ballX = platformX + platformWidth + ballRadius;
      velocityX = Math.abs(velocityX);
    }
    else {
      return;
    }
    return pointY;
  }
  
  function verticalRepelling(bX, bY) {
    var platformX = touchablePlatform.position().left;
    var platformY = touchablePlatform.position().top;
    
    var distanceBetweenX = distance(bX, ballX);
    var distanceBXPlatform = distance(bX, platformX);
    var distanceBallXPlatform = distance(ballX, platformX);
    
    if (bY < platformY) { // When the ball came to the top
      ballY = platformY - ballRadius;
      velocityY = -Math.abs(velocityY);
    }
    else if (bY > platformY+platformHeight) { // When the ball came to the bottom
      ballY = platformY + platformHeight + ballRadius;
      velocityY = Math.abs(velocityY);
    }
  }

  function distance(obj1, obj2) {
    return Math.abs(obj1 - obj2);
  }

  function pointYOutsidePlatform(pointY, platformY) {
    return pointY <= platformY || pointY >= platformY+platformHeight;
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
