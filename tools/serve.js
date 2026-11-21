// Tiny static server so the app runs on http://localhost (needed for offline mode + "Install app").
// Usage: node tools/serve.js   →  http://localhost:5173
const http = require("http"), fs = require("fs"), path = require("path");
const root = path.resolve(process.argv[2] || path.join(__dirname, ".."));
const port = +process.env.PORT || 5173;
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webmanifest": "application/manifest+json", ".json": "application/json", ".svg": "image/svg+xml" };
http.createServer((req, res) => {
  let p = path.normalize(path.join(root, decodeURIComponent(req.url.split("?")[0])));
  if (!p.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (p === root || p.endsWith(path.sep)) p = path.join(p, "index.html");
  fs.readFile(p, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": (types[path.extname(p)] || "application/octet-stream") + "; charset=utf-8", "Cache-Control": "no-cache" });
    res.end(data);
  });
}).listen(port, "127.0.0.1", () => console.log(`World Kitchen running at http://localhost:${port}`));
