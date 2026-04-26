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

let canvas, gl;
let a_Position, u_ModelMatrix, u_GlobalRotation, u_FragColor;

var g_globalAngle = 0;
var g_mouseAngleX = 0;
var g_mouseAngleY = 0;

var g_upperLegAngle = 0;
var g_lowerLegAngle = 0;
var g_animation = false;
var g_autoRotateAngle = 0;
var g_tailAngle = 0;
var g_poke = false;

let g_seconds = 0;
let g_startTime = performance.now() / 1000;
let g_lastFPS = performance.now();
let g_frames = 0;

const cubeVertices = new Float32Array([
  -0.5,-0.5,0.5, 0.5,-0.5,0.5, 0.5,0.5,0.5,
  -0.5,-0.5,0.5, 0.5,0.5,0.5, -0.5,0.5,0.5,

  -0.5,-0.5,-0.5, -0.5,0.5,-0.5, 0.5,0.5,-0.5,
  -0.5,-0.5,-0.5, 0.5,0.5,-0.5, 0.5,-0.5,-0.5,

  -0.5,0.5,-0.5, -0.5,0.5,0.5, 0.5,0.5,0.5,
  -0.5,0.5,-0.5, 0.5,0.5,0.5, 0.5,0.5,-0.5,

  -0.5,-0.5,-0.5, 0.5,-0.5,-0.5, 0.5,-0.5,0.5,
  -0.5,-0.5,-0.5, 0.5,-0.5,0.5, -0.5,-0.5,0.5,

  0.5,-0.5,-0.5, 0.5,0.5,-0.5, 0.5,0.5,0.5,
  0.5,-0.5,-0.5, 0.5,0.5,0.5, 0.5,-0.5,0.5,

  -0.5,-0.5,-0.5, -0.5,-0.5,0.5, -0.5,0.5,0.5,
  -0.5,-0.5,-0.5, -0.5,0.5,0.5, -0.5,0.5,-0.5
]);

const triVertices = new Float32Array([
   0.0,  0.6, 0.0,
  -0.5, -0.4, 0.0,
   0.5, -0.4, 0.0
]);

let cubeBuffer;
let triBuffer;

function main() {
  canvas = document.getElementById("webgl");
  gl = canvas.getContext("webgl");

  if (!gl) {
    console.log("WebGL failed");
    return;
  }

  if (!initShaders(gl, VERTEX_SHADER, FRAGMENT_SHADER)) {
    console.log("Shaders failed");
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  u_GlobalRotation = gl.getUniformLocation(gl.program, "u_GlobalRotation");
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");

  cubeBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);

  triBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, triVertices, gl.STATIC_DRAW);

  gl.enable(gl.DEPTH_TEST);

  addUI();
  addMouseControls();

  requestAnimationFrame(tick);
}

function addUI() {
  document.getElementById("globalRotationSlide").oninput = function () {
    g_globalAngle = Number(this.value);
  };

  document.getElementById("upperLegSlide").oninput = function () {
    g_upperLegAngle = Number(this.value);
  };

  document.getElementById("lowerLegSlide").oninput = function () {
    g_lowerLegAngle = Number(this.value);
  };
}

function addMouseControls() {
  canvas.onmousemove = function (ev) {
    let rect = canvas.getBoundingClientRect();
    let x = ev.clientX - rect.left;
    let y = ev.clientY - rect.top;

    g_mouseAngleY = (x / canvas.width - 0.5) * 120;
    g_mouseAngleX = (y / canvas.height - 0.5) * 80;
  };

  canvas.onclick = function (ev) {
    if (ev.shiftKey) {
      g_poke = true;
      setTimeout(function () {
        g_poke = false;
      }, 600);
    }
  };
}

