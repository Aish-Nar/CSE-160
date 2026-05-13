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

var gl, camera;
var wallBuffer, groundBuffer, skyBuffer;
var wallVertexCount, groundVertexCount, skyVertexCount;
var textureReady  = false;
var g_cubeTmpl    = null;

// Mouse
var g_mouseDownX  = 0, g_mouseDownY = 0, g_wasDragging = false;

// Delete debounce so mousedown+contextmenu don't both fire
var g_lastDeleteMs = 0;

// Game
var g_gameState = 'playing';
var g_golemX = 28.0, g_golemZ = 28.0;
var g_goalX  = 29,   g_goalZ  = 2;
var g_frame  = 0;
var g_golemBuf = null, g_goalBuf = null;

// ---- Helpers ----

function applyTransform(src, tx, ty, tz, sx, sy, sz) {
    var out = new Float32Array(src.length);
    for (var i = 0; i < src.length; i += 8) {
        out[i]   = src[i]   * sx + tx;
        out[i+1] = src[i+1] * sy + ty;
        out[i+2] = src[i+2] * sz + tz;
        out[i+3] = src[i+3]; out[i+4] = src[i+4];
        out[i+5] = src[i+5]; out[i+6] = src[i+6];
        out[i+7] = src[i+7];
    }
    return out;
}

function buildWallMesh() {
    var parts = [];
    for (var z = 0; z < 32; z++)
        for (var x = 0; x < 32; x++)
            for (var y = 0; y < g_map[z][x]; y++)
                parts.push(applyTransform(g_cubeTmpl, x, y+0.5, z, 0.5, 0.5, 0.5));
    if (!parts.length) return new Float32Array(0);
    var total = 0;
    for (var i = 0; i < parts.length; i++) total += parts[i].length;
    var out = new Float32Array(total), off = 0;
    for (var i = 0; i < parts.length; i++) { out.set(parts[i], off); off += parts[i].length; }
    return out;
}

function createBuffer(data) {
    var b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return b;
}

function drawMesh(buf, count, tw, r, g, b, a) {
    if (!buf || !count) return;
    var F = Float32Array.BYTES_PER_ELEMENT;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    var aPos = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 8*F, 0);
    gl.enableVertexAttribArray(aPos);
    var aCol = gl.getAttribLocation(gl.program, "a_Color");
    gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 8*F, 3*F);
    gl.enableVertexAttribArray(aCol);
    var aUV = gl.getAttribLocation(gl.program, "a_UV");
    gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 8*F, 6*F);
    gl.enableVertexAttribArray(aUV);
    var id = new Matrix4();
    gl.uniformMatrix4fv(gl.getUniformLocation(gl.program,"u_ModelMatrix"),  false, id.elements);
    gl.uniform1f(gl.getUniformLocation(gl.program,"u_texColorWeight"), tw);
    gl.uniform4f(gl.getUniformLocation(gl.program,"u_baseColor"),      r, g, b, a);
    gl.drawArrays(gl.TRIANGLES, 0, count);
}

// ---- World edits ----

function rebuildWalls() {
    var d = buildWallMesh();
    wallVertexCount = d.length / 8;
    gl.bindBuffer(gl.ARRAY_BUFFER, wallBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, d, gl.DYNAMIC_DRAW);
}

function getBlockInFront() {
    var fx = camera.center.elements[0] - camera.eye.elements[0];
    var fz = camera.center.elements[2] - camera.eye.elements[2];
    var len = Math.sqrt(fx*fx + fz*fz);
    if (len === 0) return null;
    var bx = Math.round(camera.eye.elements[0] + (fx/len)*2);
    var bz = Math.round(camera.eye.elements[2] + (fz/len)*2);
    return (bx>=0 && bx<32 && bz>=0 && bz<32) ? {x:bx, z:bz} : null;
}

function addBlockInFront() {
    var b = getBlockInFront();
    if (b && g_map[b.z][b.x] < 4) { g_map[b.z][b.x]++; rebuildWalls(); }
}

