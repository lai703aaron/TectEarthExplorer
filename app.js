const container = document.getElementById('container');
const timeSlider = document.getElementById('timeSlider');
const timeDisplay = document.getElementById('timeDisplay');

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Earth model
const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
const earthMaterial = new THREE.MeshPhongMaterial({
  color: 0x3388ff, // Blue for oceans
  emissive: 0x112244,
  shininess: 30,
  specular: 0xffffff
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// Coastline lines (updates with time)
const coastlineGeometry = new THREE.BufferGeometry();
const coastlineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
const coastline = new THREE.LineSegments(coastlineGeometry, coastlineMaterial);
earth.add(coastline);

// Lights
scene.add(new THREE.AmbientLight(0x404040));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 3, 5);
scene.add(light);

// Controls for rotate/zoom
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;

// Slider event
timeSlider.addEventListener('input', () => {
  const ageMa = parseInt(timeSlider.value);
  timeDisplay.textContent = `Current: ${ageMa} Ma`;
  updateTectonics(ageMa);
});

// Update tectonics (simplified plate simulation)
function updateTectonics(ageMa) {
  const positions = new Float32Array(100 * 3); // Placeholder for lines
  let index = 0;

  // Simplified Pangaea at ~200 Ma
  if (ageMa > 180) {
    // Draw a rough supercontinent shape
    for (let i = 0; i < 50; i++) {
      const theta = (i / 50) * Math.PI * 2;
      const x = Math.cos(theta) * 1.2;
      const y = Math.sin(theta) * 0.8;
      const z = 0;
      // Rotate to sphere coords (simplified)
      positions[index++] = x;
      positions[index++] = y;
      positions[index++] = z + (ageMa / 540); // Fake drift
    }
  } else {
    // Modern continents (drifting apart)
    for (let i = 0; i < 50; i++) {
      const theta = (i / 50) * Math.PI * 2;
      const drift = ageMa / 540;
      positions[index++] = Math.cos(theta) * (1 + drift);
      positions[index++] = Math.sin(theta) * (1 + drift);
      positions[index++] = 0;
    }
  }

  coastlineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  coastlineGeometry.attributes.position.needsUpdate = true;
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initial update
updateTectonics(0);
