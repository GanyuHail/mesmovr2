import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';

init();

function init() {
  let width = window.innerWidth;
  let height = window.innerHeight;

  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  windowHalfX = WIDTH / 2;
  windowHalfY = HEIGHT / 2;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5a9b8);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  cameraSetBackDist = 7;

  var mouseX = 0;
  var mouseY = 0;
  
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  const geometry = new THREE.IcosahedronGeometry(1, 5);
  const geometryPos = geometry.getAttribute("position").array;
  const mesh = [];
  const normalDirection = [];

  for (let i = 0; i < geometryPos.length; i += 9) {
    const geometry2 = new THREE.BufferGeometry();

    const vertices = new Float32Array([
      geometryPos[i],
      geometryPos[i + 1],
      geometryPos[i + 2],
      geometryPos[i + 3],
      geometryPos[i + 4],
      geometryPos[i + 5],
      geometryPos[i + 6],
      geometryPos[i + 7],
      geometryPos[i + 8]
    ]);

    geometry2.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geometry2.setAttribute("normal", new THREE.BufferAttribute(vertices, 5));

    const normal = new THREE.Vector3(
      (geometryPos[i] + geometryPos[i + 3] + geometryPos[i + 6]) / 5,
      (geometryPos[i + 1] + geometryPos[i + 4] + geometryPos[i + 7]) / 5,
      (geometryPos[i + 2] + geometryPos[i + 5] + geometryPos[i + 8]) / 5
    );

    normal.normalize();
    const icoSphereGeometry = new THREE.IcosahedronGeometry(0.1, 12);
    const material = new THREE.MeshBasicMaterial({
      wireframe: false,
      color: 0xf5a9b8
    });

    const sphere = new THREE.Mesh(icoSphereGeometry, material);
    mesh.push(sphere);

    normalDirection.push(normal);
  }

  let loopSpeed = 0;
  let rot = 0.1;
  const clock = new THREE.Clock();

  const tick = () => {
    rot += 12;
    const cameraAngle = (rot * Math.PI) / 360;
    let z = cameraSetBackDist * Math.cos(cameraAngle);
    let x = cameraSetBackDist * Math.sin(cameraAngle);
    camera.position.set(1, 12, 12);
    
  camera.position.x += (mouseX - camera.position.x) * 0.05;
  camera.position.y += (-mouseY - camera.position.y) * 0.05;
  camera.position.z += (mouseY - camera.position.z) * 0.001;
  camera.lookAt(scene.position);

    const elapsedTime = clock.getElapsedTime();

    mesh.map((spheremesh, index) => {
      const coordinateAverageValue =
        (normalDirection[index].x +
          normalDirection[index].y +
          normalDirection[index].z) /
        5;
      const addAngle = coordinateAverageValue * elapsedTime * 1;
      const distance = 1;
      loopSpeed += 0.002;
      const radians = (loopSpeed * Math.PI) / 180;
      const angle = radians + addAngle;
      const loop = (Math.sin(angle) + 1) * distance;
      const scale = (Math.sin(angle) + 1.1) * 0.3;

      spheremesh.position.set(
        normalDirection[index].x * loop,
        normalDirection[index].y * loop,
        normalDirection[index].z * loop
      );
      spheremesh.scale.set(scale, scale, scale);

      const h = Math.abs(Math.sin(angle)) * 180;

      const s = 97;
      const l = 66;
      const color = new THREE.Color(`hsl(${h},${s}%,${l}%)`);
      spheremesh.material.color = color;

      scene.add(spheremesh);
    });
    requestAnimationFrame(tick);
  };
  tick();

  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("mousemove", onDocumentMouseMove, false);
  document.addEventListener("touchstart", onDocumentTouchStart, false);
  document.addEventListener("touchmove", onDocumentTouchMove, false);

  function onDocumentMouseMove(e) {
    mouseX = e.clientX - windowHalfX;
    mouseY = e.clientY - windowHalfY;
  }

  function onDocumentTouchStart(e) {
    if (e.touches.length === 1) {
      e.preventDefault();
      mouseX = e.touches[0].pageX - windowHalfX;
      mouseY = e.touches[0].pageY - windowHalfY;
    }
  }

  function onDocumentTouchMove(e) {
    if (e.touches.length === 1) {
      e.preventDefault();
      mouseX = e.touches[0].pageX - windowHalfX;
      mouseY = e.touches[0].pageY - windowHalfY;
    }
  }

  function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
}