// Minimal static server for `out/`: `/other` -> `other.html`, everything else as a file. Logs every request.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = join(process.cwd(), "out");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".txt": "text/plain", ".json": "application/json" };
const port = Number(process.env.PORT ?? 3000);

createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
  const candidates = path.endsWith("/") ? [join(path, "index.html")] : [path, `${path}.html`];
  for (const c of candidates) {
    try {
      const body = await readFile(join(root, c));
      res.writeHead(200, { "content-type": types[extname(c)] ?? "application/octet-stream" });
      res.end(req.method === "HEAD" ? undefined : body);
      console.log(`${req.method} ${req.url} 200`);
      return;
    } catch {}
  }
  res.writeHead(404).end();
  console.log(`${req.method} ${req.url} 404`);
}).listen(port, () => console.log(`serving out/ on http://localhost:${port}`));
