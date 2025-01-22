const express = require("express");
const fetch = require("node-fetch"); // or import fetch from 'node-fetch';
const app = express();
const port = process.env.PORT || 3000;

// Load the token from Render environment
const r1ApiToken = process.env.R1_API_TOKEN;

app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Welcome to R1 Coder API!");
});

// Example POST route that calls an external AI service
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, model } = req.body;
    
    // If you have an external AI endpoint:
    // e.g., "https://api.some-llm-service.com/v1/completions"
    const externalAiUrl = "https://example-llm.com/api/v1/generate"; 

    // Call the external service with your token in headers
    const response = await fetch(externalAiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${r1ApiToken}`
      },
      body: JSON.stringify({
        prompt,
        model
      })
    });

    // Parse the returned JSON
    const data = await response.json();

    // Send the data back to the client (Chrome extension)
    return res.json({
      success: true,
      model,
      aiResponse: data
    });
  } catch (error) {
    console.error("Error calling external AI:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`R1 Coder API listening on port ${port}`);
});
