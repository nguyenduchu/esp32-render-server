const express = require("express");
const app = express();

// =======================
// PORT cho Render
// =======================
const PORT = process.env.PORT || 10000;

// =======================
// Middleware
// =======================
app.use(express.json());

// Cho phép load index.html
app.use(express.static(__dirname));

// =======================
// DATA LƯU TRẠNG THÁI HỆ THỐNG
// =======================
let systemData = {
  temp: 0,
  humi: 0,
  gate: 0, // 0 = đóng | 1 = mở
  pump: 0, // 0 = tắt | 1 = bật
  led: 0   // 0 = tắt | 1 = bật
};

// =======================
// TRANG CHỦ
// =======================
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// =======================
// ESP32 / WEB ĐỌC DATA
// =======================
app.get("/data", (req, res) => {
  res.json(systemData);
});

// =======================
// WEB / ESP32 GỬI LỆNH ĐIỀU KHIỂN
// Ví dụ:
// /control?led=1
// /control?pump=0
// =======================
app.get("/control", (req, res) => {

  if (req.query.led !== undefined) {
    systemData.led = Number(req.query.led);
  }

  if (req.query.pump !== undefined) {
    systemData.pump = Number(req.query.pump);
  }

  if (req.query.gate !== undefined) {
    systemData.gate = Number(req.query.gate);
  }

  res.json({
    status: "OK",
    systemData
  });
});

// =======================
// ESP32 GỬI SENSOR LÊN
// Ví dụ:
// /update?temp=30&humi=80
// =======================
app.get("/update", (req, res) => {

  if (req.query.temp !== undefined) {
    systemData.temp = Number(req.query.temp);
  }

  if (req.query.humi !== undefined) {
    systemData.humi = Number(req.query.humi);
  }

  res.json({
    status: "UPDATED",
    systemData
  });
});

// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
  console.log("ESP32 Render Server running on port", PORT);
});
