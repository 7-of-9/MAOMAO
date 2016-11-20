const Config = () => (
  {
    firebaseKey: process.env.FIREBASE_KEY,
    firebaseDB: process.env.FIREBASE_DB_URL,
    firebaseStore: process.env.FIREBASE_STORE,
  }
);
export default Config;
