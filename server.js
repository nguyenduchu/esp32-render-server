const express = require("express");
const app = express();

// Render / Node dùng PORT động
const PORT = process.env.PORT || 10000;

// Cho phép đọc JSON
app.use(express.json());

// =====================
// DATA LƯU TRẠNG THÁI
// =====================
let systemData = {
  temp: 0,
  humi: 0,
  gate: 0, // 0 = đóng, 1 = mở
  pump: 0, // 0 = tắt, 1 = bật
  led: 0   // 0 = tắt, 1 = bật
};

// =====================
// TRANG CHỦ
// =====================
app.get("/", (req, res) => {
  res.send("ESP32 Render Server is running");
});

// =====================
// ESP32 GỬI DỮ LIỆU LÊN
// =====================
app.post("/update", (req, res) => {
  const { temp, humi, gate, pump, led } = req.body;

  if (temp !== undefined) systemData.temp = temp;
  if (humi !== undefined) systemData.humi = humi;
  if (gate !== undefined) systemData.gate = gate;
  if (pump !== undefined) systemData.pump = pump;
  if (led !== undefined) systemData.led = led;

  console.log("Update from ESP32:", systemData);

  res.json({ status: "ok", data: systemData });
});

// =====================
// WEB / ESP32 LẤY DỮ LIỆU
// =====================
app.get("/data", (req, res) => {
  res.json(systemData);
});

// =====================
// ĐIỀU KHIỂN TỪ WEB
// =====================
app.get("/control", (req, res) => {
  const { gate, pump, led } = req.query;

  if (gate !== undefined) systemData.gate = Number(gate);
  if (pump !== undefined) systemData.pump = Number(pump);
  if (led !== undefined) systemData.led = Number(led);

  console.log("Control update:", systemData);

  res.json({
    status: "ok",
    data: systemData
  });
});

// =====================
// SERVER START
// =====================
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
