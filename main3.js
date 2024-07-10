import * as THREE from 'three';
import { OrbitControls, ThreeMFLoader } from 'three/examples/jsm/Addons.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Player, PlayerController, ThirdPersonCamera } from "./player4.js";

let mixer;
const clock = new THREE.Clock();

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const boxArrayBesar = [];

function buatBox(x, y, z, width, height, depth) {
  const geometry = new THREE.BoxGeometry(width, height, depth); // x, z, y
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.0 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  scene.add(mesh);

  const box = new THREE.Box3();
  box.setFromObject(mesh);
  boxArrayBesar.push(box);
  const helper = new THREE.Box3Helper(box, 0xffff00);
  scene.add(helper);

  return mesh;
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x37C6FF);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
); // Adjust near to 0.1 and far to 1000000

camera.position.set(0, 100, -20);
camera.lookAt(0, 50, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 50, 0);
controls.update();

const flyControls = new FlyControls(camera, renderer.domElement);
flyControls.movementSpeed = 100;
flyControls.rollSpeed = Math.PI / 24;
flyControls.autoForward = false;
flyControls.dragToLook = true;

// Add window resize listener
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Light
{
  const directionalLight = new THREE.DirectionalLight(0xFFF7DB, 12); // Adjust intensity
  directionalLight.position.set(0, 400, -600); // Position the light
  directionalLight.target.position.set(0, 0, 0);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048 * 4; // Reduce shadow map size for softer shadows
  directionalLight.shadow.mapSize.height = 2048 * 4;
  directionalLight.shadow.camera.near = 10;
  directionalLight.shadow.camera.far = 2500;
  directionalLight.shadow.camera.left = -2000;
  directionalLight.shadow.camera.right = 2000;
  directionalLight.shadow.camera.top = 2000;
  directionalLight.shadow.camera.bottom = -2000;
  directionalLight.shadow.bias = -0.0005; // Adjust shadow bias
  directionalLight.shadow.normalBias = 0.002; // Adjust normal bias
  directionalLight.shadow.intensity = 0.5;

  scene.add(directionalLight);
  scene.add(directionalLight.target);
  const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
  // scene.add(helper);

  var shadowlight = new THREE.DirectionalLight(0xFFF7DB);
  shadowlight.castShadow = true;
  shadowlight.position.set(0, 3, 0);
  scene.add(shadowlight);

  const ambientLight = new THREE.AmbientLight(0xfff7db, 0.5); // Adjust intensity
  scene.add(ambientLight);
}

function applyTexture(object, texturePath) {
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(texturePath, function (texture) {
    object.traverse(function (child) {
      if (child.isMesh) {
        child.material.map = texture;
        child.material.needsUpdate = true;
      }
    });
  });
}

// Load GLTF models
function loadGLTFModel(path, fileName, position, scale, opacity = 1.0) {
  const loader = new GLTFLoader().setPath(path);
  loader.load(fileName, async function (gltf) {
    const model = gltf.scene;
    await renderer.compileAsync(model, camera, scene);
    model.position.copy(position);
    model.scale.setScalar(scale);
    model.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        node.material.transparent = opacity < 1.0;
        node.material.opacity = opacity;
        node.material.needsUpdate = true;
      }
    });
    scene.add(model);
  });
}

// Plane
loadGLTFModel('Minecraft/', 'cutisland3.glb', new THREE.Vector3(0, 0, 0), 0.8);

// Portal
loadGLTFModel('Minecraft/', 'portalluar.glb', new THREE.Vector3(-14, 39, -41), 1.5);
loadGLTFModel('Minecraft/', 'portaldalam.glb', new THREE.Vector3(-14, 39, -40.5), 1.5, 0.4);

