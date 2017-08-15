$(document).ready(function () {
  "use strict";

  var platform = $('.platform');
  var platformHeight = platform.height();
  var platformY;

  var field = $('#field');
  var fieldTop = field.position().top;
  var fieldHeight = field.height();

  $(document).mousemove(function(e) {
    platformY = e.pageY - fieldTop - platformHeight/2;
    if (platformY < 0) platformY = 0;
    if (platformY > fieldHeight - platformHeight) platformY = fieldHeight - platformHeight;
  });

  function render() {
    platform.css("top", platformY);
  }

  (function animloop() {
    render();
    setTimeout(animloop, 1000/60);
  })();
});  
