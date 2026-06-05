console.log("Node version:", process.version);

console.log("TEST MARKER 12345");
const SUPABASE_URL = "https://bviyreyhvgjvwwubmrvw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2aXlyZXlodmdqdnd3dWJtcnZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNDQzNjksImV4cCI6MjA5NTkyMDM2OX0.MqWrq2-TfdC1neI3yJfBNF4ebem-YLzkXORLx08xK9A";

const sensors = [
  {
    id: "wave_01",
    waterRise: 0.0,
    isRising: true,
    speed: 0.4,
  },
  {
    id: "wave_02",
    waterRise: 0.5,
    isRising: true,
    speed: 0.2,
  },
];

function getTierLevel(waterRiseMeters) {
  if (waterRiseMeters < 1.5) return "Safe";
  if (waterRiseMeters < 2.5) return "Alert";
  if (waterRiseMeters < 4.0) return "Warning";
  return "Critical";
}

async function postMockTelemetry() {
  for (const sensor of sensors) {
    if (sensor.isRising) {
      sensor.waterRise += Math.random() * sensor.speed;

      if (sensor.waterRise >= 4.5) {
        sensor.isRising = false;
      }
    } else {
      sensor.waterRise -= Math.random() * (sensor.speed * 0.8);

      if (sensor.waterRise <= 0) {
        sensor.waterRise = 0;
        sensor.isRising = true;
      }
    }

    const payload = {
      device_id: sensor.id,
      water_rise_m: Number(sensor.waterRise.toFixed(2)),
      tier_level: getTierLevel(sensor.waterRise),
      recorded_at: new Date().toISOString(),
    };
    console.log(
      `[${sensor.id}] Sending ${payload.water_rise_m}m -> ${payload.tier_level}`
    );

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/telemetry_readings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            Prefer: "return=representation",
          },
          body: JSON.stringify(payload),
        },
        console.log(
          "PAYLOAD:",
          JSON.stringify(payload, null, 2)
        
      ));

      console.log("Response headers:");
console.log([...response.headers.entries()]);

      const result = await response.text();

      console.log(
        `[${sensor.id}] Status:`,
        response.status
      );

      console.log(
        `[${sensor.id}] Response:`,
        result
      );
    } catch (error) {
      console.error(
        `[${sensor.id}] Error:`,
        error
      );
    }
  }
}

console.log(
  "Starting Dual Virtual W.A.V.E. Sensors..."
);

postMockTelemetry();

console.log("URL:", SUPABASE_URL);
console.log("Key prefix:", SUPABASE_ANON_KEY.slice(0, 20));
setInterval(postMockTelemetry, 10000);