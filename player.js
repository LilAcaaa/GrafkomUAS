import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class Player {
  constructor(camera,scene, speed,positionObject) {
    this.camera = camera;
    this.controller = new PlayerController(camera,positionObject); // Pass the camera here
    this.scene = scene;
    this.speed = speed;
    this.state = "idle";
    this.rotationVector = new THREE.Vector3(0, 0, 0);
    this.animations = {};
    this.lastRotation = 0;
    this.positionObject = positionObject;

    this.camera.setup(positionObject);

    this.loadModel();
  }

  loadModel() {
    var loader = new GLTFLoader();
    loader.setPath("Minecraft/");
    loader.load('bee_minecraft.glb', (gltf) => {
        const fbx = gltf.scene;
        const animations = gltf.animations;
        
        fbx.traverse((c) => {
            if (c.isMesh) {
                c.castShadow = true;
                c.receiveShadow = true;
            }
        });
        
        this.mesh = fbx;
        this.scene.add(this.mesh);
        this.mesh.position.set(10, 50, -60);
        this.mesh.scale.set(1, 1, 1);
        this.mesh.rotation.y += Math.PI / -2;

        this.mixer = new THREE.AnimationMixer(this.mesh);

        var onLoad = (animName, anim) => {
            const clip = anim.animations[14]; // Adjust the index as needed
            const action = this.mixer.clipAction(clip);
            action.timeScale = 4;

            this.animations[animName] = {
                clip: clip,
                action: action,
            };
        };

        // Assuming the animation is included in the same file and you want to load it immediately
        onLoad("idle", { animations });

        // Apply textures if needed (assuming the textures are already embedded in the GLB)
        const textureLoader = new THREE.TextureLoader();
        textureLoader.setPath("Minecraft/textures/");
        const texture = textureLoader.load('Bee_Texture_baseColor.png');
        
        fbx.traverse((node) => {
            if (node.isMesh) {
                node.material.map = texture;
                node.material.needsUpdate = true;
            }
        });
    }, undefined, (error) => {
        console.error('An error occurred while loading the model', error);
    });
}


  update(dt) {
    if (this.mesh && this.animations) {
      this.lastRotation = this.mesh.rotation.y;

      var forwardVector = new THREE.Vector3();
      this.camera.camera.getWorldDirection(forwardVector);
      forwardVector.normalize();
      forwardVector = new THREE.Vector3(forwardVector.x,0,forwardVector.z);

      var direction = new THREE.Vector3(0, 0, 0);

      if (this.controller.keys["forward"]) {
        this.mesh.position.add(
          forwardVector.multiplyScalar(dt * this.speed)
        );
        const angle = Math.atan2(forwardVector.x, forwardVector.z);
        this.mesh.rotation.y = angle + Math.PI;
        console.log(angle);
      }
      if (this.controller.keys["backward"]) {
        this.mesh.position.add(
          forwardVector.multiplyScalar(dt * -this.speed)
        );
        const angle = Math.atan2(forwardVector.x, forwardVector.z);
        this.mesh.rotation.y = angle+ Math.PI;
      }
      if (this.controller.keys["left"]) {
        // Calculate left vector by rotating the forward vector 90 degrees around the up axis
        const leftVector = new THREE.Vector3(forwardVector.z, 0, -forwardVector.x).normalize();
        this.mesh.position.add(
          leftVector.multiplyScalar(dt * this.speed)
        );
        const angle = Math.atan2(forwardVector.x, forwardVector.z);
        this.mesh.rotation.y = angle + Math.PI*3/2;
      }
      if (this.controller.keys["right"]) {
        // Calculate right vector by rotating the forward vector -90 degrees around the up axis
        const rightVector = new THREE.Vector3(-forwardVector.z, 0, forwardVector.x).normalize();
        this.mesh.position.add(
          rightVector.multiplyScalar(dt * this.speed)
        );
        const angle = Math.atan2(forwardVector.x, forwardVector.z);
        this.mesh.rotation.y = angle - Math.PI*3/2;
      }
      this.lastRotation = this.mesh.rotation.y;
      if (direction.length() == 0) {
        if (this.animations["idle"]) {
          if (this.state != "idle") {
            this.mixer.stopAllAction();
            this.state = "idle";
          }
          this.mixer.clipAction(this.animations["idle"].clip).play();
        }
      } else {
        if (this.animations["run"]) {
          if (this.state != "run") {
            this.mixer.stopAllAction();
            this.state = "run";
          }
          this.mixer.clipAction(this.animations["run"].clip).play();
        }
      }

      if (this.controller.mouseDown) {
        var dtMouse = this.controller.deltaMousePos;
        dtMouse.x = dtMouse.x / Math.PI;
        dtMouse.y = dtMouse.y / Math.PI;

        // this.rotationVector.y += dtMouse.x * dt * 10;
        // this.rotationVector.z += dtMouse.y * dt * 10;
        this.rotationVector.y += dtMouse.x * dt * 0; // untuk dia tidak rotate pas diem
        this.rotationVector.z += dtMouse.y * dt * 0;
      }
      this.mesh.rotation.y += this.rotationVector.y;

      // var forwardVector = new THREE.Vector3(1, 0, 0);
      // var rightVector = new THREE.Vector3(0, 0, 1);
      // forwardVector.applyAxisAngle(
      //   new THREE.Vector3(0, 1, 0),
      //   this.rotationVector.y
      // );
      // rightVector.applyAxisAngle(
      //   new THREE.Vector3(0, 1, 0),
      //   this.rotationVector.y
      // );


      

      this.camera.setup(this.positionObject);

      this.positionObject = this.mesh.position;

      if (this.mixer) {
        this.mixer.update(dt);
      }
    }
  }
}

