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

    moveForward(speed = 0.3) {
        let f = new Vector3();
        f.set(this.center);
        f.sub(this.eye);
        f.normalize();
        f.mul(speed);
        this.eye.add(f);
        this.center.add(f);
        this.updateView();
    }

    moveBackwards(speed = 0.3) {
        let b = new Vector3();
        b.set(this.eye);
        b.sub(this.center);
        b.normalize();
        b.mul(speed);
        this.eye.add(b);
        this.center.add(b);
        this.updateView();
    }

    moveLeft(speed = 0.3) {
        let f = new Vector3();
        f.set(this.center);
        f.sub(this.eye);

        let s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(speed);
        this.eye.add(s);
        this.center.add(s);
        this.updateView();
    }

    moveRight(speed = 0.3) {
        let f = new Vector3();
        f.set(this.center);
        f.sub(this.eye);

        let s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(speed);
        this.eye.add(s);
        this.center.add(s);
        this.updateView();
    }

    panLeft(alpha = 5) {
        let f = new Vector3();
        f.set(this.center);
        f.sub(this.eye);

        let rotMatrix = new Matrix4();
        rotMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let fPrime = rotMatrix.multiplyVector3(f);

        this.center.set(this.eye);
        this.center.add(fPrime);
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