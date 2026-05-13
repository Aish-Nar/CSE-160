// Vertex shader
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

// Fragment shader with u_texColorWeight to blend between solid color and texture
var FRAGMENT_SHADER = `
    precision mediump float;

    varying vec3 v_Color;
    varying vec2 v_UV;

    uniform sampler2D u_Sampler;
    uniform float     u_texColorWeight;
    uniform vec4      u_baseColor;

    void main() {
        vec4 texColor  = texture2D(u_Sampler, v_UV);
        float t        = u_texColorWeight;
        gl_FragColor   = (1.0 - t) * u_baseColor + t * texColor;
    }
`;

// 32x32 map: each value is wall height (0 = open, 1-4 = wall blocks stacked)
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

var gl;
var camera;
var wallBuffer, groundBuffer, skyBuffer;
var wallVertexCount, groundVertexCount, skyVertexCount;

// Apply a scale+translate transform to raw vertex data (format: x,y,z,r,g,b,u,v)
function applyTransform(srcVerts, tx, ty, tz, sx, sy, sz) {
    var result = new Float32Array(srcVerts.length);
    for (var i = 0; i < srcVerts.length; i += 8) {
        result[i]   = srcVerts[i]   * sx + tx;
        result[i+1] = srcVerts[i+1] * sy + ty;
        result[i+2] = srcVerts[i+2] * sz + tz;
        result[i+3] = srcVerts[i+3];
        result[i+4] = srcVerts[i+4];
        result[i+5] = srcVerts[i+5];
        result[i+6] = srcVerts[i+6];
        result[i+7] = srcVerts[i+7];
    }
    return result;
}

// Build one big pre-transformed vertex buffer for every wall block in the map
function buildWallMesh() {
    var template = new cube();
    var parts = [];

    for (var z = 0; z < 32; z++) {
        for (var x = 0; x < 32; x++) {
            var h = g_map[z][x];
            for (var y = 0; y < h; y++) {
                // Scale 0.5 makes the cube span 1 unit; translate puts it at grid position
                parts.push(applyTransform(template.vertices, x, y + 0.5, z, 0.5, 0.5, 0.5));
            }
        }
    }

    if (parts.length === 0) return new Float32Array(0);

    var total = 0;
    for (var p of parts) total += p.length;

    var combined = new Float32Array(total);
    var offset = 0;
    for (var p of parts) { combined.set(p, offset); offset += p.length; }
    return combined;
}

// Large flat cube for the ground (covers the full 32x32 area)
function buildGroundMesh() {
    var template = new cube();
    return applyTransform(template.vertices, 16, -0.05, 16, 16, 0.05, 16);
}

// Huge cube for the sky box (solid blue via u_baseColor)
function buildSkyMesh() {
    var template = new cube();
    return applyTransform(template.vertices, 16, 16, 16, 250, 250, 250);
}

function createBuffer(data) {
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buf;
}

// Draw a pre-built vertex buffer.
// texWeight 0 = solid baseColor, 1 = full texture.
function drawMesh(buffer, vertexCount, texWeight, r, g, b, a) {
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

    // Identity model matrix - transforms are baked into vertex positions
    var identity = new Matrix4();
    gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, "u_ModelMatrix"), false, identity.elements);

    gl.uniform1f(gl.getUniformLocation(gl.program, "u_texColorWeight"), texWeight);
    gl.uniform4f(gl.getUniformLocation(gl.program, "u_baseColor"), r, g, b, a);

    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
}

function animate() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, "u_viewMatrix"),       false, camera.viewMatrix.elements);
    gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, "u_projectionMatrix"), false, camera.projectionMatrix.elements);

    // Sky - solid blue, no texture (texWeight = 0)
    drawMesh(skyBuffer,    skyVertexCount,    0.0,  0.2, 0.5, 0.9, 1.0);

    // Ground - pure texture
    drawMesh(groundBuffer, groundVertexCount, 1.0,  0, 0, 0, 1);

    // Walls - pure texture
    drawMesh(wallBuffer,   wallVertexCount,   1.0,  0, 0, 0, 1);

    requestAnimationFrame(animate);
}

function loadWorld() {
    var texture = gl.createTexture();
    var img = new Image();
    img.src = "textures/block.jpg";

    img.onload = function () {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        gl.uniform1i(gl.getUniformLocation(gl.program, "u_Sampler"), 0);

        var wallData   = buildWallMesh();
        wallVertexCount   = wallData.length / 8;
        wallBuffer        = createBuffer(wallData);

        var groundData = buildGroundMesh();
        groundVertexCount = groundData.length / 8;
        groundBuffer      = createBuffer(groundData);

        var skyData    = buildSkyMesh();
        skyVertexCount    = skyData.length / 8;
        skyBuffer         = createBuffer(skyData);

        animate();
    };
}

// Rebuild only the wall buffer after a map change
function rebuildWalls() {
    var wallData = buildWallMesh();
    wallVertexCount = wallData.length / 8;
    gl.bindBuffer(gl.ARRAY_BUFFER, wallBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, wallData, gl.STATIC_DRAW);
}

// Return the map cell directly in front of the camera
function getBlockInFront() {
    var f = new Vector3();
    f.set(camera.center);
    f.sub(camera.eye);
    f.normalize();

    var bx = Math.round(camera.eye.elements[0] + f.elements[0] * 1.5);
    var bz = Math.round(camera.eye.elements[2] + f.elements[2] * 1.5);

    if (bx >= 0 && bx < 32 && bz >= 0 && bz < 32) {
        return { x: bx, z: bz };
    }
    return null;
}

function addBlockInFront() {
    var b = getBlockInFront();
    if (b && g_map[b.z][b.x] < 4) {
        g_map[b.z][b.x]++;
        rebuildWalls();
    }
}

function deleteBlockInFront() {
    var b = getBlockInFront();
    if (b && g_map[b.z][b.x] > 0) {
        g_map[b.z][b.x]--;
        rebuildWalls();
    }
}

function keydown(ev) {
    switch (ev.key) {
        case 'w': case 'W': camera.moveForward();   break;
        case 's': case 'S': camera.moveBackwards(); break;
        case 'a': case 'A': camera.moveLeft();      break;
        case 'd': case 'D': camera.moveRight();     break;
        case 'q': case 'Q': camera.panLeft();       break;
        case 'e': case 'E': camera.panRight();      break;
    }
}

function main() {
    var canvas = document.getElementById("webgl");

    gl = getWebGLContext(canvas);
    if (!gl) { console.log("Failed to get WebGL context."); return; }

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.2, 0.5, 0.9, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (!initShaders(gl, VERTEX_SHADER, FRAGMENT_SHADER)) {
        console.log("Failed to compile shaders.");
        return;
    }

    camera = new Camera(canvas.width / canvas.height, 0.1, 1000);

    document.onkeydown = keydown;

    // Mouse look: drag to rotate camera
    canvas.onmousemove = function (ev) {
        if (ev.buttons === 1) {
            var dx = ev.movementX;
            if      (dx > 0) camera.panRight(dx * 0.3);
            else if (dx < 0) camera.panLeft(-dx * 0.3);
        }
    };

    // Simple Minecraft: left-click adds a block, right-click deletes one
    canvas.onclick = function () { addBlockInFront(); };
    canvas.oncontextmenu = function (ev) { ev.preventDefault(); deleteBlockInFront(); };

    loadWorld();
}