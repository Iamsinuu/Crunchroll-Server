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
    maxRedirects: 0,
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

        if (response.status === 200 && response.data) {
            const parsed = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
            if (parsed && parsed.access_token) {
                CURRENT_AUTH_DATA = parsed;
                if (parsed.refresh_token) {
                    AUTH_TOKEN_REFRESH_BODY = `refresh_token=${parsed.refresh_token}&grant_type=refresh_token&scope=offline_access&device_id=ac4bfd8c-28dd-4fdd-b104-00c425765ad6&device_name=Redmi+Note+7+Pro&device_type=Xiaomi+Redmi+Note+7+Pro`;
                }
                console.log('[Auto-Refresh] Token refreshed successfully.');
            }
        }
    } catch (err) {
        console.error('[Auto-Refresh] Error:', err.message);
    }
}

autoRefreshCrunchyrollToken();
setInterval(autoRefreshCrunchyrollToken, 270000);

app.all('*', async (req, res) => {
    try {
        const path = req.originalUrl;
        const myServerHost = `${req.protocol}://${req.get('host')}`;
        console.log(`[INCOMING] ${req.method} ${path}`);

        // ============================================================
        // BYPASS CLOUDFLARE SSO: Instant OAuth Callback Auto-Login
        // ============================================================
        if (
            path.startsWith('/authorize') ||
            path.startsWith('/login') ||
            path.startsWith('/en/login') ||
            path.includes('oauth-callback')
        ) {
            const state = req.query.state || '';
            const redirectUri = req.query.redirect_uri || `${myServerHost}/android/oauth-callback`;
            const fakeAuthCode = 'cr_bypass_code_' + Date.now();
            const callbackUrl = `${redirectUri}?code=${fakeAuthCode}&state=${encodeURIComponent(state)}`;

            console.log('[SSO Bypass] Triggering instant OAuth callback ->', callbackUrl);

            // Return self-redirecting HTML page so Android WebView catches the OAuth callback immediately without Cloudflare
            return res.status(200).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Authenticating...</title>
                </head>
                <body style="background:#000;color:#fff;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;">
                    <p>Logging in...</p>
                    <script>
                        window.location.replace("${callbackUrl}");
                    </script>
                </body>
                </html>
            `);
        }

        // ============================================================
        // TOKEN ENDPOINT: Always return valid live Premium Token
        // ============================================================
        if (path.includes('/auth/v1/token') || path.includes('/oauth/v1/token')) {
            console.log('[Auth Token] Serving live Premium Token payload');
            return res.status(200).json(CURRENT_AUTH_DATA);
        }

        // ============================================================
        // ANALYTICS / EEC SERVER
        // ============================================================
        if (path.startsWith('/v1/import') || path.startsWith('/v1/')) {
            const targetUrl = `https://eec.crunchyroll.com${path}`;
            const response = await proxyClient({
                method: req.method,
                url: targetUrl,
                headers: EEC_IMPORT_HEADERS,
                data: path.includes('/v1/import') ? EEC_IMPORT_BODY : req.body
            });
            return res.status(response.status).send(response.data);
        }

        // ============================================================
        // MAIN CRUNCHYROLL API SERVER (www.crunchyroll.com)
        // ============================================================
        const targetUrl = `https://www.crunchyroll.com${path}`;
        const requestHeaders = { ...req.headers };
        delete requestHeaders['host'];
        delete requestHeaders['content-length'];
        delete requestHeaders['accept-encoding'];
        requestHeaders['host'] = 'www.crunchyroll.com';

        // Spoof native Android okhttp headers to bypass Cloudflare WAF on API calls
        requestHeaders['user-agent'] = 'Crunchyroll/3.129.1 Android/10 okhttp/4.12.0';
        if (CURRENT_AUTH_DATA.access_token) {
            requestHeaders['authorization'] = `Bearer ${CURRENT_AUTH_DATA.access_token}`;
        }

        const axiosConfig = {
            method: req.method,
            url: targetUrl,
            headers: requestHeaders,
            responseType: 'arraybuffer'
        };

        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
            if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) {
                axiosConfig.data = req.body;
            } else if (Object.keys(req.body).length > 0) {
                axiosConfig.data = req.body;
            }
        }

        const response = await proxyClient(axiosConfig);

        res.status(response.status);
        for (const [key, value] of Object.entries(response.headers)) {
            const lowerKey = key.toLowerCase();
            if (lowerKey !== 'transfer-encoding' && lowerKey !== 'content-encoding' && lowerKey !== 'content-length') {
                res.setHeader(key, value);
            }
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