const express = require('express');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsers
app.use(express.text({ type: '*/*', limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// Custom HTTPS Agent to avoid ECONNRESET and handle SSL securely
const agent = new https.Agent({  
  rejectUnauthorized: false,
  keepAlive: true
});

app.all('*', (req, res) => {
  const options = {
    hostname: 'sso.crunchyroll.com',
    port: 443,
    path: req.originalUrl,
    method: req.method,
    headers: {
      ...req.headers,
      host: 'sso.crunchyroll.com',
      // Cloudflare/CloudFront bypass headers
      'accept-encoding': 'identity'
    },
    agent: agent
  };

  // Remove hop-by-hop or problematic headers
  delete options.headers['content-length'];

  let requestBody = req.body;
  if (requestBody && typeof requestBody === 'object' && !Buffer.isBuffer(requestBody)) {
    requestBody = JSON.stringify(requestBody);
  }

  if (requestBody) {
    options.headers['content-length'] = Buffer.byteLength(requestBody, 'utf8');
  }

  const proxyReq = https.request(options, (proxyRes) => {
    // Forward original response headers
    const headers = { ...proxyRes.headers };
    
    // Check if it's HTML to inject auto-fill
    let data = [];
    proxyRes.on('data', (chunk) => {
      data.push(chunk);
    });

    proxyRes.on('end', () => {
      let buffer = Buffer.concat(data);
      const contentType = headers['content-type'] || '';

      if (contentType.includes('text/html')) {
        let htmlContent = buffer.toString('utf8');
        
        const autoFillScript = `
          <script>
            document.addEventListener("DOMContentLoaded", function() {
              setTimeout(() => {
                const emailInput = document.querySelector('input[name="email"], input[type="email"]');
                const passwordInput = document.querySelector('input[name="password"], input[type="password"]');
                
                if (emailInput && passwordInput) {
                  emailInput.value = "xjaatteam@gmail.com";
                  emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                  
                  passwordInput.value = "Ikbal@7866";
                  passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
              }, 1000);
            });
          </script>
        `;

        if (htmlContent.includes('</body>')) {
          htmlContent = htmlContent.replace('</body>', autoFillScript + '</body>');
        } else {
          htmlContent += autoFillScript;
        }

        headers['content-length'] = Buffer.byteLength(htmlContent, 'utf8');
        res.writeHead(proxyRes.statusCode, headers);
        return res.end(htmlContent);
      }

      res.writeHead(proxyRes.statusCode, headers);
      res.end(buffer);
    });
  });

  proxyReq.on('error', (err) => {
    console.error('[Proxy Connection Error]:', err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Proxy failed to forward request', details: err.message });
    }
  });

  if (requestBody) {
    proxyReq.write(requestBody);
  }
  
  proxyReq.end();
});

app.listen(PORT, () => {
  console.log(`Stable Proxy Server running on port ${PORT}`);
});