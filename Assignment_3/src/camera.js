 class Camera {
    constructor(aspectRatio, near, far) {
        this.fov = 60;
        this.eye    = new Vector3([4, 0.5, 4]);
        this.center = new Vector3([5, 0.5, 4]);
        this.up     = new Vector3([0, 1, 0]);

        this.viewMatrix = new Matrix4();
        this.updateView();

        this.projectionMatrix = new Matrix4();
        this.projectionMatrix.setPerspective(this.fov, aspectRatio, near, far);
    }

    // Move forward/backward purely in the XZ plane (no flying up or down)
    moveForward(speed = 0.3) {
        var fx = this.center.elements[0] - this.eye.elements[0];
        var fz = this.center.elements[2] - this.eye.elements[2];
        var len = Math.sqrt(fx * fx + fz * fz);
        if (len === 0) return;
        var dx = (fx / len) * speed;
        var dz = (fz / len) * speed;
        this.eye.elements[0]    += dx;
        this.eye.elements[2]    += dz;
        this.center.elements[0] += dx;
        this.center.elements[2] += dz;
        this.updateView();
    }

    moveBackwards(speed = 0.3) {
        this.moveForward(-speed);
    }

    // Strafe left/right in the XZ plane
    // Left vector = up x forward, projected onto XZ = (fz, -fx)
    moveLeft(speed = 0.3) {
        var fx = this.center.elements[0] - this.eye.elements[0];
        var fz = this.center.elements[2] - this.eye.elements[2];
        var len = Math.sqrt(fx * fx + fz * fz);
        if (len === 0) return;
        var dx = (fz / len) * speed;
        var dz = (-fx / len) * speed;
        this.eye.elements[0]    += dx;
        this.eye.elements[2]    += dz;
        this.center.elements[0] += dx;
        this.center.elements[2] += dz;
        this.updateView();
    }

    moveRight(speed = 0.3) {
        this.moveLeft(-speed);
    }

    // Rotate camera horizontally using direct trig - no matrix library needed.
    // This avoids floating-point Y-drift that causes the camera to tilt skyward.
    panLeft(alpha = 5) {
        var rad = alpha * Math.PI / 180;
        var cos = Math.cos(rad);
        var sin = Math.sin(rad);

        // Forward direction (XZ only)
        var fx = this.center.elements[0] - this.eye.elements[0];
        var fz = this.center.elements[2] - this.eye.elements[2];

        // Rotate around Y axis
        var newFx =  fx * cos + fz * sin;
        var newFz = -fx * sin + fz * cos;

        // Place center relative to eye, forcing Y to stay level
        this.center.elements[0] = this.eye.elements[0] + newFx;
        this.center.elements[1] = this.eye.elements[1];   // hard-lock Y = no sky drift
        this.center.elements[2] = this.eye.elements[2] + newFz;

        this.updateView();
    }

    panRight(alpha = 5) {
        this.panLeft(-alpha);
    }

    updateView() {
        this.viewMatrix.setLookAt(
            this.eye.elements[0],    this.eye.elements[1],    this.eye.elements[2],
            this.center.elements[0], this.center.elements[1], this.center.elements[2],
            this.up.elements[0],     this.up.elements[1],     this.up.elements[2]
        );
    }
}