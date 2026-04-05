require("dotenv").config();
const app = require("./src/app");
const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

app.listen(PORT, () => {
  console.log(`
      Server:    ${BASE_URL}
      API Docs:  ${BASE_URL}/api-docs
  `);
});
