export class Cutscene {
  constructor(camera, positions, duration) {
    this.camera = camera;
    this.positions = positions;
    this.duration = duration;
    this.startTime = null;
    this.isPlaying = false;
  }

  start() {
    this.startTime = performance.now();
    this.isPlaying = true;
  }

  update() {
    if (!this.isPlaying) return;

    const currentTime = performance.now();
    const elapsedTime = (currentTime - this.startTime) / 1000; // in seconds
    const progress = Math.min(elapsedTime / this.duration, 1);

    const currentPosition = new THREE.Vector3().lerpVectors(
      this.positions[0],
      this.positions[1],
      progress
    );

    this.camera.position.copy(currentPosition);

    if (progress === 1) {
      this.isPlaying = false; // Cutscene finished
    }
  }
}