function tick() {
  g_seconds = performance.now() / 1000 - g_startTime;

  if (g_animation) {
    g_autoRotateAngle = g_seconds * 45;
    g_upperLegAngle = 25 * Math.sin(g_seconds * 4);
    g_lowerLegAngle = 20 * Math.sin(g_seconds * 4 + 1.2);
    g_tailAngle = 18 * Math.sin(g_seconds * 3);
  } else {
    g_autoRotateAngle = 0;
    g_tailAngle = 0;
  }

  renderScene();
  updateFPS();
  requestAnimationFrame(tick);
}

function updateFPS() {
  g_frames++;
  let now = performance.now();

  if (now - g_lastFPS > 1000) {
    let fpsText = document.getElementById("fps");
    if (fpsText) fpsText.innerText = "FPS: " + g_frames;
    g_frames = 0;
    g_lastFPS = now;
  }
}

function useCubeBuffer() {
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
}

function useTriBuffer() {
  gl.bindBuffer(gl.ARRAY_BUFFER, triBuffer);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
}

function drawCube(M, color) {
  useCubeBuffer();
  gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);
  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
  gl.drawArrays(gl.TRIANGLES, 0, 36);
}

function drawTriangle(M, color) {
  useTriBuffer();
  gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);
  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function renderScene() {
  gl.clearColor(0.03, 0.03, 0.08, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let global = new Matrix4();
  global.setRotate(g_globalAngle + g_autoRotateAngle, 0, 1, 0);
  global.rotate(g_mouseAngleY, 0, 1, 0);
  global.rotate(g_mouseAngleX, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotation, false, global.elements);

  const orange = [1.0, 0.45, 0.02, 1];
  const black = [0, 0, 0, 1];
  const white = [1, 0.88, 0.65, 1];
  const green = [0.05, 0.85, 0.2, 1];
  const red = [1, 0, 0, 1];

  // BODY
  let body = new Matrix4();
  body.setScale(0.75, 0.28, 0.32);
  drawCube(body, orange);

  // BODY STRIPES
  drawBodyStripe(body, -0.45);
  drawBodyStripe(body, -0.25);
  drawBodyStripe(body, 0.0);
  drawBodyStripe(body, 0.25);
  drawBodyStripe(body, 0.45);

  // HEAD
  let head = new Matrix4();
  head.setTranslate(0.82, 0.18, 0);
  head.scale(0.32, 0.28, 0.28);
  drawCube(head, orange);

  // SNOUT
  let snout = new Matrix4();
  snout.setTranslate(1.08, 0.12, 0);
  snout.scale(0.22, 0.15, 0.22);
  drawCube(snout, white);

  // NOSE
  let nose = new Matrix4();
  nose.setTranslate(1.22, 0.14, 0);
  nose.scale(0.06, 0.05, 0.08);
  drawCube(nose, black);

  // EYES
  let eye1 = new Matrix4();
  eye1.setTranslate(1.01, 0.25, 0.12);
  eye1.scale(0.045, 0.045, 0.045);
  drawCube(eye1, green);

  let eye2 = new Matrix4();
  eye2.setTranslate(1.01, 0.25, -0.12);
  eye2.scale(0.045, 0.045, 0.045);
  drawCube(eye2, green);

  // NON-CUBE PRIMITIVE EARS
  let ear1 = new Matrix4();
  ear1.setTranslate(0.77, 0.45, 0.18);
  ear1.rotate(90, 0, 1, 0);
  ear1.scale(0.18, 0.18, 0.18);
  drawTriangle(ear1, black);

  let ear2 = new Matrix4();
  ear2.setTranslate(0.77, 0.45, -0.18);
  ear2.rotate(90, 0, 1, 0);
  ear2.scale(0.18, 0.18, 0.18);
  drawTriangle(ear2, black);

  // HEAD STRIPES
  drawHeadStripe(0.78, 0.32, 0.18, 20);
  drawHeadStripe(0.78, 0.32, -0.18, -20);
  drawHeadStripe(0.94, 0.35, 0.0, 0);

  // LEGS
  drawLeg(0.42, -0.32, 0.22, true);
  drawLeg(0.42, -0.32, -0.22, true);
  drawLeg(-0.42, -0.32, 0.22, false);
  drawLeg(-0.42, -0.32, -0.22, false);

  // ONE TAIL WITH BLACK TIP
  let tail = new Matrix4();
  tail.setTranslate(-0.82, 0.08, 0);
  tail.rotate(10 + g_tailAngle, 0, 0, 1);
  tail.scale(0.5, 0.055, 0.055);
  drawCube(tail, orange);

  let tailStripe = new Matrix4();
  tailStripe.setTranslate(-0.98, 0.12, 0);
  tailStripe.rotate(10 + g_tailAngle, 0, 0, 1);
  tailStripe.scale(0.05, 0.065, 0.065);
  drawCube(tailStripe, black);

  let tailTip = new Matrix4();
  tailTip.setTranslate(-1.18, 0.16, 0);
  tailTip.rotate(10 + g_tailAngle, 0, 0, 1);
  tailTip.scale(0.16, 0.05, 0.05);
  drawCube(tailTip, black);

  // POKE ANIMATION: red exclamation mark above tiger
  if (g_poke) {
    let poke = new Matrix4();
    poke.setTranslate(0.2, 0.75, 0);
    poke.scale(0.08, 0.28, 0.08);
    drawCube(poke, red);

    let pokeDot = new Matrix4();
    pokeDot.setTranslate(0.2, 0.48, 0);
    pokeDot.scale(0.08, 0.08, 0.08);
    drawCube(pokeDot, red);
  }
}

function drawBodyStripe(body, x) {
  const black = [0, 0, 0, 1];

  let stripeRight = new Matrix4(body);
  stripeRight.translate(x, 0.0, 1.05);
  stripeRight.rotate(20, 0, 0, 1);
  stripeRight.scale(0.07, 1.6, 0.2);
  drawCube(stripeRight, black);

  let stripeLeft = new Matrix4(body);
  stripeLeft.translate(x, 0.0, -1.05);
  stripeLeft.rotate(-20, 0, 0, 1);
  stripeLeft.scale(0.07, 1.6, 0.2);
  drawCube(stripeLeft, black);
}

function drawHeadStripe(x, y, z, angle) {
  const black = [0, 0, 0, 1];

  let stripe = new Matrix4();
  stripe.setTranslate(x, y, z);
  stripe.rotate(angle, 0, 0, 1);
  stripe.scale(0.04, 0.16, 0.035);
  drawCube(stripe, black);
}

function drawLeg(x, y, z, frontLeg) {
  const orange = [1.0, 0.45, 0.02, 1];
  const black = [0, 0, 0, 1];

  let swing = frontLeg ? g_upperLegAngle : -g_upperLegAngle;
  let bend = frontLeg ? g_lowerLegAngle : -g_lowerLegAngle;

  // upper leg
  let upper = new Matrix4();
  upper.setTranslate(x, y, z);
  upper.rotate(swing, 0, 0, 1);
  upper.scale(0.13, 0.32, 0.13);
  drawCube(upper, orange);

  // upper leg stripe
  let upperStripe = new Matrix4();
  upperStripe.setTranslate(x, y + 0.03, z);
  upperStripe.rotate(swing, 0, 0, 1);
  upperStripe.scale(0.14, 0.04, 0.14);
  drawCube(upperStripe, black);

  // lower leg
  let lower = new Matrix4();
  lower.setTranslate(x, y - 0.33, z);
  lower.rotate(bend, 0, 0, 1);
  lower.scale(0.11, 0.3, 0.11);
  drawCube(lower, orange);

  // lower leg stripe
  let lowerStripe = new Matrix4();
  lowerStripe.setTranslate(x, y - 0.35, z);
  lowerStripe.rotate(bend, 0, 0, 1);
  lowerStripe.scale(0.12, 0.035, 0.12);
  drawCube(lowerStripe, black);

  // paw = third part of chain
  let paw = new Matrix4();
  paw.setTranslate(x + 0.03, y - 0.63, z);
  paw.scale(0.18, 0.08, 0.16);
  drawCube(paw, black);
}