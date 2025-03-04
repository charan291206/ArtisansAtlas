const express = require("express");
const path = require("path");

//definitions
const projectDir = "H:\\project";
const app = express();
const PORT = 8000;

console.log("Static files served from:", projectDir);
console.log("Main page served: demo.html");
// Set the project directory
 // Use double backslashes for Windows paths

// Serve static files from the project directory
app.use(express.static(projectDir));

// Serve demo.html as the main page
app.get("/", (req, res) => {
    res.sendFile(path.join(projectDir, "demo.html"));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});