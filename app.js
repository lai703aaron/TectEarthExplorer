// 修復：不用 import，直接用 global THREE
const container = document.getElementById('container');
const slider = document.getElementById('timeSlider');
const timeDisplay = document.getElementById('timeDisplay');
const debug = document.getElementById('debug');

let camera, scene, renderer, earth, coastlineGeometry;

// Debug 函數
function log(msg) {
  debug.textContent = msg;
  console.log(msg);
}

function init() {
  log('初始化中...');
  if (typeof THREE === 'undefined') {
    log('錯誤：Three.js 沒載入！檢查 CDN。');
    return;
  }

  // 基本設定
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  if (!renderer) {
    log('錯誤：WebGL 不支援！');
    return;
  }
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000011); // 深藍背景
  container.appendChild(renderer.domElement);
  log('渲染器建立成功');

  // 地球 (修復：加基本材質 + 光澤)
  const earthGeometry = new THREE.SphereGeometry(2, 64, 64); // 降低細節，加速
  const earthMaterial = new THREE.MeshPhongMaterial({
    color: 0x6b93d6, // 藍綠地球色
    emissive: 0x112244,
    shininess: 100,
    specular: 0xffffff
  });
  earth = new THREE.Mesh(earthGeometry, earthMaterial);
  scene.add(earth);
  log('地球模型加載');

  // 海岸線 (簡化線條)
  coastlineGeometry = new THREE.BufferGeometry();
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x228B22 }); // 綠線
  const coastline = new THREE.Line(coastlineGeometry, lineMaterial);
  earth.add(coastline);

  // 燈光 (修復：加點光讓地球亮起來)
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 3, 5);
  scene.add(directionalLight);

  // 互動：拖拽旋轉
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  renderer.domElement.addEventListener('pointerdown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });
  renderer.domElement.addEventListener('pointerup', () => { isDragging = false; });
  renderer.domElement.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const deltaMove = {
      x: e.clientX - previousMousePosition.x,
      y: e.clientY - previousMousePosition.y
    };
    earth.rotation.y += deltaMove.x * 0.01;
    earth.rotation.x += deltaMove.y * 0.01;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  // 滑桿事件
  slider.addEventListener('input', () => {
    const age = parseInt(slider.value);
    timeDisplay.textContent = `距離現在：${age} 百萬年`;
    updateContinents(age);
  });

  // 視窗調整
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  log('初始化完成！地球應該可見了。');
  updateContinents(0); // 初始更新
}

function updateContinents(ageMa) {
  // 簡化大陸更新：200Ma 合成盤古
  const positions = [];
  if (ageMa >= 180) {
    // 盤古大陸簡化形狀 (多邊形點)
    const pangeaPoints = [
      { lon: 0, lat: 0 }, { lon: 60, lat: 20 }, { lon: 90, lat: -10 },
      { lon: 30, lat: -40 }, { lon: -60, lat: -30 }, { lon: -90, lat: 10 }
    ];
    pangeaPoints.forEach(p => {
      const lonRad = (p.lon * Math.PI) / 180;
      const latRad = (p.lat * Math.PI) / 180;
      const x = Math.cos(latRad) * Math.cos(lonRad);
      const y = Math.sin(latRad);
      const z = Math.cos(latRad) * Math.sin(lonRad);
      positions.push(x * 2.02, y * 2.02, z * 2.02); // 略微外凸
    });
  } else {
    // 現代大陸簡化 (澳洲、印度等)
    const modernPoints = [
      { lon: 135, lat: -25 }, // 澳洲
      { lon: 78, lat: 20 },   // 印度
      { lon: -60, lat: -15 }  // 南美
    ];
    modernPoints.forEach(p => {
      const lonRad = (p.lon * Math.PI) / 180;
      const latRad = (p.lat * Math.PI) / 180;
      const x = Math.cos(latRad) * Math.cos(lonRad);
      const y = Math.sin(latRad);
      const z = Math.cos(latRad) * Math.sin(lonRad);
      positions.push(x * 2.02, y * 2.02, z * 2.02);
    });
  }

  // 更新海岸線
  if (positions.length > 0) {
    coastlineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    coastlineGeometry.attributes.position.needsUpdate = true;
  }
}

function animate() {
  requestAnimationFrame(animate);
  if (earth) earth.rotation.y += 0.002; // 緩慢自轉
  if (renderer) renderer.render(scene, camera);
}

// 啟動
window.addEventListener('load', () => {
  setTimeout(init, 100); // 延遲確保 DOM 載入
  animate();
});
