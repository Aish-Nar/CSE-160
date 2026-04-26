//asg2 
// =======================
// Shaders
// =======================

var VERTEX_SHADER = `
precision mediump float;
attribute vec4 a_Position;
uniform mat4 u_ModelMatrix;
uniform mat4 u_GlobalRotation;
void main() {
  gl_Position = u_GlobalRotation * u_ModelMatrix * a_Position;
}
`;

var FRAGMENT_SHADER = `
precision mediump float;
uniform vec4 u_FragColor;
void main() {
  gl_FragColor = u_FragColor;
}
`;

// =======================
// Global Variables
// =======================

let canvas;
let gl;
let a_Position;
let u_ModelMatrix;
let u_GlobalRotation;
let u_FragColor;

let g_globalAngle = 0;
let g_upperLegAngle = 0;
let g_lowerLegAngle = 0;
let g_animation = false;
let g_seconds = 0;
let g_startTime = performance.now() / 1000;

let g_lastFrameTime = performance.now();
let g_frameCount = 0;

// =======================
// Cube Vertices
// =======================

const cubeVertices = new Float32Array([
  // Front
  -0.5, -0.5,  0.5,   0.5, -0.5,  0.5,   0.5,  0.5,  0.5,
  -0.5, -0.5,  0.5,   0.5,  0.5,  0.5,  -0.5,  0.5,  0.5,

  // Back
  -0.5, -0.5, -0.5,  -0.5,  0.5, -0.5,   0.5,  0.5, -0.5,
  -0.5, -0.5, -0.5,   0.5,  0.5, -0.5,   0.5, -0.5, -0.5,

  // Top
  -0.5,  0.5, -0.5,  -0.5,  0.5,  0.5,   0.5,  0.5,  0.5,
  -0.5,  0.5, -0.5,   0.5,  0.5,  0.5,   0.5,  0.5, -0.5,

  // Bottom
  -0.5, -0.5, -0.5,   0.5, -0.5, -0.5,   0.5, -0.5,  0.5,
  -0.5, -0.5, -0.5,   0.5, -0.5,  0.5,  -0.5, -0.5,  0.5,

  // Right
   0.5, -0.5, -0.5,   0.5,  0.5, -0.5,   0.5,  0.5,  0.5,
   0.5, -0.5, -0.5,   0.5,  0.5,  0.5,   0.5, -0.5,  0.5,

  // Left
  -0.5, -0.5, -0.5,  -0.5, -0.5,  0.5,  -0.5,  0.5,  0.5,
  -0.5, -0.5, -0.5,  -0.5,  0.5,  0.5,  -0.5,  0.5, -0.5
]);

// =======================
// Main
// =======================

function main() {
  canvas = document.getElementById("webgl");
  gl = canvas.getContext("webgl");

  if (!gl) {
    console.log("Failed to get WebGL context.");
    return;
  }

  if (!initShaders(gl, VERTEX_SHADER, FRAGMENT_SHADER)) {
    console.log("Failed to initialize shaders.");
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  u_GlobalRotation = gl.getUniformLocation(gl.program, "u_GlobalRotation");
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");

  let vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.05, 0.05, 0.08, 1.0);

  addActionsForHtmlUI();

  requestAnimationFrame(tick);
}

// =======================
// UI
// =======================

function addActionsForHtmlUI() {
  document.getElementById("globalRotationSlide").addEventListener("input", function () {
    g_globalAngle = Number(this.value);
    renderScene();
  });

  document.getElementById("upperLegSlide").addEventListener("input", function () {
    g_upperLegAngle = Number(this.value);
    renderScene();
  });

  document.getElementById("lowerLegSlide").addEventListener("input", function () {
    g_lowerLegAngle = Number(this.value);
    renderScene();
  });
}

// =======================
// Animation
// =======================

function tick() {
  g_seconds = performance.now() / 1000 - g_startTime;

  updateAnimationAngles();
  renderScene();
  updateFPS();

  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (g_animation) {
    g_upperLegAngle = 25 * Math.sin(g_seconds * 3);
    g_lowerLegAngle = 25 * Math.sin(g_seconds * 3 + 1.5);
  }
}

function updateFPS() {
  g_frameCount++;
  let now = performance.now();

  if (now - g_lastFrameTime > 1000) {
    document.getElementById("fps").innerText = "FPS: " + g_frameCount;
    g_frameCount = 0;
    g_lastFrameTime = now;
  }
}

// =======================
// Drawing Helper
// =======================

function drawCube(matrix, color) {
  gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);
  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
  gl.drawArrays(gl.TRIANGLES, 0, 36);
}

// =======================
// Scene
// =======================

function renderScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotation, false, globalRotMat.elements);

  const orange = [1.0, 0.45, 0.05, 1.0];
  const black = [0.02, 0.02, 0.02, 1.0];
  const white = [1.0, 0.9, 0.75, 1.0];
  const green = [0.1, 0.8, 0.2, 1.0];

  // =======================
  // Tiger Body
  // =======================

  let body = new Matrix4();
  body.translate(0, 0, 0);
  body.scale(1.2, 0.45, 0.55);
  drawCube(body, orange);

  // Body stripes
  drawStripe(-0.35, 0.24, 0.29);
  drawStripe(0.0, 0.24, 0.29);
  drawStripe(0.35, 0.24, 0.29);

  // =======================
  // Head
  // =======================

  let head = new Matrix4();
  head.translate(0.85, 0.22, 0);
  head.scale(0.42, 0.38, 0.42);
  drawCube(head, orange);

  // Snout
  let snout = new Matrix4();
  snout.translate(1.12, 0.14, 0);
  snout.scale(0.22, 0.18, 0.25);
  drawCube(snout, white);

  // Nose
  let nose = new Matrix4();
  nose.translate(1.25, 0.18, 0);
  nose.scale(0.06, 0.05, 0.09);
  drawCube(nose, black);

  // Ears
  let ear1 = new Matrix4();
  ear1.translate(0.75, 0.52, 0.22);
  ear1.scale(0.14, 0.18, 0.12);
  drawCube(ear1, black);

  let ear2 = new Matrix4();
  ear2.translate(0.75, 0.52, -0.22);
  ear2.scale(0.14, 0.18, 0.12);
  drawCube(ear2, black);

  // Eyes
  let eye1 = new Matrix4();
  eye1.translate(1.08, 0.3, 0.13);
  eye1.scale(0.05, 0.05, 0.05);
  drawCube(eye1, green);

  let eye2 = new Matrix4();
  eye2.translate(1.08, 0.3, -0.13);
  eye2.scale(0.05, 0.05, 0.05);
  drawCube(eye2, green);

  // =======================
  // Legs with hierarchy
  // =======================

  drawLeg(0.45, -0.25, 0.23, true);
  drawLeg(0.45, -0.25, -0.23, true);
  drawLeg(-0.45, -0.25, 0.23, false);
  drawLeg(-0.45, -0.25, -0.23, false);

  // =======================
  // Tail: 3-part chain
  // =======================

  let tailBase = new Matrix4();
  tailBase.translate(-0.75, 0.12, 0);
  tailBase.rotate(25 * Math.sin(g_seconds * 2), 0, 0, 1);
  tailBase.scale(0.35, 0.09, 0.09);
  drawCube(tailBase, orange);

  let tail2 = new Matrix4();
  tail2.translate(-1.0, 0.22, 0);
  tail2.rotate(35 + 20 * Math.sin(g_seconds * 2), 0, 0, 1);
  tail2.scale(0.32, 0.08, 0.08);
  drawCube(tail2, orange);

  let tail3 = new Matrix4();
  tail3.translate(-1.2, 0.42, 0);
  tail3.rotate(65 + 20 * Math.sin(g_seconds * 2), 0, 0, 1);
  tail3.scale(0.28, 0.07, 0.07);
  drawCube(tail3, black);
}

// =======================
// Parts
// =======================

function drawLeg(x, y, z, frontLeg) {
  const orange = [1.0, 0.45, 0.05, 1.0];
  const black = [0.02, 0.02, 0.02, 1.0];

  let swing = frontLeg ? g_upperLegAngle : -g_upperLegAngle;
  let bend = frontLeg ? g_lowerLegAngle : -g_lowerLegAngle;

  // Upper leg
  let upper = new Matrix4();
  upper.translate(x, y, z);
  upper.rotate(swing, 0, 0, 1);
  upper.scale(0.16, 0.35, 0.16);
  drawCube(upper, orange);

  // Lower leg
  let lower = new Matrix4();
  lower.translate(x, y - 0.35, z);
  lower.rotate(bend, 0, 0, 1);
  lower.scale(0.13, 0.32, 0.13);
  drawCube(lower, orange);

  // Paw
  let paw = new Matrix4();
  paw.translate(x + 0.05, y - 0.65, z);
  paw.scale(0.22, 0.1, 0.18);
  drawCube(paw, black);
}

function drawStripe(x, y, z) {
  const black = [0.02, 0.02, 0.02, 1.0];

  let stripe = new Matrix4();
  stripe.translate(x, y, z);
  stripe.rotate(25, 0, 0, 1);
  stripe.scale(0.08, 0.32, 0.03);
  drawCube(stripe, black);

  let stripeBack = new Matrix4();
  stripeBack.translate(x, y, -z);
  stripeBack.rotate(-25, 0, 0, 1);
  stripeBack.scale(0.08, 0.32, 0.03);
  drawCube(stripeBack, black);
}