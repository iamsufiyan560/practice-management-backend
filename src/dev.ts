import app from "./app.js";

const PORT = 8000;

app.listen(PORT, () => {
  console.log("🚀 Local Express running on http://localhost:" + PORT);
});
