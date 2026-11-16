const express = require('express');
const axios = require('axios');
const compression = require('compression');
const http = require('http');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.text({ type: 'text/*', limit: '10mb' }));

const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 100 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 100 });

const proxyClient = axios.create({
    httpAgent,
    httpsAgent,
    timeout: 15000,
    maxRedirects: 0, // Let WebView handle redirects properly
    validateStatus: () => true
});

let CURRENT_AUTH_DATA = {
    "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImtrOUFVTlowY3hDYlRjRG9MT01FeFEiLCJ0eXAiOiJKV1QifQ.eyJhbm9ueW1vdXNfaWQiOiI4N2RkYTQ5ZC1lNmM1LTRiMDItOTAzMC0xMTBiYzYyYzg4OWEiLCJiZW5lZml0cyI6W10sImNsaWVudF9pZCI6ImNyX2FuZHJvaWQiLCJjbGllbnRfdGFnIjoiMy4xMjkuMSIsImNvdW50cnkiOiJJTiIsImRldmljZV9pZCI6IjgzMzQ5ZGZiLTc2OGEtNDJhYy04YTJkLWFlMzU3NGIzNmMzMSIsImV0cF91c2VyX2lkIjoiYmIzOGE1YzctYjIzZS01ODY3LTk5ZDgtOGJiNWZlOTZkN2I3IiwiZXhwIjoxNzk0NzYzMTQ3LCJleHRlbmRlZF9tYXR1cml0eSI6eyJBVSI6IlIgMTgrIiwiQlIiOiIxOCIsIklOIjoiQSIsIktSIjoiMTkiLCJVTiI6IjE4In0sImp0aSI6IjMyZmMxMzAxLWU5MmEtNGNkNy1hNzMyLTQ1ZTg2YTQxOWY3NCIsIm1hdHVyaXR5IjoiTTMiLCJvYXV0aF9zY29wZXMiOiJhY2NvdW50IGNvbnRlbnQgbXA6bGltaXRlZCBvZmZsaW5lX2FjY2VzcyBwaW5zIHJldmlld3MgdGFsa2JveCB0ZWVuLXByb2ZpbGUiLCJwcm9maWxlX2lkIjoiYmIzOGE1YzctYjIzZS01ODY3LTk5ZDgtOGJiNWZlOTZkN2I3IiwicHJvZmlsZV90eXBlIjoiYWdncmV0c3VrbyIsInJ0X2lkIjoiZGJzdWY1bzdjMHVxMGVndnA2a2ciLCJzY29wZXMiOnsiY3IiOnsiYWNjX2lkIjoiYmIzOGE1YzctYjIzZS01ODY3LTk5ZDgtOGJiNWZlOTZkN2I3IiwiZXh0X2lkIjoiMTI5NDc5MTQ0NyJ9fSwic3RhdHVzIjoiQUNUSVZFIiwidG50IjoiY3IifQ.rMEJUhD51ytCax6qbR9Ko8w7n9cKWf2_LXW1fglX2fFeYiwUN9sjKWxGRFpIlnrIUM5DiJlCrw_ix5zNdRWw_Hobb-Q4W_qFVRwaMhqE2h1VwYDRLAYww49ud-Sa6Epj88JOo7clHeGnExWKS2liq9X9C3dnE6sQ7fUxNHJcVE7qnvkNDSZblvOjrGY9OWXajNEgCcvlCDWu9lmkb1z5z9hoOJAzjyymmyViMHlP1LYjaiIGIMpUn1NnlD_lUEMzdv002jMzB-cqbIFMfw-O8cUDH794JvWAMXtOxTkSzZ4e0yitIDPEbjpglk0X31Azpx6Q8eShqFCsjhvFEIktsA",
    "refresh_token": "925d1bee-b016-4079-9ef7-95fb79b1077e",
    "expires_in": 300,
    "token_type": "Bearer",
    "scope": "account content mp:limited offline_access pins reviews talkbox teen-profile",
    "country": "IN",
    "account_id": "bb38a5c7-b23e-5867-99d8-8bb5fe96d7b7",
    "profile_id": "bb38a5c7-b23e-5867-99d8-8bb5fe96d7b7"
};

