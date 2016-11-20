const Config = () => (
  {
    apiUrl: process.env.API_URL,
    googleApiKey: process.env.GOOGLE_API_KEY,
    clientId: process.env.CHROME_CLIENT_ID,
    webClientId: process.env.WEB_CLIENT_ID,
    siteUrl: process.env.SITE_URL,
    mailgunKey: process.env.MAILGUN_KEY,
  }
);
export default Config;
