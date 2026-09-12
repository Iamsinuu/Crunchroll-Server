const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const TARGET_API_URL = "https://www.crunchyroll.com";

// Provided Premium Headers & Authorization Tokens
const premiumHeaders = {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InhRTUNIZ0JpVlg3NVliYkZBNmNoZ3ciLCJ0eXAiOiJKV1QifQ.eyJhbm9ueW1vdXNfaWQiOiI2OTRjYTIwMi1iZjY0LTRiMjgtODcwYi05MmE1MWU2OTMzYjciLCJiZW5lZml0cyI6WyJjYXRhbG9nIiwiY29uY3VycmVudF9zdHJlYW1zLjQiLCJjcl9iZW50byIsImNyX2Zhbl9wYWNrIiwiY3JfcHJlbWl1bSIsIm5vX2FkcyIsIm9mZmxpbmVfdmlld2luZyIsInNpbXVsY2FzdCJdLCJjbGllbnRfaWQiOiJjcl9hbmRyb2lkIiwiY2xpZW50X3RhZyI6IjMuMTIwLjAiLCJjb3VudHJ5IjoiSU4iLCJkZXZpY2VfaWQiOiI2ZTFhZGZmNi0xYWJlLTQzMGYtYWEyNS01Y2Y2Nzg4ZjU0NDEiLCJldHBfdXNlcl9pZCI6ImJiMzhhNWM3LWIyM2UtNTg2Ny05OWQ4LThiYjVmZTk2ZDdiNyIsImV4cCI6MTc4OTA3MTcxMCwiZXh0ZW5kZWRfbWF0dXJpdHkiOnsiQVUiOiJSIDE4KyIsIkJSIjoiMTgiLCJJTiI6IkEiLCJLUiI6IjE5IiwiVU4iOiIxOCJ9LCJqdGkiOiI0MmI4MDdkYy1hMjNmLTQzYmYtOWMyZi04MmI0MWQ5MTMyMjMiLCJtYXR1cml0eSI6Ik0zIiwib2F1dGhfc2NvcGVzIjoiYWNjb3VudCBjb250ZW50IG1wIG9mZmxpbmVfYWNjZXNzIHBpbnMgcmV2aWV3cyB0YWxrYm94IHRlZW4tcHJvZmlsZSIsInByb2ZpbGVfaWQiOiJiYjM4YTVjNy1iMjNlLTU4NjctOTlkOC04YmI1ZmU5NmQ3YjciLCJwcm9maWxlX3R5cGUiOiJhZ2dyZXRzdWtvIiwicnRfaWQiOiJkYWhndjFqZDBkcGlsdWY2NmswMCIsInNjb3BlcyI6eyJjciI6eyJhY2NfaWQiOiJiYjM4YTVjNy1iMjNlLTU4NjctOTlkOC04YmI1ZmU5NmQ3YjciLCJleHRfaWQiOiIxMjk0NzkxNDQ3In19LCJzdGF0dXMiOiJBQ1RJVkUiLCJ0bnQiOiJjciJ9.cEzF2utgFE74x6CVq6DOCejfxScvoyTktE01WUbvjiCGPoJ6vPewotz9dtkoGjJOwpKne8fd3sF444Nq9pbF4iSkPCsWuMQf9t5ZCjIQ75j3oy0jnzKn4CXSPJsx5FPnDK7bhZL5pZ5OtRdYtWFpFY3DXeU2CDOm6373OMTwlQZv2M_tyBpxLR78RcOWd3zbT1sEuXzyUUgUKjs5Bz-WO5ypIEqLZ-KKrTvZOkPSWfbnyla2nPmb7j0tXwydx4tGh9ha4THMefzhQU7MTrgyOUxPGwQy41eeNiQjSTPz6pO3uXc_lntZG-9yotXB12EwHsBTEhahXdcLbsjGokBabw",
    "x-datadog-trace-id": "6551637616722367181",
    "x-datadog-parent-id": "1018876939784585528",
    "x-datadog-origin": "rum",
    "x-datadog-tags": "_dd.p.tid=6aa3104a00000000,_dd.p.rsid=2c1cd43f-d5af-4a52-b8ed-41ecee3738f2",
    "x-datadog-sampling-priority": "0",
    "traceparent": "00-6aa3104a000000005aec17b349d2d2cd-1018876939784585528-00",
    "tracestate": "dd=p:1018876939784585528;s:0;o:rum",
    "ETP-Anonymous-ID": "694ca202-bf64-4b28-870b-92a51e6933b7",
    "Host": "www.crunchyroll.com",
    "Connection": "Keep-Alive",
    "Accept-Encoding": "gzip",
    "Cookie": "cr_exp=bb38a5c7-b23e-5867-99d8-8bb5fe96d7b7bb38a5c7-b23e-5867-99d8-8bb5fe96d7b7; __cf_bm=v64OSs5F2EBkvpv8TzGNf6VBWpJPMkBv60qTwS1J2Ms-1789071173.2632585-1.0.1.1-Re1y7KDLRNaBKMcRx0oK1WlzQct_yqgwASErhkSi90ArcDWpxzkI.SbQw4NflCydq4IOaSq4.AF89w1xE6YMIKAVQ_zDSmzNETauxGo.jYLDmGFV94AfNWNQti.AKCAAIL1NV4qEfgp9DqvD17eTBQ; __cf_bm=2HK38bejqZPpmWNCYo7qc.6SiEJ668ogGB.2N9iXF9Q-1789071435.240574-1.0.1.1-5982litEehI14ocDiL7VR2wVgsDGQ_RAXJ6HhG7L2e5Mty6Oa0i1ZlbpFupPd67TiqM2G6RNizxkwocMgvJ_Tt1XQyE6DLD07XDKeA.GZoOgHJCkkpsl5_RzEj_5p7JU4Rr1AjigTcJcpOV02zkU0Q",
    "If-Modified-Since": "Thu, 10 Sep 2026 20:17:11 GMT",
    "User-Agent": "Crunchyroll/3.120.0 Android/10 okhttp/5.3.2"
};

