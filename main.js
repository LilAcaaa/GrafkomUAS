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

let mixer;
const clock = new THREE.Clock();

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled=true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const boxArrayBesar=[];

function buatBox(x, y, z, width, height, depth) {
  const geometry = new THREE.BoxGeometry(width, height, depth); // x, z, y
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.0 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  scene.add(mesh);

  const box = new THREE.Box3();
  box.setFromObject(mesh);
  boxArrayBesar.push(box);
  const helper = new THREE.Box3Helper( box, 0xffff00 );
  scene.add( helper );

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

camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0);
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

{
  buatBox(-9, 50, -2,13,10,13);
  buatBox(28, 50, -2,17,10,20);
  buatBox(28, 50, 1,1000,10000,20);
  buatBox(10, 50, -2,13,10,21);
  buatBox(10, 50, -19,7,10,8);
  buatBox(10, 50, -27,16,10,9);
  buatBox(30, 50, -38,10,10,15);
  buatBox(38, 50, -38,10,10000,1000);
  buatBox(30, 50, -18,10,10,8);
  buatBox(-8, 50, -36,8,8,5);
  buatBox(-21, 50, -34,10,8,19);
  buatBox(-33, 50, -48,10,8,8);
  buatBox(-41, 50, -48,10,10000,1000);
  buatBox(10, 50, -69,1000,10000,9);
}


//light
{
  const directionalLight = new THREE.DirectionalLight(0xFFF7DB, 12); // Adjust intensity
  directionalLight.position.set(0, 400, -600); // Position the light
  directionalLight.target.position.set(0, 0, 0);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048*10; // Reduce shadow map size for softer shadows
  directionalLight.shadow.mapSize.height = 2048*10;
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


  var shadowlight = new THREE.DirectionalLight(0xFFF7DB);
  shadowlight.castShadow = true
  shadowlight.position.set(0,3,0);
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
const loader = new GLTFLoader().setPath( 'Minecraft/' );
						loader.load( 'cutisland5.glb', async function ( gltf ) {

							const model = gltf.scene;
							await renderer.compileAsync( model, camera, scene );
              model.position.set(0, 0, 0);
              applyTexture(model,'Atlas_baseColor.PNG')
              model.scale.setScalar( 0.8 );
              model.traverse(function (node){
                if(node.isMesh){
                  node.castShadow = true;
                  node.receiveShadow = true;
                }
              });
              console.log(model.children);
              renderer.compileAsync(model, camera, scene);
							scene.add( model );
            

						} );

}

{
  // Function to load and apply a texture
const loader = new GLTFLoader().setPath( 'Minecraft/' );
						loader.load( 'Laut2.glb', async function ( gltf ) {

							const model = gltf.scene;
							await renderer.compileAsync( model, camera, scene );
              model.position.set(0, 0, 0);
              model.scale.setScalar( 0.8 );

              function setOpacity(object, opacity) {
                object.traverse(function (node) {
                    if (node.isMesh) {
                        node.material.transparent = true;
                        node.material.opacity = opacity;
                        node.material.needsUpdate = true; // Ensure the material updates
                    }
                });
            }
            setOpacity(model, 1);
              model.traverse(function (node){
                if(node.isMesh){
                  node.castShadow = true;
                  node.receiveShadow = true;
                
                }
              });
              console.log(model.children);
              renderer.compileAsync(model, camera, scene);
							scene.add( model );
            

						} );

}
//Portal
{
var loader = new GLTFLoader().setPath( 'Minecraft/' );
						loader.load( 'portalluar.glb', async function ( gltf ) {

							const model = gltf.scene;
							await renderer.compileAsync( model, camera, scene );
              model.position.set(-14, 39, -41);
              model.scale.setScalar( 1.5 );
              model.traverse(function (node){
                if(node.isMesh){
                  node.castShadow = true;
                  node.receiveShadow = true;
                  node.material.ambient = new THREE.Color(0x00ff1e)
                  node.material.diffuse = new THREE.Color(0x00ff1e)
                  node.material.specular = new THREE.Color(0x00ff1e)
                  node.material.shininess = 100


                  // Apply reflective material without env map
                // node.material = new THREE.MeshStandardMaterial({
                //     color: node.material.color,
                //     metalness: 1.0, // Adjust metalness to increase/decrease reflection
                //     roughness: 0.2, // Adjust roughness to control the sharpness of the reflection
                //     envMapIntensity: 0.5 // Optional: Adjust intensity of the environment reflection (useful even without an env map)
                //     });
                }
              });
							scene.add( model );
            

						} );

            loader = new GLTFLoader().setPath( 'Minecraft/' );
						loader.load( 'portaldalam.glb', async function ( gltf ) {

							const model = gltf.scene;
							await renderer.compileAsync( model, camera, scene );
              model.position.set(-14, 39, -40.5);
              model.scale.setScalar( 1.5 );

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
              model.traverse(function (node){
                if(node.isMesh){
                  node.castShadow = true;
                  node.receiveShadow = true;
                }
              });
							scene.add( model );
            

						} );

}
// //Bee1
// {
//   var loader = new GLTFLoader().setPath( 'Minecraft/' );
// 						loader.load( 'bee_minecraft.glb', async function ( gltf ) {

