/************************************************
 * server.js
 * 
 * Node/Express server for R1 Coder on Render.
 * Calls an external AI service for real responses,
 * using R1_API_TOKEN from Render environment.
 ************************************************/
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const port = process.env.PORT || 3000;

// Load your token from Render’s environment variables
const R1_API_TOKEN = process.env.R1_API_TOKEN;

// Enable CORS for cross-origin requests (Chrome extension -> this server)
app.use(cors());
// Parse JSON bodies
app.use(express.json());

// Basic test route
app.get("/", (req, res) => {
  res.send("Welcome to R1 Coder API!");
});

/**
 * POST /api/generate
 * Expects { prompt: string, model: string } in JSON
 * Calls an external AI API for a real response
 */
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, model } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: "Missing prompt in request body." });
    }

    // Example external AI endpoint
    const externalUrl = "https://some-external-ai.com/v1/generate";

    // Make a POST request to the external AI, using R1_API_TOKEN for authorization
    const externalResponse = await fetch(externalUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${R1_API_TOKEN}`
      },
      body: JSON.stringify({
        prompt,
        model
      })
    });

    if (!externalResponse.ok) {
      // If the external AI returns an error (4xx/5xx), handle it gracefully
      const errorText = await externalResponse.text();
      console.error("External AI error:", errorText);
      return res.status(externalResponse.status).json({
        success: false,
        error: `External AI returned status ${externalResponse.status}: ${errorText}`
      });
    }

    // Parse the external AI’s response
    const data = await externalResponse.json();

    // Suppose the AI’s text is in data.result
    const aiText = data.result || "No AI result returned.";

    // Return the AI text to the client (Chrome extension)
    return res.json({
      success: true,
      response: aiText
    });

  } catch (error) {
    console.error("Error in /api/generate:", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`R1 Coder API listening on port ${port}`);
});