// Called by BOTH right-click event handlers; debounce prevents double-firing
function tryDeleteBlock() {
    var now = Date.now();
    if (now - g_lastDeleteMs < 200) {
        console.log("Delete debounced (already fired recently)");
        return;
    }
    g_lastDeleteMs = now;

    var b = getBlockInFront();
    if (!b) {
        console.log("Delete: no valid cell in front");
        return;
    }
    console.log("Delete: cell x=" + b.x + " z=" + b.z + " height=" + g_map[b.z][b.x]);
    if (g_map[b.z][b.x] > 0) {
        g_map[b.z][b.x]--;
        rebuildWalls();
        console.log("Block removed. New height=" + g_map[b.z][b.x]);
    } else {
        console.log("Nothing to delete here (height already 0). Walk up to a wall first.");
    }
}

// ---- Game ----

function dist2D(ax,az,bx,bz) { var dx=ax-bx,dz=az-bz; return Math.sqrt(dx*dx+dz*dz); }

function updateGolemBuf() {
    var d = applyTransform(g_cubeTmpl, g_golemX, 0.5, g_golemZ, 0.5, 0.5, 0.5);
    gl.bindBuffer(gl.ARRAY_BUFFER, g_golemBuf);
    gl.bufferData(gl.ARRAY_BUFFER, d, gl.DYNAMIC_DRAW);
}

function tickGame() {
    if (g_gameState !== 'playing') return;
    g_frame++;
    var px = camera.eye.elements[0], pz = camera.eye.elements[2];

    if (g_frame % 80 === 0) {
        var dx = px - g_golemX, dz = pz - g_golemZ;
        var len = Math.sqrt(dx*dx + dz*dz);
        if (len > 0.1) { g_golemX += (dx/len)*0.9; g_golemZ += (dz/len)*0.9; }
        updateGolemBuf();
    }

    var gd = dist2D(g_golemX, g_golemZ, px, pz);
    var od = dist2D(g_goalX,  g_goalZ,  px, pz);

    document.getElementById('hudGolem').textContent =
        gd < 5  ? '🔴 Golem: RIGHT BEHIND YOU!' :
        gd < 12 ? '🔴 Golem: nearby' : '🔴 Golem: far away';
    document.getElementById('hudGoal').textContent =
        od < 4  ? '🟡 Treasure: ALMOST THERE!' : '🟡 Find the golden treasure!';

    if (gd < 1.5) { endGame('lost'); }
    if (od < 2.0) { endGame('won'); }
}

function endGame(result) {
    g_gameState = result;
    var el = document.getElementById('gameOverlay');
    el.style.display = 'block';
    if (result === 'won') {
        el.style.borderColor = '#ddaa00';
        document.getElementById('overlayTitle').style.color = '#ddaa00';
        document.getElementById('overlayTitle').textContent = 'YOU ESCAPED!';
        document.getElementById('overlayMsg').textContent   = 'You seized the golden treasure and fled the dungeon!';
    } else {
        el.style.borderColor = '#cc2222';
        document.getElementById('overlayTitle').style.color = '#cc2222';
        document.getElementById('overlayTitle').textContent = 'CAUGHT!';
        document.getElementById('overlayMsg').textContent   = 'The dungeon golem grabbed you from behind...';
    }
}

function restartGame() {
    console.log("restartGame() called");
    g_gameState = 'playing';
    g_golemX = 28.0; g_golemZ = 28.0; g_frame = 0;
    camera.eye.elements[0] = 4; camera.eye.elements[1] = 0.5; camera.eye.elements[2] = 4;
    camera.center.elements[0] = 5; camera.center.elements[1] = 0.5; camera.center.elements[2] = 4;
    camera.updateView();
    document.getElementById('gameOverlay').style.display = 'none';
    updateGolemBuf();
}

// ---- Render ----

function animate() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(gl.getUniformLocation(gl.program,"u_viewMatrix"),       false, camera.viewMatrix.elements);
    gl.uniformMatrix4fv(gl.getUniformLocation(gl.program,"u_projectionMatrix"), false, camera.projectionMatrix.elements);

    drawMesh(skyBuffer,    skyVertexCount,    0.0, 0.20,0.50,0.90,1.0);
    var tw = textureReady ? 1.0 : 0.0;
    drawMesh(groundBuffer, groundVertexCount, tw,  0.35,0.25,0.10,1.0);
    drawMesh(wallBuffer,   wallVertexCount,   tw,  0.55,0.40,0.30,1.0);
    drawMesh(g_golemBuf,   36,               0.0, 0.85,0.05,0.05,1.0);
    drawMesh(g_goalBuf,    36,               0.0, 1.00,0.80,0.00,1.0);

    tickGame();
    requestAnimationFrame(animate);
}

