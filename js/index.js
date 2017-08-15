$(document).ready(function () {
  "use strict";

  var platform = $('.platform');
  var platformHeight = platform.height();
  var platformY;

  var field = $('#field');
  var fieldTop = field.position().top;
  var fieldHeight = field.height();
  var fieldWidth = field.width();

  var ball = $('#ball');
  var ballX = ball.position().left;
  var ballY = ball.position().top;
  var ballWidth = ball.width();
  var ballHeight = ball.height();
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
  });

  function moveBall() {
    ballX += velocityX;
    ballY += velocityY;

    // Можливо при великій швидкості потрібно буде ставити мяч на ці координати щоб мяч не застряв у стіні
    // When the ball touched the wall
    if (ballX < 0 || ballX > fieldWidth - ballWidth) {
      velocityX = -velocityX;
    }
    if (ballY < 0 || ballY > fieldHeight- ballHeight) {
      velocityY = -velocityY;
    }
  }

  function render() {
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
