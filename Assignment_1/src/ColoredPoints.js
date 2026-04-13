// ColoredPoints.js

// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

// Globals related UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = 0;      // 0 = point, 1 = triangle, 2 = circle
let g_selectedSegments = 10;
let g_rainbowMode = false;


var g_shapesList = [];


function setupWebGL() {
  canvas = document.getElementById('webgl');

  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}


// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {
  // color buttons
  document.getElementById('green').onclick = function() {
    g_selectedColor = [0.0, 1.0, 0.0, 1.0];
  };

  document.getElementById('red').onclick = function() {
    g_selectedColor = [1.0, 0.0, 0.0, 1.0];
  };

  // shape buttons
  document.getElementById('pointButton').onclick = function() {
    g_selectedType = 0;
  };

  document.getElementById('triangleButton').onclick = function() {
    g_selectedType = 1;
  };

  document.getElementById('circleButton').onclick = function() {
    g_selectedType = 2;
  };

  // clear button
  document.getElementById('clearButton').onclick = function() {
    g_shapesList = [];
    renderAllShapes();
  };
  // RGB sliders
  document.getElementById('redSlide').addEventListener('mouseup', function() {
    g_selectedColor[0] = this.value / 100;
  });

  document.getElementById('greenSlide').addEventListener('mouseup', function() {
    g_selectedColor[1] = this.value / 100;
  });

  document.getElementById('blueSlide').addEventListener('mouseup', function() {
    g_selectedColor[2] = this.value / 100;
  });

  // size slider
  document.getElementById('sizeSlide').addEventListener('mouseup', function() {
    g_selectedSize = Number(this.value);
  });
  // circle segment slider
  document.getElementById('segmentSlide').addEventListener('mouseup', function() {
    g_selectedSegments = Number(this.value);
  });
  //rainbow text 
  document.getElementById('rainbowButton').onclick = function() {
   g_rainbowMode = !g_rainbowMode;
   this.innerText = g_rainbowMode ? "Rainbow Mode: ON" : "Rainbow Mode"; 
  };

  document.getElementById('drawPictureButton').onclick = function() {
  drawMyPicture();
  };  
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) {
    if (ev.buttons == 1) {
      click(ev);
    }
  };

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function click(ev) {
  let [x, y] = convertCoordinatesEventToGL(ev);

  let point;

  if (g_selectedType == 0) {
    point = new Point();
  } else if (g_selectedType == 1) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = g_selectedSegments;
  }

  point.position = [x, y];
  if (g_rainbowMode) {
    point.color = [Math.random(), Math.random(), Math.random(), 1.0];
  } else {
    point.color = g_selectedColor.slice();
  }
  point.size = g_selectedSize;

  g_shapesList.push(point);

  renderAllShapes();
}

// Extract the event click and return it in WebGL coordinates
function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX;
  var y = ev.clientY;
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}

// Draw every shape that is supposed to be in the canvas
function renderAllShapes() {
  var startTime = performance.now();

  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for (var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  var duration = performance.now() - startTime;
  sendTextToHTML(
    "numdot: " + len +
    " ms: " + Math.floor(duration) +
    " fps: " + Math.floor(10000 / duration) / 10,
    "numdot"
  );
}
//Draw the Picture I sketched
function drawMyPicture() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  // FOX A 
  gl.uniform4f(u_FragColor, 0.95, 0.58, 0.20, 1.0);
  drawTriangle([-0.78, -0.55, -0.58, 0.35, -0.42, -0.55]);
  drawTriangle([-0.42, -0.55, -0.26, 0.35, -0.06, -0.55]);
  drawTriangle([-0.58, -0.22, -0.26, -0.22, -0.42, -0.08]);

  // BUNNY N
  gl.uniform4f(u_FragColor, 0.72, 0.72, 0.76, 1.0);
  drawTriangle([0.20, 0.25, 0.42, 0.25, 0.20, -0.55]);
  drawTriangle([0.42, 0.25, 0.42, -0.55, 0.20, -0.55]);
  drawTriangle([0.58, 0.25, 0.80, 0.25, 0.58, -0.55]);
  drawTriangle([0.80, 0.25, 0.80, -0.55, 0.58, -0.55]);
  gl.uniform4f(u_FragColor, 0.58, 0.58, 0.62, 1.0);
  drawTriangle([0.42, 0.25, 0.58, 0.25, 0.58, -0.08]);
  gl.uniform4f(u_FragColor, 0.72, 0.72, 0.76, 1.0);
  drawTriangle([0.24, 0.25, 0.30, 0.48, 0.38, 0.25]);
  drawTriangle([0.62, 0.25, 0.70, 0.48, 0.78, 0.25]);
  gl.uniform4f(u_FragColor, 0.96, 0.60, 0.82, 1.0);
  drawTriangle([0.27, 0.25, 0.30, 0.40, 0.35, 0.25]);
  drawTriangle([0.66, 0.25, 0.70, 0.40, 0.75, 0.25]);
  drawTriangle([0.48, 0.02, 0.52, 0.08, 0.56, 0.02]);
}
// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}