var VERTEX_SHADER = `
    precision mediump float;
    attribute vec3 a_Position;
    attribute vec3 a_Color;
    attribute vec2 a_UV;
    varying vec3 v_Color;
    varying vec2 v_UV;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_viewMatrix;
    uniform mat4 u_projectionMatrix;
    void main() {
        v_Color = a_Color;
        v_UV    = a_UV;
        gl_Position = u_projectionMatrix * u_viewMatrix * u_ModelMatrix * vec4(a_Position, 1.0);
    }
`;

var FRAGMENT_SHADER = `
    precision mediump float;
    varying vec3 v_Color;
    varying vec2 v_UV;
    uniform sampler2D u_Sampler;
    uniform float     u_texColorWeight;
    uniform vec4      u_baseColor;
    void main() {
        vec4 texColor = texture2D(u_Sampler, v_UV);
        float t       = u_texColorWeight;
        gl_FragColor  = (1.0 - t) * u_baseColor + t * texColor;
    }
`;

// 32x32 world map
var g_map = [
    [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
    [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
    [4,0,0,2,2,2,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,4],
    [4,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,4],
    [4,0,0,2,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
    [4,0,0,0,0,0,3,0,3,0,0,0,0,0,0,0,0,0,0,0,3,3,3,0,0,0,0,0,0,0,0,4],
    [4,0,0,0,0,0,3,0,3,0,0,0,0,0,0,0,0,0,0,0,3,0,3,0,0,0,0,0,0,0,0,4],
    [4,0,0,0,0,0,3,3,3,0,0,4,4,4,0,0,0,0,0,0,3,0,3,0,0,0,0,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,0,0,0,4,0,4,0,0,0,0,0,0,3,3,3,0,0,0,0,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,0,0,0,4,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,0,0,0,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,4],
    [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,2,0,0,4],
    [4,0,0,2,0,0,0,0,0,0,0,0,0,0,0,3,3,3,0,0,0,0,0,0,0,0,2,0,2,0,0,4],
    [4,4,0,2,0,0,0,0,0,0,0,0,0,0,0,3,0,3,0,0,0,0,0,0,0,0,2,2,2,0,0,4],
    [4,0,0,2,0,0,0,0,0,0,0,0,0,0,0,3,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
    [4,0,0,2,2,2,0,0,0,0,0,0,0,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
    [4,0,0,0,0,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,4],
    [4,0,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,3,0,0,3,0,0,0,0,0,0,4],
    [4,0,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,3,0,0,3,0,0,0,0,0,0,4],
    [4,0,0,0,0,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
    [4,0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
    [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
];

// WebGL globals
var gl;
var camera;
var wallBuffer, groundBuffer, skyBuffer;
var wallVertexCount, groundVertexCount, skyVertexCount;
var textureReady = false;

// Mouse drag tracking
var g_mouseDownX  = 0;
var g_mouseDownY  = 0;
var g_wasDragging = false;

// Game state
var g_gameState = 'playing';   // 'playing' | 'won' | 'lost'
var g_golemX    = 28.0;
var g_golemZ    = 28.0;
var g_goalX     = 29;
var g_goalZ     = 2;
var g_frame     = 0;
var g_golemBuf  = null;
var g_goalBuf   = null;
var g_cubeTmpl  = null;        // raw cube vertices reused for characters

// ---- Transform helpers ----

function applyTransform(src, tx, ty, tz, sx, sy, sz) {
    var out = new Float32Array(src.length);
    for (var i = 0; i < src.length; i += 8) {
        out[i]   = src[i]   * sx + tx;
        out[i+1] = src[i+1] * sy + ty;
        out[i+2] = src[i+2] * sz + tz;
        out[i+3] = src[i+3];
        out[i+4] = src[i+4];
        out[i+5] = src[i+5];
        out[i+6] = src[i+6];
        out[i+7] = src[i+7];
    }
    return out;
}

// ---- Mesh builders ----

function buildWallMesh() {
    var parts = [];
    for (var z = 0; z < 32; z++) {
        for (var x = 0; x < 32; x++) {
            var h = g_map[z][x];
            for (var y = 0; y < h; y++) {
                parts.push(applyTransform(g_cubeTmpl, x, y + 0.5, z, 0.5, 0.5, 0.5));
            }
        }
    }
    if (parts.length === 0) return new Float32Array(0);
    var total = 0;
    for (var i = 0; i < parts.length; i++) total += parts[i].length;
    var combined = new Float32Array(total);
    var off = 0;
    for (var i = 0; i < parts.length; i++) { combined.set(parts[i], off); off += parts[i].length; }
    return combined;
}

function buildGroundMesh() {
    return applyTransform(g_cubeTmpl, 16, -0.05, 16, 16, 0.05, 16);
}

function buildSkyMesh() {
    return applyTransform(g_cubeTmpl, 16, 16, 16, 250, 250, 250);
}

// ---- Buffer helpers ----

function createBuffer(data) {
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buf;
}

function uploadToBuffer(buf, data) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
}

// ---- Draw ----

function drawMesh(buffer, vertexCount, texWeight, r, g, b, a) {
    if (!buffer || vertexCount === 0) return;
    var F = Float32Array.BYTES_PER_ELEMENT;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    var aPos = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 8 * F, 0);
    gl.enableVertexAttribArray(aPos);

    var aCol = gl.getAttribLocation(gl.program, "a_Color");
    gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 8 * F, 3 * F);
    gl.enableVertexAttribArray(aCol);

    var aUV = gl.getAttribLocation(gl.program, "a_UV");
    gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 8 * F, 6 * F);
    gl.enableVertexAttribArray(aUV);

    var identity = new Matrix4();
    gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, "u_ModelMatrix"),  false, identity.elements);
    gl.uniform1f(gl.getUniformLocation(gl.program, "u_texColorWeight"), texWeight);
    gl.uniform4f(gl.getUniformLocation(gl.program, "u_baseColor"), r, g, b, a);

    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
}

// ---- Game logic ----

function dist2D(ax, az, bx, bz) {
    var dx = ax - bx, dz = az - bz;
    return Math.sqrt(dx * dx + dz * dz);
}

function updateGolemBuffer() {
    uploadToBuffer(g_golemBuf, applyTransform(g_cubeTmpl, g_golemX, 0.5, g_golemZ, 0.5, 0.5, 0.5));
}

function tickGame() {
    if (g_gameState !== 'playing') return;
    g_frame++;

    var px = camera.eye.elements[0];
    var pz = camera.eye.elements[2];

    // Move golem every 80 frames (~1.3 s at 60fps)
    if (g_frame % 80 === 0) {
        var dx = px - g_golemX;
        var dz = pz - g_golemZ;
        var len = Math.sqrt(dx * dx + dz * dz);
        if (len > 0.1) {
            g_golemX += (dx / len) * 0.9;
            g_golemZ += (dz / len) * 0.9;
        }
        updateGolemBuffer();
    }

    // Update HUD
    var golemDist = dist2D(g_golemX, g_golemZ, px, pz);
    var goalDist  = dist2D(g_goalX,  g_goalZ,  px, pz);
    var golemStr  = golemDist < 5  ? '🔴 Golem: CLOSE!' :
                    golemDist < 12 ? '🔴 Golem: nearby' :
                                     '🔴 Golem: far away';
    var goalStr   = goalDist < 4 ? '🟡 Treasure: almost there!' :
                                   '🟡 Find the golden treasure!';
    document.getElementById('hudGolem').textContent = golemStr;
    document.getElementById('hudGoal').textContent  = goalStr;

    // Check lose
    if (golemDist < 1.5) {
        g_gameState = 'lost';
        showGameOverlay('CAUGHT!', 'The dungeon golem grabbed you...', '#cc2222');
        return;
    }

    // Check win
    if (goalDist < 2.0) {
        g_gameState = 'won';
        showGameOverlay('YOU ESCAPED!', 'You seized the golden treasure and fled the dungeon!', '#ddaa00');
    }
}

function showGameOverlay(title, msg, color) {
    var el = document.getElementById('gameOverlay');
    el.style.display    = 'block';
    el.style.borderColor = color;
    document.getElementById('overlayTitle').style.color = color;
    document.getElementById('overlayTitle').textContent = title;
    document.getElementById('overlayMsg').textContent   = msg;
}

function restartGame() {
    g_gameState = 'playing';
    g_golemX    = 28.0;
    g_golemZ    = 28.0;
    g_frame     = 0;

    camera.eye.elements[0]    = 4;
    camera.eye.elements[1]    = 0.5;
    camera.eye.elements[2]    = 4;
    camera.center.elements[0] = 5;
    camera.center.elements[1] = 0.5;
    camera.center.elements[2] = 4;
    camera.updateView();

    document.getElementById('gameOverlay').style.display = 'none';
    updateGolemBuffer();
}

// ---- Render loop ----

function animate() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, "u_viewMatrix"),       false, camera.viewMatrix.elements);
    gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, "u_projectionMatrix"), false, camera.projectionMatrix.elements);

    // Sky (solid blue)
    drawMesh(skyBuffer,    skyVertexCount,    0.0,  0.20, 0.50, 0.90, 1.0);

    // Ground + walls (textured once ready, fallback colors otherwise)
    var tw = textureReady ? 1.0 : 0.0;
    drawMesh(groundBuffer, groundVertexCount, tw,   0.35, 0.25, 0.10, 1.0);
    drawMesh(wallBuffer,   wallVertexCount,   tw,   0.55, 0.40, 0.30, 1.0);

    // Golem (red) and treasure (gold) - always solid color
    drawMesh(g_golemBuf, 36, 0.0, 0.85, 0.05, 0.05, 1.0);
    drawMesh(g_goalBuf,  36, 0.0, 1.00, 0.80, 0.00, 1.0);

    tickGame();
    requestAnimationFrame(animate);
}