export class PlayerController {
  constructor(ThirdPersonCamera,positionObject) { // Add camera parameter here
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
    };
    this.mousePos = new THREE.Vector2();
    this.mouseDown = false;
    this.deltaMousePos = new THREE.Vector2();
    this.ThirdPersonCamera = ThirdPersonCamera; // Store camera reference

    // Variables for rotation around a specific point
    this.center = positionObject; // Center of rotation, e.g., origin
    

    document.addEventListener("keydown", (e) => this.onKeyDown(e), false);
    document.addEventListener("keyup", (e) => this.onKeyUp(e), false);
    document.addEventListener("mousemove", (e) => this.onMouseMove(e), false);
    document.addEventListener("mousedown", (e) => this.onMouseDown(e), false);
    document.addEventListener("mouseup", (e) => this.onMouseUp(e), false);
    document.addEventListener("wheel", (e) => this.onMouseWheel(e), false);
  }
  onMouseDown(event) {
    this.mouseDown = true;
  }
  onMouseUp(event) {
    this.mouseDown = false;
  }
  onMouseMove(event) {
    if (!this.mouseDown) return;

    this.center = this.ThirdPersonCamera.positionObject;
    console.log(this.center);

    const deltaX = (event.movementX || event.mozMovementX || event.webkitMovementX || 0) * 0.01; // Convert mouse position to angle
    const deltaY = (event.movementY || event.mozMovementY || event.webkitMovementY || 0) * 0.01; // Vertical rotation

    this.ThirdPersonCamera.theta += deltaX; // Update theta based on horizontal movement
    this.ThirdPersonCamera.phi += deltaY; // Update phi based on vertical movement
    // Ensure phi stays within the range of [-π/2, π/2] to avoid flipping the camera
    this.ThirdPersonCamera.phi = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.ThirdPersonCamera.phi));


    this.ThirdPersonCamera.updateCameraPosition();
    this.ThirdPersonCamera.camera.lookAt(this.center);

  }
  onWheel(event) {
    if (this.player) {
        this.player.camera.adjustZoom(event.deltaY);
    }
}
  onKeyDown(event) {
    switch (event.keyCode) {
      case "W".charCodeAt(0):
      case "w".charCodeAt(0):
        this.keys["forward"] = true;
        break;
      case "S".charCodeAt(0):
      case "s".charCodeAt(0):
        this.keys["backward"] = true;
        break;
      case "A".charCodeAt(0):
      case "a".charCodeAt(0):
        this.keys["left"] = true;
        break;
      case "D".charCodeAt(0):
      case "d".charCodeAt(0):
        this.keys["right"] = true;
        break;
      case "I".charCodeAt(0):
      case "i".charCodeAt(0):
        this.ThirdPersonCamera.zoom(1); // Zoom in
        break;
      case "O".charCodeAt(0):
      case "o".charCodeAt(0):
        this.ThirdPersonCamera.zoom(-1); // Zoom out
        break;
    }
  }
  onKeyUp(event) {
    switch (event.keyCode) {
      case "W".charCodeAt(0):
      case "w".charCodeAt(0):
        this.keys["forward"] = false;
        break;
      case "S".charCodeAt(0):
      case "s".charCodeAt(0):
        this.keys["backward"] = false;
        break;
      case "A".charCodeAt(0):
      case "a".charCodeAt(0):
        this.keys["left"] = false;
        break;
      case "D".charCodeAt(0):
      case "d".charCodeAt(0):
        this.keys["right"] = false;
        break;
      case "I".charCodeAt(0):
      case "i".charCodeAt(0):
        this.ThirdPersonCamera.zoom(1); // Zoom in
        break;
      case "O".charCodeAt(0):
      case "o".charCodeAt(0):
        this.ThirdPersonCamera.zoom(-0.1); // Zoom out
        break;
    }
  }
}

