const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

let currentData = {
  temperature: 0,
  weight: 0,
  mode: 'auto',
  programState: false,
  fanState: false,
  heaterState: false,
  heaterTempTarget: 45,
  dryTime: 0,
  lastUpdate: new Date()
};

let history = [];

// Tạo thư mục data nếu chưa có
const dataDir = path.join(__dirname, 'data');
const historyPath = path.join(dataDir, 'history.json');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (fs.existsSync(historyPath)) {
  history = JSON.parse(fs.readFileSync(historyPath));
}

// Keep alive cho Render Free
app.get('/ping', (req, res) => {
  res.status(200).send('pong - Server is alive!');
  console.log('✅ Ping received at', new Date().toLocaleString('vi-VN'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', ...currentData });
});

// Nhận dữ liệu từ Arduino
app.post('/data_receiver.php', (req, res) => {
  const { cambien1, cambien2, action, temperature } = req.body;

  if (action === 'manual_temp') {
    currentData.temperature = parseFloat(temperature) || currentData.temperature;
  } else {
    currentData.temperature = parseFloat(cambien1) || 0;
    currentData.weight = parseFloat(cambien2) || 0;
  }

  currentData.lastUpdate = new Date();
  history.push({ ...currentData, timestamp: new Date().toISOString() });

  if (history.length > 500) history.shift();
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));

  res.send('success');
});

// Điều khiển từ Arduino (manual.php)
app.post('/manual.php', (req, res) => {
  const { action, state, fan, heater_temp, heater } = req.body;

  if (action === 'program') {
    currentData.programState = state === 'on';
    currentData.fanState = fan === 'on';
  } else if (action === 'fan') {
    currentData.fanState = state === 'on';
  } else if (action === 'heater') {
    currentData.heaterState = state === 'on';
    if (heater_temp) currentData.heaterTempTarget = parseFloat(heater_temp);
  }
  res.send('success');
});

// API cho Web Dashboard
app.get('/api/status', (req, res) => res.json(currentData));
app.get('/api/history', (req, res) => res.json(history));

app.post('/api/control', (req, res) => {
  Object.assign(currentData, req.body);
  console.log('Control from web:', req.body);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`🌐 Mở dashboard: http://localhost:${PORT}`);
});
