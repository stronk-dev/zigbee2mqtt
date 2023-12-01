const promClient = require("prom-client");
const register = new promClient.Registry();
const express = require("express");
var mqtt = require("mqtt");

// Express setup

(async () => {
  try {
    const app = express();
    app.disable("x-powered-by");
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    const apiRouter = express.Router();
    app.use("", apiRouter);

    apiRouter.get("/prometheus", async (req, res) => {
      console.log("Exporting Prometheus stats...");
      try {
        res.set("Content-Type", register.contentType);
        const metrics = await register.metrics();
        res.end(metrics);
      } catch (err) {
        res.status(400).send(err);
      }
    });

    // Error handler
    app.use(function (err, req, res, next) {
      res.locals.message = err.message;
      // Also log it to the console
      console.log(
        `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
          req.method
        } - ${req.ip}`
      );
      // Render the error page
      res.status(err.status || 500);
      res.json({
        message: err.message,
        error: err,
      });
    });

    // Start listening on the defined port
    app.listen(8053, "0.0.0.0", function () {
      console.log(`Listening on port ${8053}`);
    });
  } catch (err) {
    console.log(err);
  }
})();

// Prometheus setup

const zigbee_watt = new promClient.Gauge({
  name: "zigbee_watt",
  help: "Zigbee power socket wattage",
  labelNames: ["name"],
});
const zigbee_consumption = new promClient.Gauge({
  name: "zigbee_consumption",
  help: "Zigbee power socket power consumption",
  labelNames: ["name"],
});
const zigbee_state = new promClient.Gauge({
  name: "zigbee_state",
  help: "Zigbee device state (on/off)",
  labelNames: ["name"],
});
const zigbee_temp = new promClient.Gauge({
  name: "zigbee_temp",
  help: "Zigbee device temperature",
  labelNames: ["name"],
});
const zigbee_humidity = new promClient.Gauge({
  name: "zigbee_humidity",
  help: "Zigbee device humidity",
  labelNames: ["name"],
});
const zigbee_co2 = new promClient.Gauge({
  name: "zigbee_co2",
  help: "Zigbee device CO2",
  labelNames: ["name"],
});
const zigbee_voc = new promClient.Gauge({
  name: "zigbee_voc",
  help: "Zigbee device VOC",
  labelNames: ["name"],
});
const zigbee_formaldehyde = new promClient.Gauge({
  name: "zigbee_formaldehyde",
  help: "Zigbee device formaldehyde",
  labelNames: ["name"],
});
const zigbee_pm25 = new promClient.Gauge({
  name: "zigbee_pm25",
  help: "Zigbee device pm25",
  labelNames: ["name"],
});
const zigbee_link = new promClient.Gauge({
  name: "zigbee_link",
  help: "Zigbee device link quality",
  labelNames: ["name"],
});
const zigbee_voltage = new promClient.Gauge({
  name: "zigbee_voltage",
  help: "Zigbee power socket voltage",
  labelNames: ["name"],
});
const zigbee_current = new promClient.Gauge({
  name: "zigbee_current",
  help: "Zigbee power socket amperage",
  labelNames: ["name"],
});
const zigbee_energy = new promClient.Gauge({
  name: "zigbee_energy",
  help: "Zigbee power socket kWh",
  labelNames: ["name"],
});
register.registerMetric(zigbee_watt);
register.registerMetric(zigbee_consumption);
register.registerMetric(zigbee_state);
register.registerMetric(zigbee_temp);
register.registerMetric(zigbee_humidity);
register.registerMetric(zigbee_co2);
register.registerMetric(zigbee_voc);
register.registerMetric(zigbee_formaldehyde);
register.registerMetric(zigbee_pm25);
register.registerMetric(zigbee_link);
register.registerMetric(zigbee_voltage);
register.registerMetric(zigbee_current);
register.registerMetric(zigbee_energy);

// MQTT setup

const options = {
  clientId: "promlogger",
  //username:"VUL IN",
  //password:"VUL IN",
  clean: true,
};

var mqttClient = mqtt.connect("mqtt://localhost", options);

mqttClient.on("error", function (error) {
  console.log("Can't connect" + error);
  process.exit(1);
});

mqttClient.on("connect", function () {
  console.log("connected");
  mqttClient.subscribe("zigbee2mqtt/Servers");
  mqttClient.subscribe("zigbee2mqtt/Koelkast");
  mqttClient.subscribe("zigbee2mqtt/Gang");
  mqttClient.subscribe("zigbee2mqtt/Slaapkamer");
  mqttClient.subscribe("zigbee2mqtt/TV (bovenste stekker)");
  mqttClient.subscribe("zigbee2mqtt/TV (onderste stekker)");
  mqttClient.subscribe("zigbee2mqtt/Koffie");
  mqttClient.subscribe("zigbee2mqtt/Bureau (bovenste stekker)");
  mqttClient.subscribe("zigbee2mqtt/Bureau (onderste stekker)");
  mqttClient.subscribe("zigbee2mqtt/Air Meter");
});

mqttClient.on("message", function (topic, message, packet) {
  const sTopic = topic.split("/");
  if (sTopic[0] == "zigbee2mqtt") {
    try {
      let stats_zigbee = JSON.parse(message);

      if (stats_zigbee["power"]) {
        zigbee_watt.set({ name: sTopic[1] }, stats_zigbee["power"]);
      }
      if (stats_zigbee["consumption"]) {
        zigbee_consumption.set(
          { name: sTopic[1] },
          stats_zigbee["consumption"]
        );
      }
      if (stats_zigbee["state"]) {
        zigbee_state.set(
          { name: sTopic[1] },
          stats_zigbee.state == "ON" ? 1 : 0
        );
      }
      if (stats_zigbee["temperature"]) {
        zigbee_temp.set({ name: sTopic[1] }, stats_zigbee["temperature"]);
      }
      if (stats_zigbee["humidity"]) {
        zigbee_humidity.set({ name: sTopic[1] }, stats_zigbee["humidity"]);
      }
      if (stats_zigbee["co2"]) {
        zigbee_co2.set({ name: sTopic[1] }, stats_zigbee["co2"]);
      }
      if (stats_zigbee["voc"]) {
        zigbee_voc.set({ name: sTopic[1] }, stats_zigbee["voc"]);
      }
      if (stats_zigbee["formaldehyd"]) {
        zigbee_formaldehyde.set(
          { name: sTopic[1] },
          stats_zigbee["formaldehyd"]
        );
      }
      if (stats_zigbee["pm25"]) {
        zigbee_pm25.set({ name: sTopic[1] }, stats_zigbee["pm25"]);
      }
      if (stats_zigbee["linkquality"]) {
        zigbee_link.set({ name: sTopic[1] }, stats_zigbee["linkquality"]);
      }
      if (stats_zigbee["voltage"]) {
        zigbee_voltage.set({ name: sTopic[1] }, stats_zigbee["voltage"]);
      }
      if (stats_zigbee["current"]) {
        zigbee_current.set({ name: sTopic[1] }, stats_zigbee["current"]);
      }
      if (stats_zigbee["energy"]) {
        zigbee_energy.set({ name: sTopic[1] }, stats_zigbee["energy"]);
      }
    } catch (e) {
      console.log(e);
    }
    return;
  }
  console.log("Unhandled topic '" + topic + "'");
});
