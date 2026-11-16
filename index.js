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

// Persistent Connection Agents for High-Speed Routing
const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 100 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 100 });

const proxyClient = axios.create({
    httpAgent,
    httpsAgent,
    timeout: 15000,
    validateStatus: () => true
});

// ==========================================
// 1. STORED PAYLOADS & CREDENTIALS
// ==========================================

// Active Premium Token State (Auto-updated via Refresh System)
let CURRENT_AUTH_DATA = {
    "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImtrOUFVTlowY3hDYlRjRG9MT01FeFEiLCJ0eXAiOiJKV1QifQ.eyJhbm9ueW1vdXNfaWQiOiJlZDE3OTcwZC03MDRmLTRiYTMtOTI3ZS1hZmU5NDk3ZGUyMGQiLCJiZW5lZml0cyI6WyJjYXRhbG9nIiwiY29uY3VycmVudF9zdHJlYW1zLjEiLCJjcl9wcmVtaXVtIiwibm9fYWRzIiwib2ZmbGluZV92aWV3aW5nIiwic2ltdWxjYXN0Il0sImNsaWVudF9pZCI6ImNyX2FuZHJvaWQiLCJjbGllbnRfdGFnIjoiMy4xMjkuMSIsImNvdW50cnkiOiJVUyIsImRldmljZV9pZCI6IjI3ZjQzOGUyLWY5MTMtNDNiMS04MDNjLTYzZTZmMDdmMmNhNiIsImV0cF91c2VyX2lkIjoiOGE5N2Q0YTgtNjJlZC01OTFiLTljYzUtMTcyMGVmNzRiNTQ5IiwiZXhwIjoxNzk0ODQ0OTM4LCJleHRlbmRlZF9tYXR1cml0eSI6eyJBVSI6IlIgMTgrIiwiQlIiOiIxOCIsIklOIjoiQSIsIktSIjoiMTkiLCJVTiI6IjE4In0sImp0aSI6Ijg2NmI3YzFiLTAxYmMtNDAyZS1hZWViLTAwNTE5OGQyNmY3NSIsIm1hdHVyaXR5IjoiTTMiLCJvYXV0aF9zY29wZXMiOiJhY2NvdW50IGNvbnRlbnQgbXAgb2ZmbGluZV9hY2Nlc3MgcGlucyBwcm9maWxlLXRyYW5zZmVyIHRlZW4tcHJvZmlsZSIsInByb2ZpbGVfaWQiOiI4YTk3ZDRhOC02MmVkLTU5MWItOWNjNS0xNzIwZWY3NGI1NDkiLCJwcm9maWxlX3R5cGUiOiJhZ2dyZXRzdWtvIiwicnRfaWQiOiJkYnRpZm5obGZvNmJpajE5bjJjMCIsInNjb3BlcyI6eyJjciI6eyJhY2NfaWQiOiI4YTk3ZDRhOC02MmVkLTU5MWItOWNjNS0xNzIwZWY3NGI1NDkiLCJleHRfaWQiOiIxMzA2NTY3MjEyIn19LCJzdGF0dXMiOiJQRU5ESU5HIiwidG50IjoiY3IiLCJ2YWxpZGF0aW9uX2hpbnRzIjpbIlZhbGlkYXRlLUVtYWlsLUFkZHJlc3MiLCJTZXQtVXNlcm5hbWUiXX0.r01WvDIZHOtcHN6ttBjSYAnoMQl7k0OD5PVA_Cm8IS9o5ExCjzCqVdlwuqqCXGYTr_2Zrna0i209LTdAdIWAfbCF8kV0-XE6C6kKFBmMIwiZYaaUjP9ad6zvMWUXYRVgqz6vbYK0_VRf2FxZecL7iUeNLPQt4F7QLfB33woI_BQw4jmtwPZgLKNHvdRD4YSrzJGOKMxRI1pU6ykb7R1rP1VoVhVsmeYlSq2POo12Ik1YbMjQY9gOHJiHNVcYTdtcGuSRHjyH7tcaN1dhQXD-i6jxieY43tFCVYvVJWcAlxQLb9w-7FOJtkDgya4QmS__iClOmoKMzc9HgEbkJMTwfQ",
    "refresh_token": "925d1bee-b016-4079-9ef7-95fb79b1077e",
    "expires_in": 300,
    "token_type": "Bearer",
    "scope": "account content mp:limited offline_access pins reviews talkbox teen-profile",
    "country": "IN",
    "account_id": "bb38a5c7-b23e-5867-99d8-8bb5fe96d7b7",
    "profile_id": "bb38a5c7-b23e-5867-99d8-8bb5fe96d7b7"
};

// First Server: sso.crunchyroll.com (/login)
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
    "Accept-Encoding": "gzip, deflate, br, zstd",
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

// Second Server: eec.crunchyroll.com (/v1/import)
const EEC_IMPORT_HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "Crunchyroll/3.129.1 Android/10 analytics-android/4.11.3",
    "Host": "eec.crunchyroll.com",
    "Connection": "Keep-Alive",
    "Accept-Encoding": "gzip"
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