// 							const model = gltf.scene;
// 							const animations = gltf.animations;
//               const mixer = new THREE.AnimationMixer(model);
              
//               animations.forEach((clip) => {
//                   mixer.clipAction(clip).play();
//               });

//               await renderer.compileAsync(model, camera, scene);
//               model.position.set(0, 48, -7.5);
//               model.scale.setScalar( 0.1 );
//               model.rotation.y = Math.PI/4;
//               model.traverse(function (node){
//                 if(node.isMesh){
//                   node.castShadow = true;
//                   node.receiveShadow = true;
//                   node.material.ambient = new THREE.Color(0x00ff1e)
//                   node.material.diffuse = new THREE.Color(0x00ff1e)
//                   node.material.specular = new THREE.Color(0x00ff1e)
//                   node.material.shininess = 100
//                 }
//               });
// 							scene.add( model );
//               function animate() {
//                 requestAnimationFrame(animate);
//                 const delta = clock.getDelta();
//                 mixer.update(delta);  
//                 renderer.render(scene, camera);
//             }
//             const clock = new THREE.Clock();
//             animate();
// 						});

            
// }
// //Bee2
// {
//   var loader = new GLTFLoader().setPath( 'Minecraft/' );
// 						loader.load( 'minecraft_bee.glb', async function ( gltf ) {

// 							const model = gltf.scene;
// 							const animations = gltf.animations;
//               const mixer = new THREE.AnimationMixer(model);
              
//               animations.forEach((clip) => {
//                   mixer.clipAction(clip).play();
//               });

//               await renderer.compileAsync(model, camera, scene);
//               model.position.set(-2.5, 42.9, -7.5);
//               model.scale.setScalar( 3 );
//               // model.rotation.y = Math.PI;
//               model.traverse(function (node){
//                 if(node.isMesh){
//                   node.castShadow = true;
//                   node.receiveShadow = true;
//                   node.material.ambient = new THREE.Color(0x00ff1e)
//                   node.material.diffuse = new THREE.Color(0x00ff1e)
//                   node.material.specular = new THREE.Color(0x00ff1e)
//                   node.material.shininess = 1
//                 }
//               });
// 							scene.add( model );
//               function animate() {
//                 requestAnimationFrame(animate);
//                 const delta = clock.getDelta();
//                 mixer.update(delta);  
//                 renderer.render(scene, camera);
//             }
//             const clock = new THREE.Clock();
//             animate();
// 						});
// }
// //CAR
// {
//   var loader = new GLTFLoader().setPath( 'Minecraft/' );
// 						loader.load( 'minecraft_cat_lying.glb', async function ( gltf ) {

// 							const model = gltf.scene;
// 							await renderer.compileAsync( model, camera, scene );
//               model.position.set(-6, 39, -41);
//               model.scale.setScalar( 0.05 );
//               model.rotation.y=Math.PI/4;
//               model.traverse(function (node){
//                 if(node.isMesh){
//                   node.castShadow = true;
//                   node.receiveShadow = true;
//                   node.material.ambient = new THREE.Color(0x00ff1e)
//                   node.material.diffuse = new THREE.Color(0x00ff1e)
//                   node.material.specular = new THREE.Color(0x00ff1e)
//                   node.material.shininess = 100
//                 }
//               });
// 							scene.add( model );
            

// 						} );
// }
// //WOLF
// {
//   var loader = new GLTFLoader().setPath( 'Minecraft/' );
// 						loader.load( 'wolf_dog_minecraft.glb', async function ( gltf ) {

// 							const model = gltf.scene;
// 							const animations = gltf.animations;
//               const mixer = new THREE.AnimationMixer(model);
              
//               animations.forEach((clip) => {
//                   mixer.clipAction(clip).play();
//               });

