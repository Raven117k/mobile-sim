// Make sure devices.js is loaded first
const phone = document.getElementById("phone");
const iframe = document.getElementById("appFrame");
const frame = document.getElementById("frame");
const scaler = document.getElementById("scaler");
const stage = document.getElementById("stage");
const slider = document.getElementById("scaleSlider");
const moveHandle = document.getElementById("moveHandle");
const urlInput = document.getElementById("url");
const deviceSelect = document.getElementById("device");
const deviceLabel = document.getElementById("deviceLabel");
const colorPicker = document.getElementById("backstageColorPicker");
const statusBar = document.getElementById("statusBar");
const viewportContainer = document.getElementById("viewportContainer");

for (const key in DEVICES) {
  const option = document.createElement("option");
  option.value = key;
  option.textContent = DEVICES[key].name;
  deviceSelect.appendChild(option);
}

let manualScale = parseFloat(slider.value);
let rotation = 0;
let currentPos = { x: 0, y: 0 };
let targetPos = { x: 0, y: 0 };
let dragging = false;
let start = { x: 0, y: 0 };
let currentDevice = null;

function updateDeviceClass(deviceType) {
  phone.classList.remove('device-ios', 'device-android', 'landscape');
  phone.classList.add(`device-${deviceType}`);
  if (Math.abs(rotation % 180) === 90) phone.classList.add('landscape');
}

function setupViewportContainer(device) {
  const viewport = { width: device.viewport.w, height: device.viewport.h };
  const phoneWidth = device.frame.w;
  const phoneHeight = device.frame.h;
  const top = (phoneHeight - viewport.height) / 2;
  const left = (phoneWidth - viewport.width) / 2;

  viewportContainer.style.width = `${viewport.width}px`;
  viewportContainer.style.height = `${viewport.height}px`;
  viewportContainer.style.top = `${top}px`;
  viewportContainer.style.left = `${left}px`;
  viewportContainer.style.transform = `rotate(0deg)`;

  statusBar.style.height = `${device.statusBarHeight}px`;
  iframe.style.height = `calc(100% - ${device.statusBarHeight}px)`;
  iframe.style.top = `${device.statusBarHeight}px`;

  updateDeviceClass(device.type);
}

function applyTransform() {
  if (!currentDevice) return;
  const stageWidth = stage.clientWidth;
  const stageHeight = stage.clientHeight;
  const phoneWidth = Math.abs(rotation % 180) === 90 ? currentDevice.frame.h : currentDevice.frame.w;
  const phoneHeight = Math.abs(rotation % 180) === 90 ? currentDevice.frame.w : currentDevice.frame.h;

  let fitScale = Math.min(stageWidth / phoneWidth, stageHeight / phoneHeight) * 0.9;
  const finalScale = fitScale * manualScale;

  currentPos.x += (targetPos.x - currentPos.x) * 0.18;
  currentPos.y += (targetPos.y - currentPos.y) * 0.18;

  scaler.style.transform = `translate(-50%, -50%) translate(${currentPos.x}px, ${currentPos.y}px) scale(${finalScale}) rotate(${rotation}deg)`;
}

function loadDevice() {
  const deviceKey = deviceSelect.value;
  currentDevice = DEVICES[deviceKey];
  if (!currentDevice) return;

  deviceLabel.textContent = currentDevice.name;
  phone.style.width = `${currentDevice.frame.w}px`;
  phone.style.height = `${currentDevice.frame.h}px`;

  setupViewportContainer(currentDevice);

  frame.src = currentDevice.image;
  frame.style.width = `${currentDevice.frame.w}px`;
  frame.style.height = `${currentDevice.frame.h}px`;

  let url = urlInput.value.trim();
  if (url && !url.startsWith("http")) url = "https://" + url;

  iframe.src = url || "home.html";
  applyTransform();
}

function animate() { applyTransform(); requestAnimationFrame(animate); }

function setupEventListeners() {
  document.getElementById("load").onclick = loadDevice;
  deviceSelect.onchange = loadDevice;

  slider.oninput = () => { manualScale = parseFloat(slider.value); applyTransform(); };

  document.getElementById("rotateLeft").onclick = () => { rotation -= 90; setupViewportContainer(currentDevice); applyTransform(); };
  document.getElementById("rotateRight").onclick = () => { rotation += 90; setupViewportContainer(currentDevice); applyTransform(); };

  moveHandle.onmousedown = (e) => { dragging = true; start = { x: e.clientX, y: e.clientY }; moveHandle.style.cursor = 'grabbing'; e.preventDefault(); };
  window.onmousemove = (e) => { if (!dragging) return; targetPos.x += e.clientX - start.x; targetPos.y += e.clientY - start.y; start = { x: e.clientX, y: e.clientY }; };
  window.onmouseup = () => { dragging = false; moveHandle.style.cursor = 'grab'; };

  moveHandle.addEventListener('touchstart', (e) => { dragging = true; const touch = e.touches[0]; start = { x: touch.clientX, y: touch.clientY }; e.preventDefault(); });
  window.addEventListener('touchmove', (e) => { if (!dragging) return; const touch = e.touches[0]; targetPos.x += touch.clientX - start.x; targetPos.y += touch.clientY - start.y; start = { x: touch.clientX, y: touch.clientY }; e.preventDefault(); });
  window.addEventListener('touchend', () => dragging = false);

  colorPicker.oninput = (e) => document.documentElement.style.setProperty('--backstage-bg', e.target.value);

  urlInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') loadDevice(); });
  window.addEventListener('resize', () => applyTransform());

  setInterval(() => {
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    document.querySelector('.status-left').textContent = timeStr;
  }, 60000);

  document.getElementById('resetPageBtn').onclick = () => location.reload();
}

function init() {
  deviceSelect.selectedIndex = 0;
  setupEventListeners();
  loadDevice();
  animate();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else init();
