const Config = () => (
  {
    apiUrl: process.env.API_URL,
    clientId: process.env.CLIENT_ID,
    siteUrl: process.env.SITE_URL,
    mailgunKey: process.env.MAILGUN_KEY,
  }
);
export default Config;