const SSO_LOGIN_HEADERS = {
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
    "Accept-Language": "en-IN,en-US;q=0.9,en;q=0.8",
    "Cookie": "c_locale=en-US; ajs_anonymous_id=35eb850b-8519-4d9a-b68a-ab24ecbad7ac; __cf_bm=CpLDeYGwK257b2z0g2YkoyzrgXUqSqE6CZ1A8SFbJw8-1794831459.9466183-1.0.1.1-qfE8e4YTg1tX32_iP7VsvO8_ga1HVSEwD59ScSruPaDm1BKeWpdUgdVjjPGrs6YgYNaVBqkWt8xWbxUyXI2TEZTa4LmYAkRrIUxmKCFeuzNys0F7j95d_oKoocUzN.pAdjx12NPxRYwmmhIl.x4CLQ; NEXT_LOCALE=en; sso_client_name=CR%20Android; client_id=vtdizwxdmekmsmbguice"
};

const SSO_LOGIN_BODY = JSON.stringify([
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

const EEC_IMPORT_HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "Crunchyroll/3.129.1 Android/10 analytics-android/4.11.3",
    "Host": "eec.crunchyroll.com",
    "Connection": "Keep-Alive"
};

const EEC_IMPORT_BODY = {
    "batch": [
        {
            "channel": "mobile",
            "type": "track",
            "messageId": "053fecd3-a778-42c9-b9b2-a16e522ea06f",
            "timestamp": "2026-11-16T12:41:22.176Z",
            "context": {
                "app": {
                    "build": "1233",
                    "name": "Crunchyroll",
                    "namespace": "com.crunchyroll.crunchyroid",
                    "version": "3.129.1"
                },
                "traits": {
                    "anonymousId": "a642b464-4a53-49ef-9471-65fd3d9212ad",
                    "pushNotificationAndroid": "enabled",
                    "pushNotificationOptOut": "indWatchlistUpdates, indNewSeries, digWatchlistUpdates, digNewSeries",
                    "isAuthenticated": false
                },
                "os": {
                    "name": "Android",
                    "version": "10"
                },
                "timezone": "Asia/Kolkata",
                "screen": {
                    "density": 2.75,
                    "width": 1080,
                    "height": 2131
                },
                "userAgent": "Dalvik/2.1.0 (Linux; U; Android 10; Redmi Note 7 Pro MIUI/V12.5.1.0.QFHINXM)",
                "locale": "en-IN",
                "consent": {
                    "categoryPreferences": {
                        "C0001": true,
                        "C0002": false,
                        "C0003": true,
                        "C0004": true,
                        "C0005": false
                    }
                },
                "network": {
                    "wifi": false,
                    "carrier": "Vi India",
                    "bluetooth": false,
                    "cellular": true
                },
                "library": {
                    "name": "analytics-android",
                    "version": "4.11.3"
                },
                "instanceId": "f17b8395-9a35-4896-a417-85d7b15a9f60",
                "device": {
                    "id": "f2640e81dc29978dbbb9f502bd5b753843101c70c41b50561e01f5bfd4e8716d",
                    "manufacturer": "Xiaomi",
                    "model": "Redmi Note 7 Pro",
                    "name": "violet",
                    "type": "android",
                    "token": "ehDLbU7nSTep-SGhqO2z0I:APA91bHe_s-XCsUoCaQpgq4opu5Ir1TfbbjuO6cVd021FT4tQqXPComyMDHeQuGKbtLPyu1YSiKzeTBkoHnys9mYNIIahZlEmJLIoKT7yQMy2YPXyh8enN8",
                    "advertisingId": "7f0f0f47-c33a-40c4-ab88-908834e892fd",
                    "adTrackingEnabled": true
                }
            },
            "integrations": {
                "Singular": false
            },
            "anonymousId": "a642b464-4a53-49ef-9471-65fd3d9212ad",
            "event": "Application Backgrounded",
            "properties": {}
        }
    ],
    "sentAt": "2026-11-16T12:41:48.828Z",
    "writeKey": "wSgiSNwwTtjusY4M1GugEJ3I3kBxgBvU"
};

let AUTH_TOKEN_REFRESH_BODY = "refresh_token=925d1bee-b016-4079-9ef7-95fb79b1077e&grant_type=refresh_token&scope=offline_access&device_id=ac4bfd8c-28dd-4fdd-b104-00c425765ad6&device_name=Redmi+Note+7+Pro&device_type=Xiaomi+Redmi+Note+7+Pro";

async function autoRefreshCrunchyrollToken() {
    try {
        const response = await proxyClient({
            method: 'POST',
            url: 'https://www.crunchyroll.com/auth/v1/token',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Crunchyroll/3.129.1 Android/10 okhttp/4.12.0',
                'Authorization': 'Basic Y3JfYW5kcm9pZDo='
            },
            data: AUTH_TOKEN_REFRESH_BODY
        });

        if (response.status === 200 && response.data && response.data.access_token) {
            CURRENT_AUTH_DATA = response.data;
            if (response.data.refresh_token) {
                AUTH_TOKEN_REFRESH_BODY = `refresh_token=${response.data.refresh_token}&grant_type=refresh_token&scope=offline_access&device_id=ac4bfd8c-28dd-4fdd-b104-00c425765ad6&device_name=Redmi+Note+7+Pro&device_type=Xiaomi+Redmi+Note+7+Pro`;
            }
            console.log('[Auto-Refresh] Token refreshed successfully.');
        }
    } catch (err) {
        console.error('[Auto-Refresh] Error:', err.message);
    }
}

