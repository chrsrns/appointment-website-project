
global.server_backend_url = process.env.NODE_ENV === "development"
  ? 'http://localhost:3000'
  : '';