// Third Server: www.crunchyroll.com (/auth/v1/token)
let AUTH_TOKEN_REFRESH_BODY = "refresh_token=925d1bee-b016-4079-9ef7-95fb79b1077e&grant_type=refresh_token&scope=offline_access&device_id=ac4bfd8c-28dd-4fdd-b104-00c425765ad6&device_name=Redmi+Note+7+Pro&device_type=Xiaomi+Redmi+Note+7+Pro";

// ==========================================
// 2. AUTO REFRESH TOKEN GENERATOR SYSTEM
// ==========================================

async function autoRefreshCrunchyrollToken() {
    try {
        console.log('[Auto-Refresh] Attempting to refresh Crunchyroll token...');
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
            console.log('[Auto-Refresh] Token successfully refreshed & updated in memory.');
        } else {
            console.log('[Auto-Refresh] Refresh returned status:', response.status, '- Retaining fallback token.');
        }
    } catch (err) {
        console.error('[Auto-Refresh] Error refreshing token:', err.message);
    }
}

// Run immediately on boot, then every 4.5 minutes (270,000 ms) before 300s expiry
autoRefreshCrunchyrollToken();
setInterval(autoRefreshCrunchyrollToken, 270000);

// ==========================================
// 3. MULTI-SERVER INTERCEPTION & ROUTING
// ==========================================

app.all('*', async (req, res) => {
    try {
        const path = req.originalUrl;
        let targetUrl = '';
        let requestHeaders = { ...req.headers };
        let requestBody = req.body;

        // Clean hop-by-hop headers
        delete requestHeaders['host'];
        delete requestHeaders['content-length'];

        // ROUTE 1: First Server (sso.crunchyroll.com) -> /login
        if (path.startsWith('/login') || path.includes('/authorize') || path.includes('/oauth-callback')) {
            targetUrl = `https://sso.crunchyroll.com${path}`;
            if (path.includes('/login') && req.method === 'POST') {
                console.log('[Router -> SSO] Replacing /login headers & body');
                requestHeaders = { ...SSO_LOGIN_HEADERS };
                requestBody = SSO_LOGIN_BODY;
            }
        }
        // ROUTE 2: Second Server (eec.crunchyroll.com) -> /v1/import
        else if (path.startsWith('/v1/import') || path.startsWith('/v1/')) {
            targetUrl = `https://eec.crunchyroll.com${path}`;
            if (path.includes('/v1/import')) {
                console.log('[Router -> EEC] Replacing /v1/import headers & body');
                requestHeaders = { ...EEC_IMPORT_HEADERS };
                requestBody = EEC_IMPORT_BODY;
            }
        }
        // ROUTE 3: Third Server (www.crunchyroll.com) -> /auth/v1/token & General Traffic
        else {
            targetUrl = `https://www.crunchyroll.com${path}`;

            if (path.includes('/auth/v1/token')) {
                console.log('[Router -> WWW] Replacing /auth/v1/token body with stored refresh payload');
                requestHeaders['content-type'] = 'application/x-www-form-urlencoded';
                requestBody = AUTH_TOKEN_REFRESH_BODY;
            } else if (CURRENT_AUTH_DATA.access_token) {
                // Inject live valid Bearer token into outgoing API requests to unlock premium/account access
                requestHeaders['authorization'] = `Bearer ${CURRENT_AUTH_DATA.access_token}`;
            }
        }

        // Prepare Axios request configuration
        const axiosConfig = {
            method: req.method,
            url: targetUrl,
            headers: requestHeaders
        };

        if (req.method !== 'GET' && req.method !== 'HEAD' && requestBody) {
            if (typeof requestBody === 'string' || Buffer.isBuffer(requestBody)) {
                axiosConfig.data = requestBody;
            } else if (Object.keys(requestBody).length > 0) {
                axiosConfig.data = requestBody;
            }
        }

        // Execute request to the selected Original Server
        const response = await proxyClient(axiosConfig);

        // If /auth/v1/token failed upstream, fallback to active memory token so client never fails login
        if (path.includes('/auth/v1/token') && response.status !== 200) {
            console.log('[Router -> WWW] Upstream token status:', response.status, '- Serving cached active token.');
            return res.status(200).json(CURRENT_AUTH_DATA);
        }

        // Update memory token if upstream /auth/v1/token succeeded
        if (path.includes('/auth/v1/token') && response.status === 200 && response.data && response.data.access_token) {
            CURRENT_AUTH_DATA = response.data;
        }

        // Forward response headers & data back to Modded Client
        res.status(response.status);
        for (const [key, value] of Object.entries(response.headers)) {
            if (key.toLowerCase() !== 'transfer-encoding' && key.toLowerCase() !== 'content-encoding') {
                res.setHeader(key, value);
            }
        }

        res.send(response.data);
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