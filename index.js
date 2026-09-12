const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Target Server Details
const TARGET_API_URL = 'https://www.crunchyroll.com';

// The injected Premium Token from the request
const PREMIUM_TOKEN = "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InhRTUNIZ0JpVlg3NVliYkZBNmNoZ3ciLCJ0eXAiOiJKV1QifQ.eyJhbm9ueW1vdXNfaWQiOiI2OTRjYTIwMi1iZjY0LTRiMjgtODcwYi05MmE1MWU2OTMzYjciLCJiZW5lZml0cyI6WyJjYXRhbG9nIiwiY29uY3VycmVudF9zdHJlYW1zLjQiLCJjcl9iZW50byIsImNyX2Zhbl9wYWNrIiwiY3JfcHJlbWl1bSIsIm5vX2FkcyIsIm9mZmxpbmVfdmlld2luZyIsInNpbXVsY2FzdCJdLCJjbGllbnRfaWQiOiJjcl9hbmRyb2lkIiwiY2xpZW50X3RhZyI6IjMuMTIwLjAiLCJjb3VudHJ5IjoiSU4iLCJkZXZpY2VfaWQiOiI2ZTFhZGZmNi0xYWJlLTQzMGYtYWEyNS01Y2Y2Nzg4ZjU0NDEiLCJldHBfdXNlcl9pZCI6ImJiMzhhNWM3LWIyM2UtNTg2Ny05OWQ4LThiYjVmZTk2ZDdiNyIsImV4cCI6MTc4OTA3MTcxMCwiZXh0ZW5kZWRfbWF0dXJpdHkiOnsiQVUiOiJSIDE4KyIsIkJSIjoiMTgiLCJJTiI6IkEiLCJLUiI6IjE5IiwiVU4iOiIxOCJ9LCJqdGkiOiI0MmI4MDdkYy1hMjNmLTQzYmYtOWMyZi04MmI0MWQ5MTMyMjMiLCJtYXR1cml0eSI6Ik0zIiwib2F1dGhfc2NvcGVzIjoiYWNjb3VudCBjb250ZW50IG1wIG9mZmxpbmVfYWNjZXNzIHBpbnMgcmV2aWV3cyB0YWxrYm94IHRlZW4tcHJvZmlsZSIsInByb2ZpbGVfaWQiOiJiYjM4YTVjNy1iMjNlLTU4NjctOTlkOC04YmI1ZmU5NmQ3YjciLCJwcm9maWxlX3R5cGUiOiJhZ2dyZXRzdWtvIiwicnRfaWQiOiJkYWhndjFqZDBkcGlsdWY2NmswMCIsInNjb3BlcyI6eyJjciI6eyJhY2NfaWQiOiJiYjM4YTVjNy1iMjNlLTU4NjctOTlkOC04YmI1ZmU5NmQ3YjciLCJleHRfaWQiOiIxMjk0NzkxNDQ3In19LCJzdGF0dXMiOiJBQ1RJVkUiLCJ0bnQiOiJjciJ9.cEzF2utgFE74x6CVq6DOCejfxScvoyTktE01WUbvjiCGPoJ6vPewotz9dtkoGjJOwpKne8fd3sF444Nq9pbF4iSkPCsWuMQf9t5ZCjIQ75j3oy0jnzKn4CXSPJsx5FPnDK7bhZL5pZ5OtRdYtWFpFY3DXeU2CDOm6373OMTwlQZv2M_tyBpxLR78RcOWd3zbT1sEuXzyUUgUKjs5Bz-WO5ypIEqLZ-KKrTvZOkPSWfbnyla2nPmb7j0tXwydx4tGh9ha4THMefzhQU7MTrgyOUxPGwQy41eeNiQjSTPz6pO3uXc_lntZG-9yotXB12EwHsBTEhahXdcLbsjGokBabw";

// Route 1: Forward OTP Request natively
app.post('/api/request-otp', async (req, res) => {
    try {
        // Forward the request untouched to the original app server
        const response = await axios.post(`${TARGET_API_URL}/auth/otp/request`, req.body, {
            headers: {
                'User-Agent': 'Crunchyroll/3.120.0 Android/10 okhttp/5.3.2',
                'Accept-Encoding': 'gzip'
            }
        });
        // Real server sends OTP directly to user's device
        res.status(response.status).json(response.data);
    } catch (error) {
        const status = error.response ? error.response.status : 500;
        res.status(status).json(error.response ? error.response.data : { error: 'Failed to request OTP' });
    }
});

