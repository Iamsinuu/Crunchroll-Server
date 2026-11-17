const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const TARGET_HOST = 'https://sso.crunchyroll.com';

// Raw text body capture karne ke liye middleware
app.use(express.text({ type: '*/*', limit: '10mb' }));

// ==========================================
// 1. /login ke liye Hardcoded Headers & Body
// ==========================================
const LOGIN_HEADERS = {
  "Host": "sso.crunchyroll.com",
  "Connection": "keep-alive",
  "x-amz-content-sha256": "169d5440c6dd2a1078f104b155ec6f448f7dce0a38e5cd08de7f39ee65b2f867",
  "sec-ch-ua-platform": "\"Android\"",
  "Next-Action": "8176df3ce69c6397ffaf1fd9b4916cf4677e7f46",
  "sec-ch-ua": "\"Not-A.Brand\";v=\"99\", \"Android WebView\";v=\"157\", \"Chromium\";v=\"157\"",
  "sec-ch-ua-mobile": "?1",
  "Next-Router-State-Tree": "%5B%22%22%2C%7B%22children%22%3A%5B%5B%22locale%22%2C%22en%22%2C%22d%22%5D%2C%7B%22children%22%3A%5B%22login%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D%7D%2Cnull%2Cnull%5D",
  "User-Agent": "Mozilla/5.0 (Linux; Android 10; Redmi Note 7 Pro Build/QKQ1.190915.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/157.0.8103.38 Mobile Safari/537.36",
  "Accept": "text/x-component",
  "Content-Type": "text/plain;charset=UTF-8",
  "Origin": "https://sso.crunchyroll.com",
  "X-Requested-With": "com.crunchyroll.crunchyroid",
  "Sec-Fetch-Site": "same-origin",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Dest": "empty",
  "Referer": "https://sso.crunchyroll.com/login?return_url=%2Fauthorize%3Fclient_id%3Dvtdizwxdmekmsmbguice%26redirect_uri%3Dhttps%253A%252F%252Fsso.crunchyroll.com%252Fandroid%252Foauth-callback%26response_type%3Dcode%26scope%3Doffline_access%26state%3D%257B%2522flow%2522%253A%2522SIGN_IN%2522%252C%2522flowRoot%2522%253A%2522ONBOARDING%2522%257D%26code_challenge%3D44df03a6-1a68-4140-ad02-130aaef2d439%26code_challenge_method%3Dplain&mode=android&dc=1&hf=1&anonymous_id=35eb850b-8519-4d9a-b68a-ab24ecbad7ac",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-IN,en-US;q=0.9,en;q=0.8",
  "Cookie": "c_locale=en-US; ajs_anonymous_id=35eb850b-8519-4d9a-b68a-ab24ecbad7ac; __cf_bm=CpLDeYGwK257b2z0g2YkoyzrgXUqSqE6CZ1A8SFbJw8-1794831459.9466183-1.0.1.1-qfE8e4YTg1tX32_iP7VsvO8_ga1HVSEwD59ScSruPaDm1BKeWpdUgdVjjPGrs6YgYNaVBqkWt8xWbxUyXI2TEZTa4LmYAkRrIUxmKCFeuzNys0F7j95d_oKoocUzN.pAdjx12NPxRYwmmhIl.x4CLQ; NEXT_LOCALE=en; sso_client_name=CR%20Android; client_id=vtdizwxdmekmsmbguice"
};

