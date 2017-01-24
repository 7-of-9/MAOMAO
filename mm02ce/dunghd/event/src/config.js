const Config = () => (
  {
    apiUrl: process.env.API_URL,
    firebaseKey: process.env.FIREBASE_KEY,
    firebaseDB: process.env.FIREBASE_DB_URL,
    firebaseStore: process.env.FIREBASE_STORE,
    auth0Key: process.env.AUTH0_KEY,
    auth0ApiKey: process.env.AUTH0_API_KEY,
    auth0ApiSecret: process.env.AUTH0_API_SECRET,
    auth0Url: process.env.AUTH0_URL,
  }
);
export default Config;