// Route 2: Intercept Login (OTP/Password) & Inject Token
app.post('/api/login', async (req, res) => {
    try {
        // Extract incoming headers from the modded app client
        const customHeaders = {
            'Authorization': PREMIUM_TOKEN, // Injected Token
            'User-Agent': 'Crunchyroll/3.120.0 Android/10 okhttp/5.3.2',
            'Accept-Encoding': 'gzip',
            'Connection': 'Keep-Alive',
            'ETP-Anonymous-ID': '694ca202-bf64-4b28-870b-92a51e6933b7'
        };

        // Forward intercepted login credentials + premium token to original server
        const response = await axios.post(`${TARGET_API_URL}/auth/login`, req.body, {
            headers: customHeaders
        });

        // Intercept real server response, add additional premium JSON data if needed, and send back
        const finalResponse = {
            ...response.data,
            "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6InhRTUNIZ0JpVlg3NVliYkZBNmNoZ3ciLCJ0eXAiOiJKV1QifQ.eyJhbm9ueW1vdXNfaWQiOiJjMWZhN2NmZi04Y2NiLTQxMGYtOTVmNC04NTFjNzUyOGUxNjYiLCJiZW5lZml0cyI6WyJjYXRhbG9nIiwiY29uY3VycmVudF9zdHJlYW1zLjQiLCJjcl9iZW50byIsImNyX2Zhbl9wYWNrIiwiY3JfcHJlbWl1bSIsIm5vX2FkcyIsIm9mZmxpbmVfdmlld2luZyIsInNpbXVsY2FzdCJdLCJjbGllbnRfaWQiOiJjcl9hbmRyb2lkIiwiY2xpZW50X3RhZyI6IjMuMTIwLjAiLCJjb3VudHJ5IjoiSU4iLCJkZXZpY2VfaWQiOiJlMzg5ZTg4ZS0xNzY1LTQ4MGQtYmZjZi0xMmJjODc5MTVlZjciLCJldHBfdXNlcl9pZCI6ImJiMzhhNWM3LWIyM2UtNTg2Ny05OWQ4LThiYjVmZTk2ZDdiNyIsImV4cCI6MTc4OTA3Mzg5MSwiZXh0ZW5kZWRfbWF0dXJpdHkiOnsiQVUiOiJSIDE4KyIsIkJSIjoiMTgiLCJJTiI6IkEiLCJLUiI6IjE5IiwiVU4iOiIxOCJ9LCJqdGkiOiJjMDJjOGYxYy0wODNkLTQ3ZDItYTVlZC0xODkzM2I0ZmIwMTMiLCJtYXR1cml0eSI6Ik0zIiwib2F1dGhfc2NvcGVzIjoiYWNjb3VudCBjb250ZW50IG1wIG9mZmxpbmVfYWNjZXNzIHBpbnMgcmV2aWV3cyB0YWxrYm94IHRlZW4tcHJvZmlsZSIsInByb2ZpbGVfaWQiOiJiYjM4YTVjNy1iMjNlLTU4NjctOTlkOC04YmI1ZmU5NmQ3YjciLCJwcm9maWxlX3R5cGUiOiJhZ2dyZXRzdWtvIiwicnRfaWQiOiJkYWhoOWNoZGJiMGxpaXIxYXMyMCIsInNjb3BlcyI6eyJjciI6eyJhY2NfaWQiOiJiYjM4YTVjNy1iMjNlLTU4NjctOTlkOC04YmI1ZmU5NmQ3YjciLCJleHRfaWQiOiIxMjk0NzkxNDQ3In19LCJzdGF0dXMiOiJBQ1RJVkUiLCJ0bnQiOiJjciJ9.CYY7FedcobCALVHBeV2nDRUuFXtkChb7gBgGBw8WrA_0fyJ4XWIp4PUrsF4KCvXb8e-VHuClXA2AWVEeLfVMtqjb6AtFJuBuwzGclXUJS0iLCP45tZjU8ebMxfjzQtVRWrkQQoLY8m9_qYVYDBIyL0HwtfnlGVwCfwHrebU6XOjWOFuu4qk0zzmj2ZlWl5GD98FL07uaNIwL6aKKuICnLobCxy8XQ6z6P8tkjqK1ibrVrxjoSHW6DZNbZc46bZb5lQVpr3fDWF5ANE2lWWBtaJ-pRwnd1tHd3rLHyT5Fn2WccrBdkokqoqZLfhJhTY4wGTJvf1SHD5F5m2N8GGxbPQ",
            "refresh_token": "f3af7f61-cf83-49fa-b4f5-0a5c4b7494a8",
            "expires_in": 300,
            "token_type": "Bearer",
            "scope": "account content mp offline_access pins reviews talkbox teen-profile",
            "country": "IN",
            "account_id": "bb38a5c7-b23e-5867-99d8-8bb5fe96d7b7",
            "profile_id": "bb38a5c7-b23e-5867-99d8-8bb5fe96d7b7"
        };

        res.status(response.status).json(finalResponse);
    } catch (error) {
        const status = error.response ? error.response.status : 500;
        res.status(status).json(error.response ? error.response.data : { error: 'Login bypass failed' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Proxy server is running on http://localhost:${PORT}`);
});