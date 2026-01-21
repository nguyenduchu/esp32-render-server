const express = require("express");
const app = express();
app.use(express.json());

let state = {
  temp: 0,
  humi: 0,
  gate: 0,
  pump: 0,
  led: 0
};

let command = {};

app.post("/update", (req, res) => {
  state = { ...state, ...req.body };
  res.json({ ok: true });
});

app.get("/data", (req, res) => {
  res.json(state);
});

app.post("/command", (req, res) => {
  command = req.body;
  res.json({ sent: true });
});

app.get("/command", (req, res) => {
  res.json(command);
  command = {};
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