// ---- Texture ----

function loadTexture() {
    var tex = gl.createTexture();
    var img = new Image();
    img.onload = function() {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        gl.uniform1i(gl.getUniformLocation(gl.program,"u_Sampler"), 0);
        textureReady = true;
    };
    img.onerror = function() { console.log("Texture not found - using fallback colors."); };
    img.src = "../textures/block.jpg";
}

// ---- Input ----

function keydown(ev) {
    // R always restarts regardless of game state
    if (ev.key === 'r' || ev.key === 'R') { restartGame(); return; }
    // All other keys only work while playing
    if (g_gameState !== 'playing') return;
    switch (ev.key) {
        case 'w': case 'W': camera.moveForward();   break;
        case 's': case 'S': camera.moveBackwards(); break;
        case 'a': case 'A': camera.moveLeft();      break;
        case 'd': case 'D': camera.moveRight();     break;
        case 'q': case 'Q': camera.panLeft();       break;
        case 'e': case 'E': camera.panRight();      break;
    }
}

function setupMouseControls(canvas) {
    // LEFT BUTTON: drag tracking
    canvas.addEventListener('mousedown', function(ev) {
        console.log("mousedown button=" + ev.button);
        if (ev.button === 0) {
            g_mouseDownX = ev.clientX; g_mouseDownY = ev.clientY; g_wasDragging = false;
        }
        if (ev.button === 2) {
            ev.preventDefault();
            tryDeleteBlock();  // attempt 1 of 2
        }
    });

    canvas.addEventListener('mousemove', function(ev) {
        if (ev.buttons !== 1) return;
        if (Math.abs(ev.clientX-g_mouseDownX)+Math.abs(ev.clientY-g_mouseDownY) > 4) g_wasDragging = true;
        if (g_wasDragging) {
            var dx = ev.movementX;
            if (dx > 0) camera.panRight(dx*0.3);
            else if (dx < 0) camera.panLeft(-dx*0.3);
        }
    });

    // Left click = add (guard ev.button so right-click can't trigger this)
    canvas.addEventListener('click', function(ev) {
        if (ev.button !== 0) return;
        if (!g_wasDragging) addBlockInFront();
        g_wasDragging = false;
    });

    // Right click via contextmenu = delete (debounce handles double-fire with mousedown)
    canvas.addEventListener('contextmenu', function(ev) {
        ev.preventDefault();
        console.log("contextmenu fired");
        tryDeleteBlock();  // attempt 2 of 2 (debounce ensures only one fires)
        return false;
    });
}

// ---- Entry ----

function main() {
    var canvas = document.getElementById("webgl");
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) { console.log("WebGL not supported"); return; }

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.2, 0.5, 0.9, 1.0);
    if (!initShaders(gl, VERTEX_SHADER, FRAGMENT_SHADER)) { console.log("Shader error"); return; }

    g_cubeTmpl = new cube().vertices;

    var wd = buildWallMesh();   wallVertexCount   = wd.length/8; wallBuffer   = createBuffer(wd);
    var grd = applyTransform(g_cubeTmpl,16,-0.05,16,16,0.05,16); groundVertexCount=grd.length/8; groundBuffer=createBuffer(grd);
    var sd  = applyTransform(g_cubeTmpl,16,16,16,250,250,250);   skyVertexCount   =sd.length/8;  skyBuffer   =createBuffer(sd);

    g_golemBuf = createBuffer(applyTransform(g_cubeTmpl, g_golemX, 0.5, g_golemZ, 0.5, 0.5, 0.5));
    g_goalBuf  = createBuffer(applyTransform(g_cubeTmpl, g_goalX,  0.5, g_goalZ,  0.5, 0.5, 0.5));

    camera = new Camera(canvas.width/canvas.height, 0.1, 1000);
    document.addEventListener('keydown', keydown);
    setupMouseControls(canvas);
    animate();
    loadTexture();
}