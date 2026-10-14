

const http = require('http');
const fs = require('fs');
const path = require('path');

let PORT = parseInt(process.env.PORT, 10) || 3000;

// Try loading Express if available
let express = null;
try {
  express = require('express');
} catch (e) {
  express = null;
}

function startServer(port) {
  if (express) {
    // ----------------------------------------------------
    // Express.js Server
    // ----------------------------------------------------
    const app = express();
    app.use(express.static(__dirname));

    app.get('/api/status', (req, res) => {
      res.json({
        app: 'ClientFlow CRM',
        serverType: 'Express.js',
        status: 'online',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });
    });

    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'index.html'));
    });

    const server = app.listen(port, () => {
      printBanner(port, 'Express.js Server');
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️  Port ${port} is currently busy. Trying port ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error('Server error:', err);
      }
    });

  } else {
    // ----------------------------------------------------
    // Native Node.js HTTP Server (Zero Dependencies)
    // ----------------------------------------------------
    const MIME_TYPES = {
      '.html': 'text/html; charset=UTF-8',
      '.css': 'text/css; charset=UTF-8',
      '.js': 'application/javascript; charset=UTF-8',
      '.json': 'application/json; charset=UTF-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };

    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0];
      if (reqPath === '/') reqPath = '/index.html';

      if (reqPath === '/api/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          app: 'ClientFlow CRM',
          serverType: 'Node.js Native HTTP',
          status: 'online',
          version: '1.0.0',
          timestamp: new Date().toISOString()
        }));
      }

      const filePath = path.join(__dirname, reqPath);
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, content) => {
        if (err) {
          if (err.code === 'ENOENT') {
            fs.readFile(path.join(__dirname, 'index.html'), (fallErr, fallContent) => {
              if (fallErr) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
              } else {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
                res.end(fallContent);
              }
            });
          } else {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Server Error: ' + err.code);
          }
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        }
      });
    });

    server.listen(port, () => {
      printBanner(port, 'Native Node.js Server (Zero Dependencies)');
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️  Port ${port} is currently busy. Trying port ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error('Server error:', err);
      }
    });
  }
}

function printBanner(port, mode) {
  console.log('========================================================');
  console.log('🚀 ClientFlow CRM is up and running!');
  console.log(`🌐 Local URL:   http://localhost:${port}`);
  console.log(`⚡ Mode:        ${mode}`);
  console.log(`📁 Directory:   ${__dirname}`);
  console.log('========================================================');
}

// Start on initial port
startServer(PORT);
