
global.server_backend_url = process.env.NODE_ENV === "development"
  ? process.env.REACT_APP_URL_DEVELOPMENT
  : process.env.REACT_APP_URL_PRODUCTION;