const LOGIN_BODY = JSON.stringify([
  {
    "email": "xjaatteam@gmail.com",
    "password": "Ikbal@7866",
    "recaptchaToken": "0cAFcWeA7orsBz56zMnQV6LPwS_g7TqWMCA945sIbiCE96cGt1nfDImHn7eHeUboTfLRbm6tw8t4eRU64wX_uU3ktLs0Vs-DgNFuriV99hlH8VZrQ07SQJW1mXT0Iqv9YAWSX0ncO9k78gFJdC_WgPxGpoO04i-CyfsPXbMERM0iPq1zPIVOmN_YCN6-snT6lgDT1drrd51kXGWDKvEllrjSFCOdsD7Yf5t2FZ_h0Q0av5ujJs-bJint91x2ATRwn1XksG_lVTTArzXuDM0Hc32L1_f28RDJ2fx78jPylwOrYc-oi3vGIpJ8ZNr76st6zmcaCMw6ozyPEfPdAvSrqpWzMbHjt0uoFO7sBOq0NW8VM7-XncZlmQYN-v7Z70vSw1GGohY-vHZa8DuIHrlQL8cGRxd7pnvdApI1OvGfnDKpubAbGfDfLMh9c7z7rCXJeAZe3yR0n-iJABFpm4HnvG9t2wScMlnkilgmYjUeXT7xvL0JnfR_VzQOKa49jV231A5qkKGnkIlB-wb-p-N15Ah1rdKmElyEYuPlzSu0XjADRVvfFuPxh-sAQB70mxLmBd6y2Pb9Dif_NtLNxvPF32iS4VNjaRCWJkiuUTnWZQfSQgpZBFf5tTn36UhZm3mAnj9P7yrkVXmzmV7jmqrzy_DOyXTRblsirzi6zD-IjyTbqXsvmw-TZSd6hkpOgFPe259c3TSzefda0_WQvdnaOqXK3rWd0RrFlgGNBh228_B7duijQz4bQ6WLFltewL8w9y21PUSMgJE6WPAD1PZpZPwZTXsMZiZGx8hFstboUOchqaFF8wbnS4hy9Axg5JXlkhh5zNeSBqmAzUw5AChA3w--8cR1pesh1VPA8_Y19EosuctVKfLB-W-s9b6inUMqTm6pzAprrNjFsAQDBhBeE39ay8_h9qB6_tf5fxkzLZg_klmaiWUCdwDuGTbn3ry6MLKzF7Ia41TKmf7RaMdnQaJkEYfo-wgHmEam0VXbFWuVfyNaS2LDCAaAlyNK1HC77kFqtLw1II_EIYH3UT0PKkxRimt4D6ezAGlZGQQpOwnGvRpxbUcjuZqs_q4fL-lx21tFkkE18fQlCBgxzu8XB4TyzMbXH3xuxzhFd-L2l8lYUwXDNA9Wrozy1S_TbQOKKxRS4GhBY7ln5rFhSjc2YS3PXBethCXK7zW3_akuZHMIxrd4MO5k5_RpEbJYkssYNS9qeuBAeh7g-S4WDyiFLrUG4SSjmHm84QupKLDUFvEcddGSRum41SAYQjbg17X_aj5ZpnMVf97Y5oiUbfo-HJRQvdCOvIVdaF3XJPuFDafkgUbanatzRRHpX6i4yl0iZiCyFkwmpjcznt8yMLEYIDJdsA8Jyxg4S2Z2KhOlRptuwkfBuHFf4zI3HA9apieaaaelQ6II-L2gIVQbuNmY-ZlRt41aKbapYOkeLTaGBakzkLSOwRm6DJKpex9hDdrKiaaBTu9cWO5THoZynzk3S-iCgpIJWp-60UL6uVJoZerBcb5dv3orkWn2_KUv3iO3fgXIQoquwt8r-9Fr1nLf-M6iH_668QE9rHB1bVsLHchBNDq1QS1rSADZzsSfRSLi42AdNGeX-ow_nJqTCsOxqhot12yHClHrcGhwgNLscA5XYdiXBnr9IO1YzAlsQ3TTFPQdNH-DT7XC33pATIOq8N3gBS6RxC5yMPB2MQLtKaXOHCUpLpyyUEtf4WHcnypyJUejM3gBRrA1aZgdRBo2l0UeeG26H4jVwnLRM_G9ckJGL8plV-qX03TOjkEVeKSq8kNR2338ApUdJiyZLvb1i-BTMtOblAM929qeBTJKEwNvQc6oYDWuUGFRZZl03RtFfienYJqtzWsD-LazQl_zD47gXX0IxK2j7eLA8_ujMsoiEZrUqsBKFl3dS94JnL0yk1pAdebjl60hZudMMDRTZwmgTgVfGJeHLggfYSYjMql8P9RSKcGRLPTwshvs7GCAyILQb6AXGGvA0f7XtI8LZ5jIUoyD_wM8XnKFgpv_nt5M4w6ZkXGMzHbVKtRKkYcbcs5wupIgb4GXART3XCaIjYxqSDprv_MS3q3Ub_C4Hz2XvMfTrLjnz1YCavv2-xaCPx18Rl0blJEihrBJq4Y6MQOtPreXqSfVe1hMYucXlrEbm8G0v8L3Q4X7VXLRh2iYaseIZFLFGVCpbfYywbJcTPgQEHSwiqC4zLpNsWl5tynyLbXosr9vWQJRQ8H5s-RpSONw53jfrp6hm6t4q2KdYgKSGOwOy41S9RMAX_JO_VBLnC2hUxQ-86HryTGC1xc0uLpCgMOrw-k1NKgG7n6pVLt0_UafKm_ECd0XAN5iz1WO2ulI9A7iW990nlpmJObjzGJEQJAYjpOmoNKIkvePTdbqngyDGZ_gOPak_eK41SF86tngS9bLiKuevssOsPUEW9KiauE_iJ4IAJCalwoERKyzXToeINirD8pZC1cjJ0TmIjJncUNCEpszKYDWNWdFh-r4DBObQK5BK_q3lbz6Qta-Hzm0hsBt7mBoiEmrrjlW34qN1PefiuJio"
  },
  {
    "eventSource": "$undefined",
    "attributionPartner": "$undefined",
    "utmSource": "$undefined",
    "utmCampaign": "$undefined",
    "referrer": "$undefined",
    "pageOrScreen": "Login - Enter Password"
  }
]);