// Bee1
{
  var loader = new GLTFLoader().setPath('Minecraft/');
  loader.load('bee_minecraft.glb', async function (gltf) {
    const model = gltf.scene;
    const animations = gltf.animations;
    const mixer = new THREE.AnimationMixer(model);

    animations.forEach((clip) => {
      mixer.clipAction(clip).play();
    });

    await renderer.compileAsync(model, camera, scene);
    model.position.set(0, 48, -7.5);
    model.scale.setScalar(0.1);
    model.rotation.y = Math.PI / 4;
    model.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    scene.add(model);

    // Animate model position along the path
    function animateModelPosition() {
      const pathPoints = [
        new THREE.Vector3(0, 48, -7.5),
        new THREE.Vector3(0, 48, -17.5),
        new THREE.Vector3(0, 53, -10.5),
      ];

      const duration = 10; // Duration for one complete loop (in seconds)
      const loopStartTime = Date.now();

      function updateModelPosition() {
        const elapsedTime = (Date.now() - loopStartTime) / 1000;
        const loopTime = elapsedTime % duration;
        const t = loopTime / duration;

        const index = Math.floor(t * pathPoints.length);
        const nextIndex = (index + 1) % pathPoints.length;

        const start = pathPoints[index];
        const end = pathPoints[nextIndex];

        const factor = (t * pathPoints.length) % 1;
        const currentPosition = start.clone().lerp(end, factor);

        model.position.copy(currentPosition);

        requestAnimationFrame(updateModelPosition);
      }

      updateModelPosition();
    }

    animateModelPosition();

    function animate() {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      mixer.update(delta);
      renderer.render(scene, camera);
    }
    animate();
  });
}

// Bee2
{
  var loader = new GLTFLoader().setPath('Minecraft/');
  loader.load('bee_minecraft.glb', async function (gltf) {
    const model = gltf.scene;
    const animations = gltf.animations;
    const mixer = new THREE.AnimationMixer(model);

    animations.forEach((clip) => {
      mixer.clipAction(clip).play();
    });

    await renderer.compileAsync(model, camera, scene);
    model.position.set(2, 43, -4);
    model.scale.setScalar(0.15);
    model.rotation.y = Math.PI / 4;
    model.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    scene.add(model);

    // Animate model position along the path
    function animateModelPosition() {
      const pathPoints = [
        new THREE.Vector3(6, 60, -4),
        new THREE.Vector3(6, 60, -14),
        new THREE.Vector3(6, 72, -7.5),
      ];

      const duration = 8; // Duration for one complete loop (in seconds)
      const loopStartTime = Date.now();

      function updateModelPosition() {
        const elapsedTime = (Date.now() - loopStartTime) / 1000;
        const loopTime = elapsedTime % duration;
        const t = loopTime / duration;

        const index = Math.floor(t * pathPoints.length);
        const nextIndex = (index + 1) % pathPoints.length;

        const start = pathPoints[index];
        const end = pathPoints[nextIndex];

        const factor = (t * pathPoints.length) % 1;
        const currentPosition = start.clone().lerp(end, factor);

        model.position.copy(currentPosition);

        requestAnimationFrame(updateModelPosition);
      }

      updateModelPosition();
    }

    animateModelPosition();

    function animate() {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      mixer.update(delta);
      renderer.render(scene, camera);
    }
    animate();
  });
}

// Bee3
{
  var loader = new GLTFLoader().setPath('Minecraft/');
  loader.load('bee_minecraft.glb', async function (gltf) {
    const model = gltf.scene;
    const animations = gltf.animations;
    const mixer = new THREE.AnimationMixer(model);

    animations.forEach((clip) => {
      mixer.clipAction(clip).play();
    });

    await renderer.compileAsync(model, camera, scene);
    model.position.set(0, 48, -7.5);
    model.scale.setScalar(0.1);
    model.rotation.y = Math.PI / 4;
    model.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    scene.add(model);

    // Animate model position along the path
    function animateModelPosition() {
      const pathPoints = [
        new THREE.Vector3(8, 48, -7.5),
        new THREE.Vector3(8, 48, -17.5),
        new THREE.Vector3(8, 53, -10.5),
      ];

      const duration = 10; // Duration for one complete loop (in seconds)
      const loopStartTime = Date.now();

      function updateModelPosition() {
        const elapsedTime = (Date.now() - loopStartTime) / 1000;
        const loopTime = elapsedTime % duration;
        const t = loopTime / duration;

        const index = Math.floor(t * pathPoints.length);
        const nextIndex = (index + 1) % pathPoints.length;

        const start = pathPoints[index];
        const end = pathPoints[nextIndex];

        const factor = (t * pathPoints.length) % 1;
        const currentPosition = start.clone().lerp(end, factor);

        model.position.copy(currentPosition);

        requestAnimationFrame(updateModelPosition);
      }

      updateModelPosition();
    }

    animateModelPosition();

    function animate() {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      mixer.update(delta);
      renderer.render(scene, camera);
    }
    animate();
  });
}

