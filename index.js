const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const TARGET_HOST = 'https://sso.crunchyroll.com';

// Sabhi tarah ke body data ko parse karne ke liye (JSON, URL-encoded, text)
app.use(express.text({ type: '*/*', limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// Transparent & Smart Proxy Handler
app.all('*', async (req, res) => {
  try {
    const fullUrl = `${TARGET_HOST}${req.originalUrl}`;
    console.log(`[Proxy] ${req.method} -> ${fullUrl}`);

    // App ke incoming headers ko as-it-is lein aur host update karein
    const headers = { ...req.headers };
    headers['host'] = 'sso.crunchyroll.com';

    let requestData = req.body;

    // Agar body object mein hai toh use wapas stringify karein
    if (requestData && typeof requestData === 'object' && !Buffer.isBuffer(requestData)) {
      requestData = JSON.stringify(requestData);
    }

    if (requestData) {
      headers['content-length'] = Buffer.byteLength(requestData, 'utf8');
    }

    const response = await axios({
      method: req.method,
      url: fullUrl,
      headers: headers,
      data: ['GET', 'HEAD'].includes(req.method) ? undefined : requestData,
      responseType: 'arraybuffer',
      maxRedirects: 0,
      validateStatus: () => true
    });

    // Original headers forward karein
    Object.entries(response.headers).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();
      if (!['transfer-encoding', 'connection'].includes(lowerKey)) {
        res.setHeader(key, value);
      }
    });

    let responseBody = response.data;
    const contentType = response.headers['content-type'] || '';

    // Agar login page ya HTML response hai, toh auto-fill script inject kar do
    if (contentType.includes('text/html') && responseBody) {
      let htmlContent = responseBody.toString('utf8');

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
                
                console.log("[Auto-Login] Credentials filled automatically.");
              }
            }, 1000);
          });
        </script>
      `;

      // </body> tag ke theek pehle script inject kar dena
      if (htmlContent.includes('</body>')) {
        htmlContent = htmlContent.replace('</body>', autoFillScript + '</body>');
      } else {
        htmlContent += autoFillScript;
      }

      res.setHeader('content-length', Buffer.byteLength(htmlContent, 'utf8'));
      return res.status(response.status).send(htmlContent);
    }

    res.status(response.status).send(responseBody);
  } catch (error) {
    console.error('[Proxy Error]:', error.message);
    res.status(502).json({ error: 'Proxy failed to forward request', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Auto-Login Proxy Server running on port ${PORT}`);
});