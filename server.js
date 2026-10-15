const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, "wwwroot");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

function safeResolve(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const cleaned = decoded === "/" ? "/index.html" : decoded;
  const fullPath = path.normalize(path.join(ROOT, cleaned));

  if (!fullPath.startsWith(ROOT)) {
    return null;
  }

  return fullPath;
}

function sendFile(filePath, res) {
  fs.stat(filePath, (statErr, stat) => {
    if (statErr || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 Not Found");
      return;
    }    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    // HTML, CSS y JS siempre se revalidan: así los cambios de estilo se ven
    // al instante y no se sirve una hoja de estilos obsoleta desde la caché.
    const mustRevalidate = [".html", ".css", ".js"].includes(ext);
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": mustRevalidate ? "no-cache" : "public, max-age=86400"
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);

    stream.on("error", () => {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("500 Internal Server Error");
    });
  });
}

const server = http.createServer((req, res) => {
  const requestedPath = safeResolve(req.url || "/");

  if (!requestedPath) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("400 Bad Request");
    return;
  }

  sendFile(requestedPath, res);
});

server.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