// ==========================================
// 2. /authorize ke liye Hardcoded Headers
// ==========================================
const AUTHORIZE_HEADERS = {
  "Host": "sso.crunchyroll.com",
  "Connection": "keep-alive",
  "Upgrade-Insecure-Requests": "1",
  "User-Agent": "Mozilla/5.0 (Linux; Android 10; Redmi Note 7 Pro Build/QKQ1.190915.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/157.0.8103.38 Mobile Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/jxl,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "accept-language": "en-US",
  "X-Requested-With": "com.crunchyroll.crunchyroid",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-User": "?1",
  "Sec-Fetch-Dest": "document",
  "sec-ch-ua": "\"Not-A.Brand\";v=\"99\", \"Android WebView\";v=\"157\", \"Chromium\";v=\"157\"",
  "sec-ch-ua-mobile": "?1",
  "sec-ch-ua-platform": "\"Android\"",
  "Accept-Encoding": "gzip, deflate, br",
  "Cookie": "c_locale=en-US; ajs_anonymous_id=c8a743ac-715f-41df-be0c-a0dbc11f7935; __cf_bm=6qqkvmkMWoutlbu2dRm.sRv5rNQNSfXLEYO2XPOE.o8-1794894886.8761616-1.0.1.1-y2E0BZ_bFW3ihLGKsKVb_lyN_MJ554X0c10jK884XTatQQJdd.7WMPENPxsvRUozKnUDcXoHkvnXMl7Q9cggJULg_XT8JqmFA4Yz8El_ITQB6GUXLIK.JmWJXYPa03IpU8qRa4lzJHRTthqtlUaeQQ"
};

