const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming request bodies and headers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.text({ type: '*/*', limit: '50mb' }));

// 1. Handling /login Path
app.all('/login', async (req, res) => {
    try {
        console.log('[Intercepted] /login request received from Crunchyroll App');

        // Original Request Body captured from setup data
        const originalRequestBody = [{"email":"xjaatteam@gmail.com","password":"Ikbal@7866","recaptchaToken":"0cAFcWeA7orsBz56zMnQV6LPwS_g7TqWMCA945sIbiCE96cGt1nfDImHn7eHeUboTfLRbm6tw8t4eRU64wX_uU3ktLs0Vs-DgNFuriV99hlH8VZrQ07SQJW1mXT0Iqv9YAWSX0ncO9k78gFJdC_WgPxGpoO04i-CyfsPXbMERM0iPq1zPIVOmN_YCN6-snT6lgDT1drrd51kXGWDKvEllrjSFCOdsD7Yf5t2FZ_h0Q0av5ujJs-bJint91x2ATRwn1XksG_lVTTArzXuDM0Hc32L1_f28RDJ2fx78jPylwOrYc-oi3vGIpJ8ZNr76st6zmcaCMw6ozyPEfPdAvSrqpWzMbHjt0uoFO7sBOq0NW8VM7-XncZlmQYN-v7Z70vSw1GGohY-vHZa8DuIHrlQL8cGRxd7pnvdApI1OvGfnDKpubAbGfDfLMh9c7z7rCXJeAZe3yR0n-iJABFpm4HnvG9t2wScMlnkilgmYjUeXT7xvL0JnfR_VzQOKa49jV231A5qkKGnkIlB-wb-p-N15Ah1rdKmElyEYuPlzSu0XjADRVvfFuPxh-sAQB70mxLmBd6y2Pb9Dif_NtLNxvPF32iS4VNjaRCWJkiuUTnWZQfSQgpZBFf5tTn36UhZm3mAnj9P7yrkVXmzmV7jmqrzy_DOyXTRblsirzi6zD-IjyTbqXsvmw-TZSd6hkpOgFPe259c3TSzefda0_WQvdnaOqXK3rWd0RrFlgGNBh228_B7duijQz4bQ6WLFltewL8w9y21PUSMgJE6WPAD1PZpZPwZTXsMZiZGx8hFstboUOchqaFF8wbnS4hy9Axg5JXlkhh5zNeSBqmAzUw5AChA3w--8cR1pesh1VPA8_Y19EosuctVKfLB-W-s9b6inUMqTm6pzAprrNjFsAQDBhBeE39ay8_h9qB6_tf5fxkzLZg_klmaiWUCdwDuGTbn3ry6MLKzF7Ia41TKmf7RaMdnQaJkEYfo-wgHmEam0VXbFWuVfyNaS2LDCAaAlyNK1HC77kFqtLw1II_EIYH3UT0PKkxRimt4D6ezAGlZGQQpOwnGvRpxbUcjuZqs_q4fL-lx21tFkkE18fQlCBgxzu8XB4TyzMbXH3xuxzhFd-L2l8lYUwXDNA9Wrozy1S_TbQOKKxRS4GhBY7ln5rFhSjc2YS3PXBethCXK7zW3_akuZHMIxrd4MO5k5_RpEbJYkssYNS9qeuBAeh7g-S4WDyiFLrUG4SSjmHm84QupKLDUFvEcddGSRum41SAYQjbg17X_aj5ZpnMVf97Y5oiUbfo-HJRQvdCOvIVdaF3XJPuFDafkgUbanatzRRHpX6i4yl0iZiCyFkwmpjcznt8yMLEYIDJdsA8Jyxg4S2Z2KhOlRptuwkfBuHFf4zI3HA9apieaaaelQ6II-L2gIVQbuNmY-ZlRt41aKbapYOkeLTaGBakzkLSOwRm6DJKpex9hDdrKiaaBTu9cWO5THoZynzk3S-iCgpIJWp-60UL6uVJoZerBcb5dv3orkWn2_KUv3iO3fgXIQoquwt8r-9Fr1nLf-M6iH_668QE9rHB1bVsLHchBNDq1QS1rSADZzsSfRSLi42AdNGeX-ow_nJqTCsOxqhot12yHClHrcGhwgNLscA5XYdiXBnr9IO1YzAlsQ3TTFPQdNH-DT7XC33pATIOq8N3gBS6RxC5yMPB2MQLtKaXOHCUpLpyyUEtf4WHcnypyJUejM3gBRrA1aZgdRBo2l0UeeG26H4jVwnLRM_G9ckJGL8plV-qX03TOjkEVeKSq8kNR2338ApUdJiyZLvb1i-BTMtOblAM929qeBTJKEwNvQc6oYDWuUGFRZZl03RtFfienYJqtzWsD-LazQl_zD47gXX0IxK2j7eLA8_ujMsoiEZrUqsBKFl3dS94JnL0yk1pAdebjl60hZudMMDRTZwmgTgVfGJeHLggfYSYjMql8P9RSKcGRLPTwshvs7GCAyILQb6AXGGvA0f7XtI8LZ5jIUoyD_wM8XnKFgpv_nt5M4w6ZkXGMzHbVKtRKkYcbcs5wupIgb4GXART3XCaIjYxqSDprv_MS3q3Ub_C4Hz2XvMfTrLjnz1YCavv2-xaCPx18Rl0blJEihrBJq4Y6MQOtPreXqSfVe1hMYucXlrEbm8G0v8L3Q4X7VXLRh2iYaseIZFLFGVCpbfYywbJcTPgQEHSwiqC4zLpNsWl5tynyLbXosr9vWQJRQ8H5s-RpSONw53jfrp6hm6t4q2KdYgKSGOwOy41S9RMAX_JO_VBLnC2hUxQ-86HryTGC1xc0uLpCgMOrw-k1NKgG7n6pVLt0_UafKm_ECd0XAN5iz1WO2ulI9A7iW990nlpmJObjzGJEQJAYjpOmoNKIkvePTdbqngyDGZ_gOPak_eK41SF86tngS9bLiKuevssOsPUEW9KiauE_iJ4IAJCalwoERKyzXToeINirD8pZC1cjJ0TmIjJncUNCEpszKYDWNWdFh-r4DBObQK5BK_q3lbz6Qta-Hzm0hsBt7mBoiEmrrjlW34qN1PefiuJio},{"eventSource":"$undefined","attributionPartner":"$undefined","utmSource":"$undefined","utmCampaign":"$undefined","referrer":"$undefined","pageOrScreen":"Login - Enter Password"}];

        // Forward request to original sso.crunchyroll.com server or use mocked response
        // Here we replace the response headers and body as requested in setup:
        res.setHeader('Content-Type', 'text/x-component');
        res.setHeader('x-amzn-requestid', '70cd6351-4225-46c0-9fa4-9d693ab4883c');
        res.setHeader('x-pathname', '/login');
        
        const mockedResponseBody = `4:I[4707,[],""]
6:I[36423,[],""]
5:["locale","en","d"]
0:["$@1",["cXzPXAKW_NDhW7jlOOqTJ",[[["",{"children":[["locale","en","d"],{"children":["login",{"children":["__PAGE__?{\\\"return_url\\\":\\\"/authorize?client_id=vtdizwxdmekmsmbguice&redirect_uri=https%3A%2F%2Fsso.crunchyroll.com%2Fandroid%2Foauth-callback&response_type=code&scope=offline_access&state=%7B%22flow%22%3A%22SIGN_IN%22%2C%22flowRoot%22%3A%22ONBOARDING%22%7D&code_challenge=44df03a6-1a68-4140-ad02-130aaef2d439&code_challenge_method=plain\\\",\\\"mode\\\":\\\"android\\\",\\\"dc\\\":\\\"1\\\",\\\"hf\\\":\\\"1\\\",\\\"anonymous_id\\\":\\\"35eb850b-8519-4d9a-b68a-ab24ecbad7ac\\\"}",{}]}]},"$undefined","$undefined",true]}],["",{"children":[["locale","en","d"],{"children":["login",{"children":["__PAGE__",{},[["$L2","$L3",null],null],null]},[null,["$","$L4",null,{"parallelRouterKey":"children","segmentPath":["children","$5","children","login","children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L6",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","notFoundStyles":"$undefined"}]],null]},[[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/130666a09b04c2d3.css","precedence":"next","crossOrigin":"$undefined"}],["$","link","1",{"rel":"stylesheet","href":"/_next/static/css/a2b689d0a779dbc8.css","precedence":"next","crossOrigin":"$undefined"}],["$","link","2",{"rel":"stylesheet","href":"/_next/static/css/17e37543235a9361.css","precedence":"next","crossOrigin":"$undefined"}],["$","link","3",{"rel":"stylesheet","href":"/_next/static/css/5981a624228634bf.css","precedence":"next","crossOrigin":"$undefined"}]],"$L7"],null],null]},[null,["$","$L4",null,{"parallelRouterKey":"children","segmentPath":["children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L6",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\\\"Segoe UI\\\",Roboto,Helvetica,Arial,sans-serif,\\\"Apple Color Emoji\\\",\\\"Segoe UI Emoji\\\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":"404"}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],"notFoundStyles":[]}]],null],["$L8",null]]]]]`;

        return res.status(200.5).send(mockedResponseBody);
    } catch (error) {
        console.error('Error handling /login:', error);
        res.status(500).send('Internal Server Error');
    }
});

// 2. Handling /authorize Path
app.all('/authorize', async (req, res) => {
    try {
        console.log('[Intercepted] /authorize request received');

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('location', 'https://sso.crunchyroll.com/android/oauth-callback?state=%7B%22flow%22%3A%22SIGN_IN%22%2C%22flowRoot%22%3A%22ACQUISITION%22%7D&code=xze3bB4is6gqf8eXXrsNqjuAUhsf1dE-');
        res.setHeader('x-pathname', '/authorize');

        const authorizeHtml = `<!DOCTYPE html><html id="__next_error__"><head><meta charSet="utf-8"/><title>Authorize</title></head><body><h1>Authorized</h1></body></html>`;
        
        return res.status(307).send(authorizeHtml);
    } catch (error) {
        console.error('Error handling /authorize:', error);
        res.status(500).send('Internal Server Error');
    }
});

// 3. Handling /en/authorize Path
app.all('/en/authorize', async (req, res) => {
    try {
        console.log('[Intercepted] /en/authorize request received');

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('location', 'https://sso.crunchyroll.com/authorize?client_id=vtdizwxdmekmsmbguice&redirect_uri=https%3A%2F%2Fsso.crunchyroll.com%2Fandroid%2Foauth-callback&scope=offline_access&code_challenge=ce9bee8c-ed75-43f2-a86c-70acfa4b005b&code_challenge_method=plain&response_type=code&state=%7B%22flow%22%3A%22SIGN_IN%22%2C%22flowRoot%22%3A%22ACQUISITION%22%7D&login_only=1&anonymous_id=77c59db8-0900-40be-84ec-2d3115d18b67');
        res.setHeader('x-pathname', '/en/authorize');

        return res.status(307).send('');
    } catch (error) {
        console.error('Error handling /en/authorize:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Fallback for other requests to flow normally without issues
app.all('*', async (req, res) => {
    try {
        const targetUrl = `https://sso.crunchyroll.com${req.url}`;
        const response = await axios({
            method: req.method,
            url: targetUrl,
            headers: { ...req.headers, host: 'sso.crunchyroll.com' },
            data: req.body,
            validateStatus: () => true
        });
        res.set(response.headers);
        res.status(response.status).send(response.data);
    } catch (err) {
        res.status(500).send('Proxy Error');
    }
});

app.listen(PORT, () => {
    console.log(`Fake SSO Server running on port ${PORT}`);
});
[cite: 1, 2]