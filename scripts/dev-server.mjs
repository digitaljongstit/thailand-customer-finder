import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.ts': 'text/javascript' };
createServer(async (req, res) => {
  const url = req.url === '/' ? '/index.html' : req.url || '/index.html';
  try {
    const data = await readFile(join(process.cwd(), url));
    res.writeHead(200, { 'content-type': types[extname(url)] || 'text/plain' });
    res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(5173, () => console.log('http://localhost:5173'));