export class ThirdPersonCamera {
  constructor(camera, positionOffset, targetOffset) {
    this.camera = camera;
    this.positionOffset = positionOffset;
    this.targetOffset = targetOffset;
    this.zoomLevel = 0.125; // Default zoom level

    this.camera.rotation.order = 'YXZ'; // Set rotation order if needed
    this.doOnce = false;
    this.radius = 100; // Distance from target
    // this.positionObject = new THREE.Vector3(); // Target position
    this.positionObject = 0;

    // this.theta = Math.PI; // Start behind the target
    this.theta = 0;
    // this.phi = Math.PI / 6; // Start above the target
    this.phi = 0;
  }

  // Function to update camera position based on spherical coordinates
  updateCameraPosition() {
    const x = this.positionObject.x + this.radius * Math.sin(this.phi) * Math.cos(this.theta) * this.zoomLevel;
    const y = this.positionObject.y + this.radius * Math.cos(this.phi) * this.zoomLevel + 5; // Above the target
    const z = this.positionObject.z + this.radius * Math.sin(this.phi) * Math.sin(this.theta) * this.zoomLevel;

    this.camera.position.set(x, y, z);
    // this.camera.lookAt(this.positionObject);
  }

  // setup(positionObject) {
  //   this.positionObject.copy(positionObject);
  //   this.updateCameraPosition();
  // }

  setup(positionObject) {
    if(!this.doOnce){
      this.doOnce = true;
      this.camera.lookAt(positionObject);
      
    }
    this.positionObject = positionObject;
    this.updateCameraPosition(this.theta,this.phi);

  }

  adjustZoom(deltaY) {
    if (this.isFirstPerson) return;

    const zoomSpeed = 0.001; 
    this.targetZoomLevel = THREE.MathUtils.clamp(this.targetZoomLevel + (deltaY * zoomSpeed), 1, 2);

    const minFocalLength = 10;
    const maxFocalLength = 30; 
    const focalLength = THREE.MathUtils.lerp(maxFocalLength, minFocalLength, this.targetZoomLevel / 2);

    this.camera.setFocalLength(focalLength);
    this.camera.updateProjectionMatrix();
}
}
