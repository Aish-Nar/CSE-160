// DrawRectanlge.js
function main() {
 // Retrieve the <canvas> element 
 var canvas = document.getElementByld('example');
 if (!canvas) {
   Console.log('Failed to retrieve the <canvas> element ');
   return False;
  }

 // Get the rendering context for 2DCG 
 var ctx = canvas.getContext('2d');
 // Fill canvas black
 ctx.fillStyle = 'black';
 ctx.fillRect(0, 0, canvas.width, canvas.height);

 // Create v1 = (2.25, 2.25, 0)
 var v1 = new Vector3([2.25, 2.25, 0]);

 // Draw v1 in red
 drawVector(v1, 'red');
}

function drawVector(v, color) {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');

  var centerX = canvas.width / 2;
  var centerY = canvas.height / 2;
  var scale = 20;

  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(
    centerX + v.elements[0] * scale,
    centerY - v.elements[1] * scale
  );
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function handleDrawEvent() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');

  // Clear canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Read input values
  var x = parseFloat(document.getElementById('v1x').value);
  var y = parseFloat(document.getElementById('v1y').value);

  // Create v1
  var v1 = new Vector3([x, y, 0]);

  // Draw v1 in red
  drawVector(v1, 'red');
}