autoRefreshCrunchyrollToken();
setInterval(autoRefreshCrunchyrollToken, 270000);

// Helper: Check if path belongs to SSO WebView / Next.js Login Flow
function isSsoRoute(path) {
    return (
        path.startsWith('/login') ||
        path.startsWith('/en/login') ||
        path.startsWith('/authorize') ||
        path.startsWith('/android/oauth-callback') ||
        path.startsWith('/_next/') ||
        path.startsWith('/assets/') ||
        path.startsWith('/fonts/') ||
        path.includes('mode=android')
    );
}

app.all('*', async (req, res) => {
    try {
        const path = req.originalUrl;
        const myServerHost = `${req.protocol}://${req.get('host')}`;
        console.log(`[INCOMING] ${req.method} ${path}`);

        let targetUrl = '';
        let requestHeaders = { ...req.headers };
        let requestBody = req.body;

        delete requestHeaders['host'];
        delete requestHeaders['content-length'];
        delete requestHeaders['accept-encoding']; // Let axios handle decompression cleanly

        // ROUTE 1: SSO Server (sso.crunchyroll.com)
        if (isSsoRoute(path)) {
            targetUrl = `https://sso.crunchyroll.com${path}`;
            requestHeaders['host'] = 'sso.crunchyroll.com';

            if ((path.startsWith('/login') || path.startsWith('/en/login')) && req.method === 'POST') {
                console.log('[Router -> SSO] Replacing POST /login headers & body');
                requestHeaders = { ...SSO_LOGIN_HEADERS };
                delete requestHeaders['accept-encoding'];
                requestBody = SSO_LOGIN_BODY;
            }
        }
        // ROUTE 2: Analytics/EEC Server (eec.crunchyroll.com)
        else if (path.startsWith('/v1/import') || path.startsWith('/v1/')) {
            targetUrl = `https://eec.crunchyroll.com${path}`;
            requestHeaders['host'] = 'eec.crunchyroll.com';

            if (path.includes('/v1/import')) {
                console.log('[Router -> EEC] Replacing /v1/import headers & body');
                requestHeaders = { ...EEC_IMPORT_HEADERS };
                requestBody = EEC_IMPORT_BODY;
            }
        }
        // ROUTE 3: Main Crunchyroll Server (www.crunchyroll.com)
        else {
            targetUrl = `https://www.crunchyroll.com${path}`;
            requestHeaders['host'] = 'www.crunchyroll.com';

            if (path.includes('/auth/v1/token')) {
                console.log('[Router -> WWW] Injecting stored refresh token payload');
                requestHeaders['content-type'] = 'application/x-www-form-urlencoded';
                requestBody = AUTH_TOKEN_REFRESH_BODY;
            } else if (CURRENT_AUTH_DATA.access_token) {
                requestHeaders['authorization'] = `Bearer ${CURRENT_AUTH_DATA.access_token}`;
            }
        }

        const axiosConfig = {
            method: req.method,
            url: targetUrl,
            headers: requestHeaders,
            responseType: 'arraybuffer' // Preserves binary assets (fonts, png, woff2) cleanly
        };

        if (req.method !== 'GET' && req.method !== 'HEAD' && requestBody) {
            if (typeof requestBody === 'string' || Buffer.isBuffer(requestBody)) {
                axiosConfig.data = requestBody;
            } else if (Object.keys(requestBody).length > 0) {
                axiosConfig.data = requestBody;
            }
        }

        const response = await proxyClient(axiosConfig);
        const contentType = response.headers['content-type'] || '';

        // Handle /auth/v1/token response & fallback
        if (path.includes('/auth/v1/token')) {
            if (response.status !== 200) {
                console.log('[Router -> WWW] Upstream token status:', response.status, '- Serving cached token.');
                return res.status(200).json(CURRENT_AUTH_DATA);
            }
            try {
                const parsed = JSON.parse(Buffer.from(response.data).toString('utf8'));
                if (parsed && parsed.access_token) {
                    CURRENT_AUTH_DATA = parsed;
                }
            } catch (e) {}
        }

        // Forward headers, fixing cookies & redirects so WebView stays on your proxy server
        res.status(response.status);
        for (const [key, value] of Object.entries(response.headers)) {
            const lowerKey = key.toLowerCase();
            if (lowerKey === 'transfer-encoding' || lowerKey === 'content-encoding' || lowerKey === 'content-length') {
                continue;
            }
            if (lowerKey === 'set-cookie' && Array.isArray(value)) {
                const fixedCookies = value.map(c =>
                    c.replace(/Domain=[^;]+;?/gi, '').replace(/Partitioned;?/gi, '')
                );
                res.setHeader('Set-Cookie', fixedCookies);
            } else if (lowerKey === 'location' && typeof value === 'string') {
                const rewrittenLocation = value
                    .replace('https://sso.crunchyroll.com', myServerHost)
                    .replace('https://www.crunchyroll.com', myServerHost);
                res.setHeader('Location', rewrittenLocation);
            } else {
                res.setHeader(key, value);
            }
        }

        // Rewrite hardcoded SSO/WWW URLs inside HTML, JS, and Next.js RSC streams
        if (
            contentType.includes('text/html') ||
            contentType.includes('text/x-component') ||
            contentType.includes('application/javascript') ||
            contentType.includes('application/json')
        ) {
            let textBody = Buffer.from(response.data).toString('utf8');
            textBody = textBody
                .replace(/https:\/\/sso\.crunchyroll\.com/g, myServerHost)
                .replace(/https:\/\/www\.crunchyroll\.com/g, myServerHost)
                .replace(/https:\/\/eec\.crunchyroll\.com/g, myServerHost);
            return res.send(textBody);
        }

        res.send(Buffer.from(response.data));
    } catch (error) {
        console.error('[Proxy Error]:', error.message);
        res.status(500).json({
            error: true,
            message: 'Proxy routing failure',
            details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Multi-Server Crunchyroll Proxy active on port ${PORT}`);
});