// ---- Texture ----

function loadTexture() {
    var texture = gl.createTexture();
    var img = new Image();
    img.onload = function () {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        gl.uniform1i(gl.getUniformLocation(gl.program, "u_Sampler"), 0);
        textureReady = true;
    };
    img.onerror = function () { console.log("Texture not found - using fallback colors."); };
    img.src = "../textures/block.jpg";
}

// ---- World edits ----

function rebuildWalls() {
    var data = buildWallMesh();
    wallVertexCount = data.length / 8;
    gl.bindBuffer(gl.ARRAY_BUFFER, wallBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
}

function getBlockInFront() {
    var fx = camera.center.elements[0] - camera.eye.elements[0];
    var fz = camera.center.elements[2] - camera.eye.elements[2];
    var len = Math.sqrt(fx * fx + fz * fz);
    if (len === 0) return null;
    var bx = Math.round(camera.eye.elements[0] + (fx / len) * 2);
    var bz = Math.round(camera.eye.elements[2] + (fz / len) * 2);
    if (bx >= 0 && bx < 32 && bz >= 0 && bz < 32) return { x: bx, z: bz };
    return null;
}

function addBlockInFront() {
    var b = getBlockInFront();
    if (b && g_map[b.z][b.x] < 4) { g_map[b.z][b.x]++; rebuildWalls(); }
}

function deleteBlockInFront() {
    var b = getBlockInFront();
    console.log("deleteBlockInFront called, block:", b, b ? "height=" + g_map[b.z][b.x] : "null");
    if (b && g_map[b.z][b.x] > 0) { g_map[b.z][b.x]--; rebuildWalls(); }
}

// ---- Input ----

function keydown(ev) {
    if (g_gameState !== 'playing' && ev.key !== 'r' && ev.key !== 'R') return;
    switch (ev.key) {
        case 'w': case 'W': camera.moveForward();   break;
        case 's': case 'S': camera.moveBackwards(); break;
        case 'a': case 'A': camera.moveLeft();      break;
        case 'd': case 'D': camera.moveRight();     break;
        case 'q': case 'Q': camera.panLeft();       break;
        case 'e': case 'E': camera.panRight();      break;
        case 'r': case 'R': restartGame();          break;
    }
}

function setupMouseControls(canvas) {
    canvas.addEventListener('mousedown', function (ev) {
        // Right click: delete block in front
        // mousedown fires before any context menu, making it the most reliable event for this
        if (ev.button === 2) {
            ev.preventDefault();
            ev.stopPropagation();
            console.log("Right mousedown - deleting block");
            deleteBlockInFront();
            return;
        }
        // Left button: begin drag/click tracking
        if (ev.button === 0) {
            g_mouseDownX  = ev.clientX;
            g_mouseDownY  = ev.clientY;
            g_wasDragging = false;
        }
    });

    canvas.addEventListener('mousemove', function (ev) {
        if (ev.buttons !== 1) return;
        var moved = Math.abs(ev.clientX - g_mouseDownX) + Math.abs(ev.clientY - g_mouseDownY);
        if (moved > 4) g_wasDragging = true;
        if (g_wasDragging) {
            var dx = ev.movementX;
            if      (dx > 0) camera.panRight(dx * 0.3);
            else if (dx < 0) camera.panLeft(-dx * 0.3);
        }
    });

    // Left click: add block (guard against right-click firing click in some browsers)
    canvas.addEventListener('click', function (ev) {
        if (ev.button !== 0) return;
        if (!g_wasDragging) addBlockInFront();
        g_wasDragging = false;
    });

    // Suppress browser context menu
    canvas.addEventListener('contextmenu', function (ev) {
        ev.preventDefault();
        return false;
    });
}

// ---- Entry point ----

function main() {
    var canvas = document.getElementById("webgl");

    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) { console.log("ERROR: WebGL not supported"); return; }

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.2, 0.5, 0.9, 1.0);

    if (!initShaders(gl, VERTEX_SHADER, FRAGMENT_SHADER)) {
        console.log("ERROR: Shader compile failed");
        return;
    }

    // Store template cube vertices once so all mesh builders share it
    g_cubeTmpl = new cube().vertices;

    var wallData   = buildWallMesh();
    wallVertexCount   = wallData.length / 8;
    wallBuffer        = createBuffer(wallData);

    var groundData = buildGroundMesh();
    groundVertexCount = groundData.length / 8;
    groundBuffer      = createBuffer(groundData);

    var skyData    = buildSkyMesh();
    skyVertexCount    = skyData.length / 8;
    skyBuffer         = createBuffer(skyData);

    // Game characters
    g_golemBuf = createBuffer(applyTransform(g_cubeTmpl, g_golemX, 0.5, g_golemZ, 0.5, 0.5, 0.5));
    g_goalBuf  = createBuffer(applyTransform(g_cubeTmpl, g_goalX,  0.5, g_goalZ,  0.5, 0.5, 0.5));

    camera = new Camera(canvas.width / canvas.height, 0.1, 1000);

    document.addEventListener('keydown', keydown);
    setupMouseControls(canvas);

    animate();
    loadTexture();
}