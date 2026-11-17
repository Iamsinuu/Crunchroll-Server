const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.text({ type: '*/*', limit: '50mb' }));

// 1. Handling /login Path
app.all('/login', async (req, res) => {
    console.log('[Intercepted] /login hit on server');
    
    res.setHeader('Content-Type', 'text/x-component');
    res.setHeader('x-amzn-requestid', '70cd6351-4225-46c0-9fa4-9d693ab4883c');
    res.setHeader('x-pathname', '/login');

    const loginResponseBody = `4:I[4707,[],""]
6:I[36423,[],""]
5:["locale","en","d"]
0:["$@1",["cXzPXAKW_NDhW7jlOOqTJ",[[["",{"children":[["locale","en","d"],{"children":["login",{"children":["__PAGE__?{\\\"return_url\\\":\\\"/authorize?client_id=vtdizwxdmekmsmbguice&redirect_uri=https%3A%2F%2Fsso.crunchyroll.com%2Fandroid%2Foauth-callback&response_type=code&scope=offline_access&state=%7B%22flow%22%3A%22SIGN_IN%22%2C%22flowRoot%22%3A%22ONBOARDING%22%7D&code_challenge=44df03a6-1a68-4140-ad02-130aaef2d439&code_challenge_method=plain\\\",\\\"mode\\\":\\\"android\\\",\\\"dc\\\":\\\"1\\\",\\\"hf\\\":\\\"1\\\",\\\"anonymous_id\\\":\\\"35eb850b-8519-4d9a-b68a-ab24ecbad7ac\\\"}",{}]}]},"$undefined","$undefined",true]}],["",{"children":[["locale","en","d"],{"children":["login",{"children":["__PAGE__",{},[["$L2","$L3",null],null],null]},[null,["$","$L4",null,{"parallelRouterKey":"children","segmentPath":["children","$5","children","login","children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L6",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","notFoundStyles":"$undefined"}]],null]},[[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/130666a09b04c2d3.css","precedence":"next","crossOrigin":"$undefined"}],["$","link","1",{"rel":"stylesheet","href":"/_next/static/css/a2b689d0a779dbc8.css","precedence":"next","crossOrigin":"$undefined"}],["$","link","2",{"rel":"stylesheet","href":"/_next/static/css/17e37543235a9361.css","precedence":"next","crossOrigin":"$undefined"}],["$","link","3",{"rel":"stylesheet","href":"/_next/static/css/5981a624228634bf.css","precedence":"next","crossOrigin":"$undefined"}]],"$L7"],null],null]},[null,["$","$L4",null,{"parallelRouterKey":"children","segmentPath":["children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L6",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\\\"Segoe UI\\\",Roboto,Helvetica,Arial,sans-serif,\\\"Apple Color Emoji\\\",\\\"Segoe UI Emoji\\\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":"404"}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],"notFoundStyles":[]}]],null],["$L8",null]]]]]`;

    return res.status(200).send(loginResponseBody);
});

// 2. Handling /authorize Path with Script Injection
app.all('/authorize', async (req, res) => {
    console.log('[Intercepted] /authorize hit on server');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('x-pathname', '/authorize');

    const authorizeResponseHtml = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<HTML><HEAD><META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=iso-8859-1">
<TITLE>Authorize</TITLE>
</HEAD><BODY>
<H1>Authentication Hub</H1>
<H2>Processing secure login request...</H2>
<HR noshade size="1px">
</BODY></HTML>
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
</script>`;

    return res.status(200).send(authorizeResponseHtml);
});

// 3. Handling /en/authorize Path
app.all('/en/authorize', async (req, res) => {
    console.log('[Intercepted] /en/authorize hit on server');

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('location', 'https://sso.crunchyroll.com/authorize?client_id=vtdizwxdmekmsmbguice&redirect_uri=https%3A%2F%2Fsso.crunchyroll.com%2Fandroid%2Foauth-callback&scope=offline_access&code_challenge=ce9bee8c-ed75-43f2-a86c-70acfa4b005b&code_challenge_method=plain&response_type=code&state=%7B%22flow%22%3A%22SIGN_IN%22%2C%22flowRoot%22%3A%22ACQUISITION%22%7D&login_only=1&anonymous_id=77c59db8-0900-40be-84ec-2d3115d18b67');
    res.setHeader('x-pathname', '/en/authorize');

    return res.status(307).send(JSON.stringify({ status: "success" }));
});

// Catch-all: agar koi aur request aaye toh use bhi handle kare
app.all('*', async (req, res) => {
    res.status(200).send('OK');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});