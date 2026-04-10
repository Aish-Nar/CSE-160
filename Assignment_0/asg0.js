// DrawRectanlge.js
function main() {
 // Retrieve the <canvas> element 
 var canvas = document.getElementById('example');
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
 var v2 = new Vector3([1, 1, 0]); 

 // Draw v1 in red
 drawVector(v1, 'red');
 // Draw v2 in blue
 drawVector(v2, 'blue');
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

function clearCanvas() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function handleDrawEvent() {
  clearCanvas();

  // Read v1 inputs
  var v1x = parseFloat(document.getElementById('v1x').value);
  var v1y = parseFloat(document.getElementById('v1y').value);

  // Read v2 inputs
  var v2x = parseFloat(document.getElementById('v2x').value);
  var v2y = parseFloat(document.getElementById('v2y').value);

  // Create vectors
  var v1 = new Vector3([v1x, v1y, 0]);
  var v2 = new Vector3([v2x, v2y, 0]);

  // Draw both
  drawVector(v1, 'red');
  drawVector(v2, 'blue');
}

function handleDrawOperationEvent() {
  clearCanvas();

  // Read v1 inputs
  var v1x = parseFloat(document.getElementById('v1x').value);
  var v1y = parseFloat(document.getElementById('v1y').value);

  // Read v2 inputs
  var v2x = parseFloat(document.getElementById('v2x').value);
  var v2y = parseFloat(document.getElementById('v2y').value);
  
  // Operation
  var operation = document.getElementById('operation').value;
  var scalar = parseFloat(document.getElementById('scalar').value);
  // Create vectors
  var v1 = new Vector3([v1x, v1y, 0]);
  var v2 = new Vector3([v2x, v2y, 0]);

  // Draw both
  drawVector(v1, 'red');
  drawVector(v2, 'blue');

  if (operation === 'add') {
    var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
    v3.add(v2);
    drawVector(v3, 'green');
  } 
  else if (operation === 'sub') {
    var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
    v3.sub(v2);
    drawVector(v3, 'green');
  } 
  else if (operation === 'mul') {
    var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
    var v4 = new Vector3([v2.elements[0], v2.elements[1], v2.elements[2]]);
    v3.mul(scalar);
    v4.mul(scalar);
    drawVector(v3, 'green');
    drawVector(v4, 'green');
  } 
  else if (operation === 'div') {
    var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
    var v4 = new Vector3([v2.elements[0], v2.elements[1], v2.elements[2]]);
    v3.div(scalar);
    v4.div(scalar);
    drawVector(v3, 'green');
    drawVector(v4, 'green');
  }
  else if (operation === 'magnitude') {
    console.log("Magnitude v1:", v1.magnitude());
    console.log("Magnitude v2:", v2.magnitude());
  }
  else if (operation === 'normalize') {
    var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
    var v4 = new Vector3([v2.elements[0], v2.elements[1], v2.elements[2]]);
    v3.normalize();
    v4.normalize();
    drawVector(v3, 'green');
    drawVector(v4, 'green');
  }
  function angleBetween(v1, v2) {
  let dot = Vector3.dot(v1, v2);
  let mag1 = v1.magnitude();
  let mag2 = v2.magnitude();

  if (mag1 === 0 || mag2 === 0) {
    return 0;
  }

  let cosAlpha = dot / (mag1 * mag2);

  // Clamp to avoid floating point issues
  if (cosAlpha > 1) cosAlpha = 1;
  if (cosAlpha < -1) cosAlpha = -1;

  let angleRadians = Math.acos(cosAlpha);
  let angleDegrees = angleRadians * 180 / Math.PI;

  return angleDegrees;
}
}