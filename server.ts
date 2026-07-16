import { createServer } from "http";
import next from "next";
import { initSocketServer } from "./src/socket/index.ts";
import { config } from "dotenv";
config({ path: ".env.local" });

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = Number(process.env.PORT) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handle);

  initSocketServer(httpServer);

  httpServer.listen(port, hostname, () => {
    console.log(`Listening on http://${hostname}:${port}`);
  });
});