// Mocked Login Success Data overriding original responses
const premiumLoginResponse = {
    "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6InhRTUNIZ0JpVlg3NVliYkZBNmNoZ3ciLCJ0eXAiOiJKV1QifQ.eyJhbm9ueW1vdXNfaWQiOiJjMWZhN2NmZi04Y2NiLTQxMGYtOTVmNC04NTFjNzUyOGUxNjYiLCJiZW5lZml0cyI6WyJjYXRhbG9nIiwiY29uY3VycmVudF9zdHJlYW1zLjQiLCJjcl9iZW50byIsImNyX2Zhbl9wYWNrIiwiY3JfcHJlbWl1bSIsIm5vX2FkcyIsIm9mZmxpbmVfdmlld2luZyIsInNpbXVsY2FzdCJdLCJjbGllbnRfaWQiOiJjcl9hbmRyb2lkIiwiY2xpZW50X3RhZyI6IjMuMTIwLjAiLCJjb3VudHJ5IjoiSU4iLCJkZXZpY2VfaWQiOiJlMzg5ZTg4ZS0xNzY1LTQ4MGQtYmZjZi0xMmJjODc5MTVlZjciLCJldHBfdXNlcl9pZCI6ImJiMzhhNWM3LWIyM2UtNTg2Ny05OWQ4LThiYjVmZTk2ZDdiNyIsImV4cCI6MTc4OTA3Mzg5MSwiZXh0ZW5kZWRfbWF0dXJpdHkiOnsiQVUiOiJSIDE4KyIsIkJSIjoiMTgiLCJJTiI6IkEiLCJLUiI6IjE5IiwiVU4iOiIxOCJ9LCJqdGkiOiJjMDJjOGYxYy0wODNkLTQ3ZDItYTVlZC0xODkzM2I0ZmIwMTMiLCJtYXR1cml0eSI6Ik0zIiwib2F1dGhfc2NvcGVzIjoiYWNjb3VudCBjb250ZW50IG1wIG9mZmxpbmVfYWNjZXNzIHBpbnMgcmV2aWV3cyB0YWxrYm94IHRlZW4tcHJvZmlsZSIsInByb2ZpbGVfaWQiOiJiYjM4YTVjNy1iMjNlLTU4NjctOTlkOC04YmI1ZmU5NmQ3YjciLCJwcm9maWxlX3R5cGUiOiJhZ2dyZXRzdWtvIiwicnRfaWQiOiJkYWhoOWNoZGJiMGxpaXIxYXMyMCIsInNjb3BlcyI6eyJjciI6eyJhY2NfaWQiOiJiYjM4YTVjNy1iMjNlLTU4NjctOTlkOC04YmI1ZmU5NmQ3YjciLCJleHRfaWQiOiIxMjk0NzkxNDQ3In19LCJzdGF0dXMiOiJBQ1RJVkUiLCJ0bnQiOiJjciJ9.CYY7FedcobCALVHBeV2nDRUuFXtkChb7gBgGBw8WrA_0fyJ4XWIp4PUrsF4KCvXb8e-VHuClXA2AWVEeLfVMtqjb6AtFJuBuwzGclXUJS0iLCP45tZjU8ebMxfjzQtVRWrkQQoLY8m9_qYVYDBIyL0HwtfnlGVwCfwHrebU6XOjWOFuu4qk0zzmj2ZlWl5GD98FL07uaNIwL6aKKuICnLobCxy8XQ6z6P8tkjqK1ibrVrxjoSHW6DZNbZc46bZb5lQVpr3fDWF5ANE2lWWBtaJ-pRwnd1tHd3rLHyT5Fn2WccrBdkokqoqZLfhJhTY4wGTJvf1SHD5F5m2N8GGxbPQ",
    "refresh_token": "f3af7f61-cf83-49fa-b4f5-0a5c4b7494a8",
    "expires_in": 300,
    "token_type": "Bearer",
    "scope": "account content mp offline_access pins reviews talkbox teen-profile",
    "country": "IN",
    "account_id": "bb38a5c7-b23e-5867-99d8-8bb5fe96d7b7",
    "profile_id": "bb38a5c7-b23e-5867-99d8-8bb5fe96d7b7"
};

