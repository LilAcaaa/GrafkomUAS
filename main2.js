import * as THREE from 'three';
import { OrbitControls, ThreeMFLoader } from 'three/examples/jsm/Addons.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
// import { Player, PlayerController, ThirdPersonCamera } from "./player.js";
// import { Player, PlayerController,ThirdPersonCamera } from "./player2.js";
// import { Player, PlayerController,ThirdPersonCamera } from "./player3.js";
import { Player, PlayerController,ThirdPersonCamera } from "./player4.js";

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

// {
//   buatBox(-9, 50, -2,13,10,13);
//   buatBox(28, 50, -2,17,10,20);
//   buatBox(28, 50, 1,1000,10000,20);
//   buatBox(10, 50, -2,13,10,21);
//   buatBox(10, 50, -19,7,10,8);
//   buatBox(10, 50, -27,16,10,9);
//   buatBox(30, 50, -38,10,10,15);
//   buatBox(38, 50, -38,10,10000,1000);
//   buatBox(30, 50, -18,10,10,8);
//   buatBox(-8, 50, -36,8,8,5);
//   buatBox(-21, 50, -34,10,8,19);
//   buatBox(-33, 50, -48,10,8,8);
//   buatBox(-41, 50, -48,10,10000,1000);
//   buatBox(10, 50, -69,1000,10000,9);
// }

//light
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

//plane
{
  // Function to load and apply a texture
  const loader = new GLTFLoader().setPath('Minecraft/');
  loader.load('cutisland3.glb', async function (gltf) {
    const model = gltf.scene;
    await renderer.compileAsync(model, camera, scene);
    model.position.set(0, 0, 0);
    applyTexture(model, 'Atlas_baseColor.PNG');
    model.scale.setScalar(0.8);
    model.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    console.log(model.children);
    renderer.compileAsync(model, camera, scene);
    scene.add(model);
  });
}

//Portal
{
  var loader = new GLTFLoader().setPath('Minecraft/');
  loader.load('portalluar.glb', async function (gltf) {
    const model = gltf.scene;
    await renderer.compileAsync(model, camera, scene);
    model.position.set(-14, 39, -41);
    model.scale.setScalar(1.5);
    model.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        node.material.ambient = new THREE.Color(0x00ff1e);
        node.material.diffuse = new THREE.Color(0x00ff1e);
        node.material.specular = new THREE.Color(0x00ff1e);
        node.material.shininess = 100;
      }
    });
    scene.add(model);
  });

  loader = new GLTFLoader().setPath('Minecraft/');
  loader.load('portaldalam.glb', async function (gltf) {
    const model = gltf.scene;
    await renderer.compileAsync(model, camera, scene);
    model.position.set(-14, 39, -40.5);
    model.scale.setScalar(1.5);

    function setOpacity(object, opacity) {
      object.traverse(function (node) {
        if (node.isMesh) {
          node.material.transparent = true;
          node.material.opacity = opacity;
          node.material.needsUpdate = true; // Ensure the material updates
        }
      });
    }

    setOpacity(model, 0.4);
    model.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    scene.add(model);
  });
}

// //Bee1
// {
//   var loader = new GLTFLoader().setPath('Minecraft/');
//   loader.load('bee_minecraft.glb', async function (gltf) {
//     const model = gltf.scene;
//     const animations = gltf.animations;
//     const mixer = new THREE.AnimationMixer(model);

//     animations.forEach((clip) => {
//       mixer.clipAction(clip).play();
//     });

//     await renderer.compileAsync(model, camera, scene);
//     model.position.set(0, 48, -7.5);
//     model.scale.setScalar(0.1);
//     model.rotation.y = Math.PI / 4;
//     model.traverse(function (node) {
//       if (node.isMesh) {
//         node.castShadow = true;
//         node.receiveShadow = true;
//       }
//     });
//     scene.add(model);

//     function animate() {
//       requestAnimationFrame(animate);
//       const delta = clock.getDelta();
//       mixer.update(delta);
//       renderer.render(scene, camera);
//     }
//     animate();
//   });
// }

// //Bee2
// {
//   var loader = new GLTFLoader().setPath('Minecraft/');
//   loader.load('bee_minecraft.glb', async function (gltf) {
//     const model = gltf.scene;
//     const animations = gltf.animations;
//     const mixer = new THREE.AnimationMixer(model);

//     animations.forEach((clip) => {
//       mixer.clipAction(clip).play();
//     });

//     await renderer.compileAsync(model, camera, scene);
//     model.position.set(2, 43, -4);
//     model.scale.setScalar(0.15);
//     model.rotation.y = Math.PI / 4;
//     model.traverse(function (node) {
//       if (node.isMesh) {
//         node.castShadow = true;
//         node.receiveShadow = true;
//       }
//     });
//     scene.add(model);

//     function animate() {
//       requestAnimationFrame(animate);
//       const delta = clock.getDelta();
//       mixer.update(delta);
//       renderer.render(scene, camera);
//     }
//     animate();
//   });
// }

//Bee1
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

//Bee2
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

const playerController = new PlayerController(scene, camera, renderer.domElement);
playerController.addPlayer(new THREE.Vector3(0, 100, -20));

animate();

// Keyframes for camera movement
const keyframes = [
  { position: new THREE.Vector3(0, 100, -20), target: new THREE.Vector3(0, 50, 0) },
  { position: new THREE.Vector3(50, 100, 0), target: new THREE.Vector3(0, 100, 0) },
  { position: new THREE.Vector3(0, 150, 50), target: new THREE.Vector3(0,200, 0) },
  { position: new THREE.Vector3(-50, 100, 0), target: new THREE.Vector3(0, 100, 0) },
];

let currentKeyframe = 0;
const totalKeyframes = keyframes.length;
const keyframeDuration = 5; // Duration of each keyframe in seconds
let keyframeStartTime = Date.now();

// Function to interpolate between keyframes
function interpolateKeyframes() {
  const elapsedTime = (Date.now() - keyframeStartTime) / 1000;
  const t = elapsedTime / keyframeDuration;

  if (t >= 1) {
    currentKeyframe = (currentKeyframe + 1) % totalKeyframes;
    keyframeStartTime = Date.now();
  }

  const nextKeyframe = (currentKeyframe + 1) % totalKeyframes;
  const startKeyframe = keyframes[currentKeyframe];
  const endKeyframe = keyframes[nextKeyframe];

  camera.position.lerpVectors(startKeyframe.position, endKeyframe.position, t);
  controls.target.lerpVectors(startKeyframe.target, endKeyframe.target, t);
  controls.update();
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  interpolateKeyframes(); // Interpolate between keyframes
  renderer.render(scene, camera);
}

animate();

