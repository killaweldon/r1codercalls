/************************************************
 * server.js
 * 
 * Node/Express server for R1 Coder on Render,
 * calling DeepSeek's Chat API with R1_API_TOKEN.
 ************************************************/
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch"); // node-fetch ^2.6.x

const app = express();
const port = process.env.PORT || 3000;

// Read your DeepSeek API Key from Render's environment
const DEEPSEEK_API_KEY = process.env.R1_API_TOKEN;

// Enable CORS so your Chrome extension can call this service
app.use(cors());
app.use(express.json());

// Basic test route
app.get("/", (req, res) => {
  res.send("R1 Coder - DeepSeek Relay is up!");
});

/**
 * POST /api/generate
 * 
 * Expects { prompt: string } in the JSON body (you can add model, etc. if needed).
 * Calls DeepSeek Chat endpoint with the user’s prompt.
 */
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: "Missing prompt" });
    }

    // DeepSeek’s chat completions endpoint:
    const DEEPSEEK_ENDPOINT = "https://api.deepseek.ai/chat/completions";

    // Build the request body in the style DeepSeek docs suggest
    // "model": "deepseek-reasoner" (for R1) or "deepseek-chat" (for V3), etc.
    const requestBody = {
      model: "deepseek-reasoner",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ],
      stream: false
    };

    // POST to DeepSeek with your key
    const response = await fetch(DEEPSEEK_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      // If DeepSeek returns 4xx/5xx, handle
      const errorText = await response.text();
      console.error("DeepSeek error:", errorText);
      return res.status(response.status).json({
        success: false,
        error: `DeepSeek returned ${response.status}: ${errorText}`
      });
    }

    // Parse JSON
    const data = await response.json();

    // The final text is typically in data.choices[0].message.content (OpenAI style)
    let aiText = "No response found.";
    if (
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      aiText = data.choices[0].message.content;
    }

    // Return the text back to your Chrome extension
    return res.json({ success: true, response: aiText });
  } catch (error) {
    console.error("Error in /api/generate:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`R1 Coder server listening on port ${port}`);
});
