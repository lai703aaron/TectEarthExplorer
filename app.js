import * as THREE from './libs/three.module.js';

let camera, scene, renderer, earth, coastlineGeometry;
const container = document.getElementById('container');
const slider = document.getElementById('timeSlider');
const timeDisplay = document.getElementById('timeDisplay');

init();
animate();

function init() {
  // 基本 Three.js 設定
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // 地球
  const earthGeometry = new THREE.SphereGeometry(2, 128, 128);
  const earthMaterial = new THREE.MeshPhongMaterial({
    color: 0x2233aa,
    emissive: 0x112244,
    shininess: 10,
    specular: 0xaaaaaa
  });
  earth = new THREE.Mesh(earthGeometry, earthMaterial);
  scene.add(earth);

  // 簡單海岸線（之後換真實數據）
  coastlineGeometry = new THREE.BufferGeometry();
  earth.add(new THREE.LineSegments(coastlineGeometry, new THREE.LineBasicMaterial({color: 0xffffff})));

  // 燈光
  scene.add(new THREE.AmbientLight(0x666666));
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5,3,5);
  scene.add(light);

  // 互動
  let isDragging = false;
  renderer.domElement.addEventListener('pointerdown', () => isDragging = true);
  renderer.domElement.addEventListener('pointerup', () => isDragging = false);
  renderer.domElement.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    earth.rotation.y += e.movementX * 0.005;
    earth.rotation.x += e.movementY * 0.005;
  });

  slider.addEventListener('input', () => {
    const age = slider.value;
    timeDisplay.textContent = `距離現在：${age} 百萬年`;
    updateContinents(age);
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function updateContinents(ageMa) {
  // 簡化版：200Ma 時合成盤古大陸
  const positions = [];
  const t = ageMa / 200;
  if (ageMa > 180) {
    // 盤古大陸模式
    const pangea = [
      [0,0], [0.3,0.2], [0.5,-0.1], [0.2,-0.4], [-0.3,-0.3], [-0.5,0.1]
    ];
    pangea.forEach(p => {
      const [x,y] = p;
      const lon = x * Math.PI;
      const lat = y * Math.PI / 2;
      const vec = new THREE.Vector3(
        Math.cos(lat) * Math.cos(lon),
        Math.sin(lat),
        Math.cos(lat) * Math.sin(lon)
      ).multiplyScalar(2.01);
      positions.push(vec.x, vec.y, vec.z);
    });
  } else {
    // 現代大陸（簡化）
    positions.push(...getModernContinents(ageMa));
  }
  
  coastlineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
}

function getModernContinents(age) {
  // 這裡放真實數據，現在先給幾個大陸輪廓
  const drift = age / 540;
  const continents = [
    // 澳洲往北漂
    [0.4 + drift*0.2, -0.4],
    // 印度往北撞
    [0.1 + drift*0.3, -0.3 + drift*0.6],
    // 南美往西
    [-0.5 - drift*0.1, -0.2],
  ];
  const pos = [];
  continents.forEach(c => {
    const [x,y] = c;
    const vec = new THREE.Vector3(x, y, Math.sqrt(4 - x*x - y*y)).normalize().multiplyScalar(2.01);
    pos.push(vec.x, vec.y, vec.z);
  });
  return pos;
}

function animate() {
  requestAnimationFrame(animate);
  earth.rotation.y += 0.001;
  renderer.render(scene, camera);
}
