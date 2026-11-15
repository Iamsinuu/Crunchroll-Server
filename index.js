const express = require('express');
const axios = require('axios');
const compression = require('compression');
const http = require('http');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;
const TARGET_HOST = 'https://www.crunchyroll.com';

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 100 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 100 });

const crunchyrollClient = axios.create({
    baseURL: TARGET_HOST,
    httpAgent,
    httpsAgent,
    timeout: 10000,
    validateStatus: () => true
});

const CRUNCHYROLL_AUTH_RESPONSE = {
  "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImtrOUFVTlowY3hDYlRjRG9MT01FeFEiLCJ0eXAiOiJKV1QifQ.eyJhbm9ueW1vdXNfaWQiOiI4N2RkYTQ5ZC1lNmM1LTRiMDItOTAzMC0xMTBiYzYyYzg4OWEiLCJiZW5lZml0cyI6W10sImNsaWVudF9pZCI6ImNyX2FuZHJvaWQiLCJjbGllbnRfdGFnIjoiMy4xMjkuMSIsImNvdW50cnkiOiJJTiIsImRldmljZV9pZCI6IjgzMzQ5ZGZiLTc2OGEtNDJhYy04YTJkLWFlMzU3NGIzMmMzMSIsImV0cF91c2VyX2lkIjoiYmIzOGE1YzctYjIzZS01ODY3LTk5ZDgtOGJiNWZlOTZkN2I3IiwiZXhwIjoxNzk0NzYzMTQ3LCJleHRlbmRlZF9tYXR1cml0eSI6eyJBVSI6IlIgMTgrIiwiQlIiOiIxOCIsIklOIjoiQSIsIktSIjoiMTkiLCJVTiI6IjE4In0sImp0aSI6IjMyZmMxMzAxLWU5MmEtNGNkNy1hNzMyLTQ1ZTg2YTQxOWY3NCIsIm1hdHVyaXR5IjoiTTMiLCJvYXV0aF9zY29wZXMiOiJhY2NvdW50IGNvbnRlbnQgbXA6bGltaXRlZCBvZmZsaW5lX2FjY2VzcyBwaW5zIHJldmlld3MgdGFsa2JveCB0ZWVuLXByb2ZpbGUiLCJwcm9maWxlX2lkIjoiYmIzOGE1YzctYjIzZS01ODY3LTk5ZDgtOGJiNWZlOTZkN2I3IiwicHJvZmlsZV90eXBlIjoiYWdncmV0c3VrbyIsInJ0X2lkIjoiZGJzdWY1bzdjMHVxMGVndnA2a2ciLCJzY29wZXMiOnsiY3IiOnsiYWNjX2lkIjoiYmIzOGE1YzctYjIzZS01ODY3LTk5ZDgtOGJiNWZlOTZkN2I3IiwiZXh0X2lkIjoiMTI5NDc5MTQ0NyJ9fSwic3RhdHVzIjoiQUNUSVZFIiwidG50IjoiY3IifQ.rMEJUhD51ytCax6qbR9Ko8w7n9cKWf2_LXW1fglX2fFeYiwUN9sjKWxGRFpIlnrIUM5DiJlCrw_ix5zNdRWw_Hobb-Q4W_qFVRwaMhqE2h1VwYDRLAYww49ud-Sa6Epj88JOo7clHeGnExWKS2liq9X9C3dnE6sQ7fUxNHJcVE7qnvkNDSZblvOjrGY9OWXajNEgCcvlCDWu9lmkb1z5z9hoOJAzjyymmyViMHlP1LYjaiIGIMpUn1NnlD_lUEMzdv002jMzB-cqbIFMfw-O8cUDH794JvWAMXtOxTkSzZ4e0yitIDPEbjpglk0X31Azpx6Q8eShqFCsjhvFEIktsA",
  "refresh_token": "7b0bc02e-2601-4674-ad0c-547871f1ed13",
  "expires_in": 300,
  "token_type": "Bearer",
  "scope": "account content mp:limited offline_access pins reviews talkbox teen-profile",
  "country": "IN",
  "account_id": "bb38a5c7-b23e-5867-99d8-8bb5fe96d7b7",
  "profile_id": "bb38a5c7-b23e-5867-99d8-8bb5fe96d7b7"
};

app.all('*', async (req, res) => {
    try {
        const path = req.originalUrl;

        if (path.includes('/auth/v1/token') || path.includes('/oauth/v1/token')) {
            return res.status(200).json(CRUNCHYROLL_AUTH_RESPONSE);
        }

        const headers = { ...req.headers };
        delete headers['host'];
        delete headers['content-length'];

        const response = await crunchyrollClient({
            method: req.method,
            url: path,
            headers: headers,
            data: Object.keys(req.body).length > 0 ? req.body : undefined
        });

        res.status(response.status);
        for (const [key, value] of Object.entries(response.headers)) {
            res.setHeader(key, value);
        }
        
        res.send(response.data);
    } catch (error) {
        console.error('Proxy Error:', error.message);
        res.status(500).json({
            error: true,
            message: "Something went wrong on proxy server",
            details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Optimized Crunchyroll Proxy Server running on port ${PORT}`);
}):