// Camera animation
const keyframes = [
  { position: new THREE.Vector3(0, 100, -10), target: new THREE.Vector3(1,30,3), time: 0 },
  { position: new THREE.Vector3(2, 100, -20), target: new THREE.Vector3(1,30,3), time: 2 },
  { position: new THREE.Vector3(3, 100, -30), target: new THREE.Vector3(1,30,3), time: 4 },
  { position: new THREE.Vector3(6, 100, -40), target: new THREE.Vector3(1,30,3), time: 6 },
  { position: new THREE.Vector3(12, 90, -50), target: new THREE.Vector3(1,30,3), time: 8 },
  { position: new THREE.Vector3(18, 80, -60), target: new THREE.Vector3(1,30,3), time: 10 },
  { position: new THREE.Vector3(28, 70, -70), target: new THREE.Vector3(1,30,3), time: 12 },
  { position: new THREE.Vector3(35, 60, -80), target: new THREE.Vector3(1,30,3), time: 14 },
  { position: new THREE.Vector3(42, 50, -90), target: new THREE.Vector3(1,30,3), time: 16 },
  { position: new THREE.Vector3(24, 50, -100), target: new THREE.Vector3(1,30,3), time: 18 },
  { position: new THREE.Vector3(20, 50, -110), target: new THREE.Vector3(1,30,3), time: 20 },
  { position: new THREE.Vector3(0, 50, -100), target: new THREE.Vector3(1,30,3), time: 26 },
  { position: new THREE.Vector3(-18, 50, -100), target: new THREE.Vector3(1,30,3), time: 28 },
  { position: new THREE.Vector3(-12, 50, -40), target: new THREE.Vector3(1,30,3), time: 30 },
  { position: new THREE.Vector3(-12, 50, -40), target: new THREE.Vector3(1,30,3), time: 31 },
  { position: new THREE.Vector3(-12, 50, -40), target: new THREE.Vector3(26,40,0), time: 37 },
  { position: new THREE.Vector3(20, 80, -60), target: new THREE.Vector3(26,40,0), time: 46 },
  { position: new THREE.Vector3(40, 100, -75), target: new THREE.Vector3(45,45,0), time: 54 },
  { position: new THREE.Vector3(60, 90, -60), target: new THREE.Vector3(65,30,0), time: 62 },
  { position: new THREE.Vector3(0, 100, -10), target: new THREE.Vector3(1,30,3), time: 66 },
  
  

//   { position: new THREE.Vector3(42, 50, -90), target: new THREE.Vector3(1,30,3), time: 18 },
//   { position: new THREE.Vector3(35, 60, -80), target: new THREE.Vector3(1,30,3), time: 20 },
//   { position: new THREE.Vector3(28, 70, -70), target: new THREE.Vector3(1,30,3), time: 22 },
//   { position: new THREE.Vector3(18, 80, -60), target: new THREE.Vector3(1,30,3), time: 24 },
//   { position: new THREE.Vector3(12, 90, -50), target: new THREE.Vector3(1,30,3), time: 26 },
//   { position: new THREE.Vector3(6, 100, -40), target: new THREE.Vector3(1,30,3), time: 28 },
//   { position: new THREE.Vector3(3, 100, -30), target: new THREE.Vector3(1,30,3), time: 30 },
//   { position: new THREE.Vector3(2, 100, -20), target: new THREE.Vector3(1,30,3), time: 32 },
//   { position: new THREE.Vector3(0, 100, -10), target: new THREE.Vector3(1,30,3), time: 34 },
  
];

function interpolateKeyframes(time) {
  for (let i = 0; i < keyframes.length - 1; i++) {
    const start = keyframes[i];
    const end = keyframes[i + 1];
    if (time >= start.time && time <= end.time) {
      const t = (time - start.time) / (end.time - start.time);
      const interpolatedPosition = new THREE.Vector3().lerpVectors(start.position, end.position, t);
      const interpolatedTarget = new THREE.Vector3().lerpVectors(start.target, end.target, t);
      return { position: interpolatedPosition, target: interpolatedTarget };
    }
  }
  return null;
}

const cameraAnimationDuration = keyframes[keyframes.length - 1].time;
let startTime = Date.now();

function animateCamera() {
  const elapsedTime = (Date.now() - startTime) / 1000;
  const loopTime = elapsedTime % cameraAnimationDuration;
  const keyframeData = interpolateKeyframes(loopTime);
  if (keyframeData) {
    camera.position.copy(keyframeData.position);
    camera.lookAt(keyframeData.target);
  }
}

// Main animate loop
function animate() {
  requestAnimationFrame(animate);
  animateCamera(); // Move camera
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  renderer.render(scene, camera);
}
animate();