// ==========================================
// 3. /en/authorize ke liye Hardcoded Headers
// ==========================================
const EN_AUTHORIZE_HEADERS = {
  "Host": "sso.crunchyroll.com",
  "Connection": "keep-alive",
  "sec-ch-ua": "\"Not-A.Brand\";v=\"99\", \"Android WebView\";v=\"157\", \"Chromium\";v=\"157\"",
  "sec-ch-ua-mobile": "?1",
  "sec-ch-ua-platform": "\"Android\"",
  "Upgrade-Insecure-Requests": "1",
  "User-Agent": "Mozilla/5.0 (Linux; Android 10; Redmi Note 7 Pro Build/QKQ1.190915.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/157.0.8103.38 Mobile Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/jxl,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "accept-language": "en-US",
  "X-Requested-With": "com.crunchyroll.crunchyroid",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-User": "?1",
  "Sec-Fetch-Dest": "document",
  "Accept-Encoding": "gzip, deflate, br",
  "Cookie": "c_locale=en-US"
};

// Helper function: Original server ko request bhejkar response app ko forward karna
async function forwardRequest(req, res, targetPath, customHeaders, customBody = null) {
  try {
    // Query parameters agar app se aa rahe hain toh unhe bhi attach karein
    const queryString = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    const fullUrl = `${TARGET_HOST}${targetPath}${queryString}`;

    console.log(`[Proxy] Forwarding ${req.method} -> ${fullUrl}`);

    const headersToSend = { ...customHeaders };
    if (customBody !== null) {
      headersToSend['Content-Length'] = Buffer.byteLength(customBody, 'utf8');
    }

    const response = await axios({
      method: customBody !== null ? 'POST' : req.method,
      url: fullUrl,
      headers: headersToSend,
      data: customBody !== null ? customBody : undefined,
      responseType: 'arraybuffer',
      maxRedirects: 0, // Redirects (302/307) ko direct app par forward karne ke liye
      validateStatus: () => true // Sabhi status codes (200, 302, 400, 403, etc.) accept karein
    });

    // Original server ke response headers set karein (hop-by-hop headers chhodkar)
    Object.entries(response.headers).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();
      if (!['transfer-encoding', 'content-encoding', 'content-length', 'connection'].includes(lowerKey)) {
        res.setHeader(key, value);
      }
    });

    res.status(response.status).send(response.data);
  } catch (error) {
    console.error(`[Error] ${targetPath}:`, error.message);
    res.status(502).json({ error: 'Failed to forward request to original server', details: error.message });
  }
}

// Route 1: /login (Hardcoded Headers + Hardcoded Body)
app.all('/login', (req, res) => {
  forwardRequest(req, res, '/login', LOGIN_HEADERS, LOGIN_BODY);
});

// Route 2: /authorize (Sirf Hardcoded Headers)
app.all('/authorize', (req, res) => {
  forwardRequest(req, res, '/authorize', AUTHORIZE_HEADERS, null);
});

// Route 3: /en/authorize (Sirf Hardcoded Headers)
app.all('/en/authorize', (req, res) => {
  forwardRequest(req, res, '/en/authorize', EN_AUTHORIZE_HEADERS, null);
});

// Baaki kisi bhi path ke liye transparent fallback proxy
app.all('*', async (req, res) => {
  try {
    const fullUrl = `${TARGET_HOST}${req.originalUrl}`;
    const headers = { ...req.headers, host: 'sso.crunchyroll.com' };
    delete headers['content-length'];

    const response = await axios({
      method: req.method,
      url: fullUrl,
      headers,
      data: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
      responseType: 'arraybuffer',
      maxRedirects: 0,
      validateStatus: () => true
    });

    Object.entries(response.headers).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();
      if (!['transfer-encoding', 'content-encoding', 'content-length', 'connection'].includes(lowerKey)) {
        res.setHeader(key, value);
      }
    });

    res.status(response.status).send(response.data);
  } catch (error) {
    res.status(502).json({ error: 'Proxy error', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