// Catch-all Proxy Route
app.all('*', async (req, res) => {
    const targetUrl = `${TARGET_API_URL}${req.originalUrl}`;
    
    // Base headers from client (Host is deleted so target server doesn't reject it)
    let requestHeaders = { ...req.headers };
    delete requestHeaders.host;

    // PATH IDENTIFICATION (Adjust '/auth/login' or '/auth/otp' based on actual app endpoints)
    const isOtpRequest = req.path.includes('/otp/request');
    const isOtpVerifyOrPasswordLogin = req.path.includes('/otp/verify') || (req.path.includes('/login') && req.body.otp);
    const isGmailLogin = req.path.includes('/login') && req.body.email && req.body.password;

    /* --- IMPLEMENTING LOGIC FROM Readme.txt --- */

    // FLOW 2: Intercept OTP/Password verify request and inject Premium Token[cite: 1]
    if (isOtpVerifyOrPasswordLogin) {
        requestHeaders = { 
            ...requestHeaders, 
            ...premiumHeaders 
        };
    }
    // FLOW 1 & 3: Requests for OTP generation and Gmail Logins are forwarded without modification[cite: 1]

    try {
        const response = await axios({
            method: req.method,
            url: targetUrl,
            headers: requestHeaders,
            data: req.body,
            validateStatus: () => true // Allow all status codes to return directly to the client
        });

        // FLOW 2 RETURN: If this is the OTP verification success, return the forced Premium JSON response[cite: 1]
        if (isOtpVerifyOrPasswordLogin && response.status === 200) {
            return res.status(200).json(premiumLoginResponse);
        }

        // FLOW 1 & 3 RETURN: Forward the exact original server response for OTP requests & Gmail login[cite: 1]
        res.status(response.status).set(response.headers).send(response.data);

    } catch (error) {
        console.error("Proxy Error:", error.message);
        res.status(500).json({ error: "Internal Server Proxy Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Mod Proxy Server is running on port ${PORT}`);
});