//               await renderer.compileAsync(model, camera, scene);
//               model.position.set(5, 39.4, -40);
//               model.scale.setScalar( 0.2 );
//               model.rotation.y = -Math.PI/1.3;
//               model.traverse(function (node){
//                 if(node.isMesh){
//                   node.castShadow = true;
//                   node.receiveShadow = true;
//                   node.material.ambient = new THREE.Color(0x00ff1e)
//                   node.material.diffuse = new THREE.Color(0x00ff1e)
//                   node.material.specular = new THREE.Color(0x00ff1e)
//                   node.material.shininess = 1
//                 }
//               });
// 							scene.add( model );
//               function animate() {
//                 requestAnimationFrame(animate);
//                 const delta = clock.getDelta();
//                 mixer.update(delta);  
//                 renderer.render(scene, camera);
//             }
//             const clock = new THREE.Clock();
//             animate();
// 						});
// }
// //Clothline
// {
//   var loader = new GLTFLoader().setPath( 'Minecraft/' );
// 						loader.load( 'clothline.gltf', async function ( gltf ) {

// 							const model = gltf.scene;
// 							const animations = gltf.animations;
//               const mixer = new THREE.AnimationMixer(model);
              
//               animations.forEach((clip) => {
//                   mixer.clipAction(clip).play();
//               });

//               await renderer.compileAsync(model, camera, scene);
//               model.position.set(-5, 39.4, -26);
//               model.scale.setScalar( 1.5 );
//               model.rotation.y = -Math.PI/2.2;
//               applyTexture(model,'clothline.png')
//               model.traverse(function (node){
//                 if(node.isMesh){
//                   node.castShadow = true;
//                   node.receiveShadow = true;
//                   node.material.ambient = new THREE.Color(0x00ff1e)
//                   node.material.diffuse = new THREE.Color(0x00ff1e)
//                   node.material.specular = new THREE.Color(0x00ff1e)
//                   node.material.shininess = 1
//                 }
//               });
// 							scene.add( model );
//               function animate() {
//                 requestAnimationFrame(animate);
//                 const delta = clock.getDelta();
//                 mixer.update(delta);  
//                 renderer.render(scene, camera);
//             }
//             const clock = new THREE.Clock();
//             animate();
// 						});
// }
// //Fox
// {
//   var loader = new GLTFLoader().setPath( 'Minecraft/' );
// 						loader.load( 'fox_minecraft.glb', async function ( gltf ) {

// 							const model = gltf.scene;
// 							const animations = gltf.animations;
//               const mixer = new THREE.AnimationMixer(model);
              
//               animations.forEach((clip) => {
//                   mixer.clipAction(clip).play();
//               });

//               await renderer.compileAsync(model, camera, scene);
//               model.position.set(-10, 40.3, -15);
//               model.scale.setScalar( 0.6 );
//               model.rotation.y = -Math.PI/1.3;
//               model.traverse(function (node){
//                 if(node.isMesh){
//                   node.castShadow = true;
//                   node.receiveShadow = true;
//                   node.material.ambient = new THREE.Color(0x00ff1e)
//                   node.material.diffuse = new THREE.Color(0x00ff1e)
//                   node.material.specular = new THREE.Color(0x00ff1e)
//                   node.material.shininess = 1
//                 }
//               });
// 							scene.add( model );
//               function animate() {
//                 requestAnimationFrame(animate);
//                 const delta = clock.getDelta();
//                 mixer.update(delta);  
//                 renderer.render(scene, camera);
//             }
//             const clock = new THREE.Clock();
//             animate();
// 						});
// }

const object = [];

const onProgress = function ( xhr ) {

  if ( xhr.lengthComputable ) {

    const percentComplete = xhr.loaded / xhr.total * 100;
    console.log( percentComplete.toFixed( 2 ) + '% downloaded' );

  }

};

// var player = new Player(
//   new ThirdPersonCamera(
//       camera, new THREE.Vector3(-35,14,0), new THREE.Vector3(35,0,0)
//   ),
//   scene,
//   100,
//   new THREE.Vector3(-20, -17, 55)
// );

// Initialize controls and player
// const speed = 10; // Movement speed
// const player = new Player(camera, scene, speed);


var time_prev = 0;

function animate(time) {
  var dt = time - time_prev;
  dt *= 0.1;

  const delta = clock.getDelta();
  // player.update(delta,boxArrayBesar);
  if (mixer) mixer.update(delta);

  object.forEach((obj) => (obj.rotation.z += dt * 0.01));

  renderer.render(scene, camera);
  // controls.update(0.001);
  time_prev = time;
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);