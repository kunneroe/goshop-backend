import { app } from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  // Friendly startup message for local development
  console.log(`Goshop backend running on http://localhost:${env.PORT}`);
});
