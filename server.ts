import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { 
  getFallbackWasteReport, 
  getFallbackBlueprints, 
  getFallbackReuseIdeas, 
  getFallbackMoreIdeas, 
  getFallbackVoiceAssistant, 
  getFallbackEcoRecommendations 
} from "./fallbackDb";

function cleanAndParseJSON(text: string, isArray: boolean = false): any {
  if (!text) {
    throw new Error("No response text received from Gemini API");
  }

  // Remove potential markdown language codeblocks (e.g. ```json ... ```)
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```$/, "").trim();

  // Try to parse clean string directly
  try {
    const parsed = JSON.parse(cleaned);
    if (!isArray) {
      return parsed;
    }
    // If we wanted an array:
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (parsed && typeof parsed === "object") {
      // Look for common nested list property names
      const arrayKeys = ["ideas", "reuseIdeas", "concepts", "blueprints", "results", "data", "items"];
      for (const key of arrayKeys) {
        if (Array.isArray(parsed[key])) {
          return parsed[key];
        }
      }
      // Check any value that is an array
      for (const val of Object.values(parsed)) {
        if (Array.isArray(val)) {
          return val;
        }
      }
      // Wrapping the object in an array is better than throwing or returning empty
      return [parsed];
    }
    return [];
  } catch (err: any) {
    console.warn(`Initial JSON parsing failed: ${err.message}. Attempting recovery. Raw text was:\n${cleaned}`);
  }

  // If initial JSON parsing failed, try bracket/brace extraction logic
  if (isArray) {
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      const candidates = [
        cleaned.slice(firstBracket, lastBracket + 1),
        cleaned.slice(firstBracket, lastBracket + 1) + "]" // in case truncated
      ];
      for (const candidate of candidates) {
        try {
          const parsed = JSON.parse(candidate);
          if (Array.isArray(parsed)) return parsed;
        } catch (_) {}
      }
    }
    
    // Check if it's actually wrapped as braces
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        const parsed = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
        // Look inside the parsed object
        const arrayKeys = ["ideas", "reuseIdeas", "concepts", "blueprints", "results", "data", "items"];
        for (const key of arrayKeys) {
          if (Array.isArray(parsed[key])) return parsed[key];
        }
        for (const val of Object.values(parsed)) {
          if (Array.isArray(val)) return val;
        }
        return [parsed]; // fallback
      } catch (_) {}
    }
    
    throw new Error("Could not parse AI response as valid JSON array after multiple attempts.");
  } else {
    // Expecting object:
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
      } catch (_) {}
    }
    
    throw new Error("Could not parse AI response as valid JSON object.");
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON body parser for API requests
  app.use(express.json({ limit: '10mb' }));

  // Contact Form Submission API
  app.post("/api/contact", (req, res) => {
    try {
      const { name, email, phone, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ error: "Missing required fields: Name, Email, and Message are required." });
      }

      const submission = {
        id: "submission_" + Date.now(),
        name,
        email,
        phone: phone || "Not Provided",
        message,
        timestamp: new Date().toISOString()
      };

      console.log("=========================================");
      console.log("🆕 NEW CONTACT SUBMISSION RECEIVED FROM USER:");
      console.log(`👤 Name:      ${submission.name}`);
      console.log(`✉️ Email:     ${submission.email}`);
      console.log(`📞 Phone:     ${submission.phone}`);
      console.log(`💬 Message:   ${submission.message}`);
      console.log("=========================================");

      // Persist to contact_submissions.json in workspace root
      const submissionsPath = path.join(process.cwd(), "contact_submissions.json");
      let submissions = [];
      try {
        if (fs.existsSync(submissionsPath)) {
          const rawData = fs.readFileSync(submissionsPath, "utf-8");
          submissions = JSON.parse(rawData);
        }
        submissions.push(submission);
        fs.writeFileSync(submissionsPath, JSON.stringify(submissions, null, 2), "utf-8");
      } catch (fsErr) {
        console.error("Error writing to contact_submissions.json:", fsErr);
      }

      res.status(200).json({ 
        success: true, 
        message: "Your message has been secure-routed directly to Prince Kumar. Thank you!",
        submission 
      });
    } catch (err: any) {
      console.error("Error in contact submission endpoint:", err);
      res.status(500).json({ error: "Internal Server Error in Core Comms Hub." });
    }
  });

  const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error("Gemini API Key is not configured. Please check your environment variables in AI Studio dashboard.");
    return new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  // AI Proxy Endpoint
  app.post("/api/ai/analyze-waste", async (req, res) => {
    try {
      const { imageData, mimeType, language } = req.body;
      const ai = getGenAI();

      const langPrompt = language === 'hindi' ? 'Respond in Hindi (हिंदी).' : language === 'haryanvi' ? 'Respond in Haryanvi (using Devanagari script).' : 'Respond in English.';
      
      const prompt = `Analyze this waste item image for sustainability and upcycled reuse potential.
      Identify the item name, its dominant material, assign an estimated confidence score, and suggest 3 highly creative DIY upcycling or reuse projects.
      Provide a sustainability score (1-100) and estimate the environmental impact reducion (e.g. "Saves 10L water", "Reduces plastic waste").
      
      You MUST respond with a 100% valid JSON object conforming exactly to this structure (do not use markdown, backticks, or preamble):
      {
        "itemName": "string (A clean label or common product name, e.g. 'Old Leather Belt' or 'Plastic Milk Jug')",
        "material": "string (E.g. Glass, Cardboard, Plastic, Metal, Textile, Electronics, or Organic)",
        "confidence": number,
        "reuseIdeas": [
          {
            "title": "string (A short, descriptive DIY upcycle project name)",
            "description": "string (A complete sentence explaining what are we transforming it into)",
            "difficulty": "Easy" | "Medium" | "Hard",
            "materialsNeeded": ["string"],
            "steps": ["string"],
            "estimatedCost": "string (Cost range in Indian Rupees with ₹ symbol, e.g. '₹50 - ₹100' or '₹0')",
            "videoTutorialTarget": "string (A suitable lookup search phrase for searching tutorials on YouTube, e.g., 'how to upcycle paint cans')"
          }
        ],
        "sustainabilityScore": number,
        "impactReduction": "string"
      }

      ${langPrompt}
      Double-check that the JSON conforms exactly to this structure. Do not output anything other than this valid JSON object.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: {
          parts: [
            {
              inlineData: {
                data: imageData,
                mimeType: mimeType
              }
            },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json"
        }
      });

      let text = response.text;
      if (!text) throw new Error("No response string from AI model");
      res.json(cleanAndParseJSON(text, false));
    } catch (error: any) {
      console.warn("AI Generation failed. Initiating high-fidelity fallback database for analyze-waste.", error.message);
      try {
        const fallback = getFallbackWasteReport("plastic bottle", req.body.language);
        res.json(fallback);
      } catch (fbError: any) {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // QR & Barcode Proxy Endpoint
  app.post("/api/ai/analyze-code", async (req, res) => {
    try {
      const { code, language } = req.body;
      const ai = getGenAI();

      const langPrompt = language === 'hindi' ? 'Respond in Hindi (हिंदी).' : language === 'haryanvi' ? 'Respond in Haryanvi (using Devanagari script).' : 'Respond in English.';

      const prompt = `You are analyzing a scanned product code, QR code text, or barcode value: "${code}".
      Determine what standard product, waste group, or raw material this code likely represents (e.g. if it is a serial, text, or category name).
      Then, synthesize a dynamic upcycling and sustainability blueprint report for this material.
      Provide:
      1. itemName (Clean label or product category name, e.g. "Glass Jam Jar")
      2. material (Primary material, e.g. Glass, Cardboard, Plastic, Metal, Textile, Electronics)
      3. confidence (Estimated confidence score for this item, number between 1 to 100)
      4. reuseIdeas (An array of 3 distinct, creative, and futuristic upcycling / DIY projects, each containing:
         - title
         - description
         - difficulty (Easy/Medium/Hard)
         - materialsNeeded (as array of strings)
         - steps (as array of strings)
         - estimatedCost (in INR, e.g. "₹50 - ₹100")
         - videoTutorialTarget (a search term or label for searching tutorials, e.g., "how to upcycle glass jars")
      5. sustainabilityScore (Eco Index Score between 1 and 100)
      6. impactReduction (Estimated Carbon, water or garbage reduction, e.g. "0.8 kg CO2 offset")

      ${langPrompt}
      Return ONLY a valid JSON object in this format (no markdown, no preamble):
      {
        "itemName": "string",
        "material": "string",
        "confidence": number,
        "reuseIdeas": [
          {
            "title": "string",
            "description": "string",
            "difficulty": "Easy" | "Medium" | "Hard",
            "materialsNeeded": ["string"],
            "steps": ["string"],
            "estimatedCost": "string",
            "videoTutorialTarget": "string"
          }
        ],
        "sustainabilityScore": number,
        "impactReduction": "string"
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      let text = response.text;
      if (!text) throw new Error("No response string from AI model");
      res.json(cleanAndParseJSON(text, false));
    } catch (error: any) {
      console.warn("AI Code scan failed. Initiating high-fidelity fallback database for analyze-code.", error.message);
      try {
        const fallback = getFallbackWasteReport(req.body.code, req.body.language);
        res.json(fallback);
      } catch (fbError: any) {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.post("/api/ai/analyze-code-image", async (req, res) => {
    try {
      const { imageData, mimeType, language } = req.body;
      const ai = getGenAI();

      const langPrompt = language === 'hindi' ? 'Respond in Hindi (हिंदी).' : language === 'haryanvi' ? 'Respond in Haryanvi (using Devanagari script).' : 'Respond in English.';

      const prompt = `This is an image uploaded by a user who is attempting to scan a QR code, barcode, product label, or recycle serial code from this item.
      1. Carefully inspect the image for a QR code, barcode, brand name, label, or recycle symbol.
      2. If you find a barcode or QR code, decode or identify the raw value or product it represents.
      3. If no clear QR code or barcode is present or readable, identify the item, packaging, or material itself from the image.
      4. Synthesize a comprehensive waste upcycling and sustainability report.

      Ensure the output is 100% valid JSON with the exact field structures listed below.
      Provide:
      - itemName: A clean label or common product name (e.g. "Glass Soda Bottle" or "Cereal Box")
      - material: The dominant material type (Glass, Cardboard, Plastic, Metal, Textile, Electronics, or Organic)
      - confidence: Number between 10 and 100 estimated confidence
      - reuseIdeas: Array of exactly 3 distinct, creative upcycling ideas. Each idea MUST have:
         * title (short name)
         * description (full sentence)
         * difficulty ("Easy", "Medium", or "Hard")
         * materialsNeeded (array of strings)
         * steps (array of strings)
         * estimatedCost (string with ₹ currency)
         * videoTutorialTarget (string suitable for search)
      - sustainabilityScore: Number between 1 and 100
      - impactReduction: A short string with environmental offsets

      ${langPrompt}
      Return ONLY a valid JSON object in this format (no markdown formatting, no preamble, and no backticks):
      {
        "itemName": "string",
        "material": "string",
        "confidence": number,
        "reuseIdeas": [
          {
            "title": "string",
            "description": "string",
            "difficulty": "Easy" | "Medium" | "Hard",
            "materialsNeeded": ["string"],
            "steps": ["string"],
            "estimatedCost": "string",
            "videoTutorialTarget": "string"
          }
        ],
        "sustainabilityScore": number,
        "impactReduction": "string"
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: {
          parts: [
            {
              inlineData: {
                data: imageData,
                mimeType: mimeType
              }
            },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json"
        }
      });

      let text = response.text;
      if (!text) throw new Error("No response string from AI model");
      res.json(cleanAndParseJSON(text, false));
    } catch (error: any) {
      console.warn("AI Code image scan failed. Initiating high-fidelity fallback database for analyze-code-image.", error.message);
      try {
        const fallback = getFallbackWasteReport("plastic bottle", req.body.language);
        res.json(fallback);
      } catch (fbError: any) {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.post("/api/ai/studio-blueprints", async (req, res) => {
    try {
      const { wasteItem, language } = req.body;
      const ai = getGenAI();

      const langPrompt = language === 'hindi' ? 'Respond in Hindi (हिंदी).' : language === 'haryanvi' ? 'Respond in Haryanvi (using Devanagari script).' : 'Respond in English.';

      const prompt = `Synthesize innovative, high-end, premium upcycling blueprints for the waste item: ${wasteItem}.
      Focus on "Premium Upcycling" where waste is transformed into luxurious, high-utility, or smart designer products.
      Return exactly 3 distinct concepts.
      
      You MUST respond with a 100% valid JSON array of exactly 3 objects. Each object MUST conform strictly to this structure:
      {
        "title": "string (E.g. Architectural Amber Lampion)",
        "originalMaterial": "string (E.g. Glass Soda Bottle)",
        "concept": "string (A descriptive overview of the creative upcycled product and its design concept)",
        "difficulty": "Easy" | "Medium" | "Hard",
        "estimatedCost": "string (Total estimate with Indian Rupee symbol, e.g. '₹200 - ₹500' or '₹50')",
        "materials": ["string (minimum 3 required materials)"],
        "steps": ["string (minimum 3 execution steps describing how to construct it)"],
        "vibe": "string (A futuristic, aesthetic, or high-end design description, e.g. 'Parametric Industrial / Soft Warm Glow')"
      }

      ${langPrompt}
      Return ONLY a valid JSON array of those 3 objects. No markdown formatting, preamble, or explainers.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      let text = response.text;
      if (!text) throw new Error("No response string from AI model");
      res.json(cleanAndParseJSON(text, true));
    } catch (error: any) {
      console.warn("AI Blueprints failed. Initiating high-fidelity fallback database for studio-blueprints.", error.message);
      try {
        const fallback = getFallbackBlueprints(req.body.wasteItem, req.body.language);
        res.json(fallback);
      } catch (fbError: any) {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.post("/api/ai/reuse-ideas", async (req, res) => {
    try {
      const { itemDescription, language } = req.body;
      const ai = getGenAI();

      const langPrompt = language === 'hindi' ? 'Respond in Hindi (हिंदी).' : language === 'haryanvi' ? 'Respond in Haryanvi (using Devanagari script).' : 'Respond in English.';

      const prompt = `You are a futuristic, smart sustainability generator. Respond *ONLY* with a JSON array of exactly 3 different, high-quality, and highly-creative upcycling or reuse ideas for this item/material: "${itemDescription}".
      Each object in the array MUST strictly conform to the following JSON structure:
      {
        "idea": "A short, highly creative project/reuse title (e.g., Vertical Herb Planter)",
        "process": "A clear, concise, 1-2 sentence description explaining the upcycling process or how to do it",
        "impact": "A specific positive environmental/sustainability impact metric (e.g., Saves 5L Water or Reduces Plastic Waste)",
        "difficulty": "Easy" | "Medium" | "Hard",
        "materialsNeeded": [
          "material 1",
          "material 2"
        ],
        "steps": [
          "Step 1 description",
          "Step 2 description"
        ],
        "estimatedCost": "Cost range in INR (e.g., ₹50 - ₹100 or ₹0)",
        "videoTutorialTarget": "Search query for YouTube (e.g., build vertical herb planter using plastic bottles)"
      }

      ${langPrompt}
      Return ONLY the valid JSON array of objects. No markdown formatting, no preamble, and no explanation.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      let text = response.text;
      if (!text) throw new Error("No response string from AI model");
      res.json(cleanAndParseJSON(text, true));
    } catch (error: any) {
      console.warn("AI reuse-ideas generation failed. Initiating fallback database.", error.message);
      try {
        const fallback = getFallbackReuseIdeas(req.body.itemDescription, req.body.language);
        res.json(fallback);
      } catch (fbError: any) {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.post("/api/ai/more-ideas", async (req, res) => {
    try {
      const { itemName, material, language } = req.body;
      const ai = getGenAI();

      const langPrompt = language === 'hindi' ? 'Respond in Hindi (हिंदी).' : language === 'haryanvi' ? 'Respond in Haryanvi (using Devanagari script).' : 'Respond in English.';

      const prompt = `You are a futuristic, smart sustainability generator. Respond *ONLY* with a JSON array of exactly 3 additional/new upcycling or reuse ideas for this item: Name: "${itemName}", Material: "${material}".
      Do not repeat any previous standard suggestions.
      Each object in the array MUST strictly conform to the following JSON structure:
      {
        "title": "A short creative project title (e.g., Self-Watering Planter)",
        "description": "A clever 1-sentence synopsis of the project",
        "difficulty": "Easy" | "Medium" | "Hard",
        "materialsNeeded": [
          "material 1",
          "material 2"
        ],
        "steps": [
          "Step 1 description",
          "Step 2 description"
        ],
        "estimatedCost": "Cost range in INR (e.g., ₹50 - ₹100 or ₹0)",
        "videoTutorialTarget": "Search query for YouTube (e.g., build self watering planter plastic bottle)"
      }

      ${langPrompt}
      Return ONLY the valid JSON array of objects. No markdown formatting, no preamble, and no explanation.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      let text = response.text;
      if (!text) throw new Error("No response string from AI model");
      res.json(cleanAndParseJSON(text, true));
    } catch (error: any) {
      console.warn("AI more-ideas generation failed. Initiating fallback database.", error.message);
      try {
        const fallback = getFallbackMoreIdeas(req.body.itemName, req.body.material, req.body.language);
        res.json(fallback);
      } catch (fbError: any) {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.post("/api/ai/voice-assistant", async (req, res) => {
    try {
      const { text } = req.body;
      const ai = getGenAI();

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: text,
        config: {
          systemInstruction: "You are the ReWise AI Assistant, a futuristic, helpful, and eco-conscious guide. Help users with waste reuse, sustainability tips, and circular economy concepts. Keep responses concise and inspiring."
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.warn("AI Voice assistant failed. Initiating fallback database.", error.message);
      try {
        const textFallback = getFallbackVoiceAssistant(req.body.text);
        res.json({ text: textFallback });
      } catch (fbError: any) {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.post("/api/ai/eco-recommendations", async (req, res) => {
    try {
      const { data } = req.body;
      const ai = getGenAI();

      const prompt = `Given these environmental conditions: 
      Temperature: ${data.temp}°C, 
      Humidity: ${data.humidity}%, 
      AQI: ${data.aqi}, 
      Location: ${data.location}.
      
      Provide 3 "Smart Sustainability" recommendations for someone in this area. 
      Focus on waste reduction, energy efficiency, and circular economy. 
      Keep them futuristic and concise.
      Return ONLY a JSON array of 3 strings. No markdown.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      let text = response.text;
      if (!text) throw new Error("No response string from AI model");
      res.json(cleanAndParseJSON(text, true));
    } catch (error: any) {
      console.warn("AI Eco Recommendations failed. Initiating fallback database.", error.message);
      try {
        const d = req.body.data || {};
        const fallback = getFallbackEcoRecommendations(d.temp || 30, d.humidity || 60, d.aqi || 2);
        res.json(fallback);
      } catch (fbError: any) {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.get("/api/weather", async (req, res) => {
    try {
      const { lat, lon } = req.query;
      const apiKey = process.env.VITE_OPENWEATHER_API_KEY || process.env.OPENWEATHER_API_KEY;
      
      if (!apiKey) {
         // Use Open-Meteo (Free, no key required) for real-time data
         try {
           const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`);
           const aqiRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,carbon_monoxide,nitrogen_dioxide,ozone,pm2_5`);
           
           const weatherData: any = await weatherRes.json();
           const aqiData: any = await aqiRes.json();

           // Map Open-Meteo response to our structure
           return res.json({
             temp: weatherData.current.temperature_2m,
             humidity: weatherData.current.relative_humidity_2m,
             aqi: Math.ceil((aqiData.current.us_aqi || 50) / 50), // Map US AQI (0-500) to our 1-5 scale roughly
             co: aqiData.current.carbon_monoxide || 400,
             no2: aqiData.current.nitrogen_dioxide || 20,
             o3: aqiData.current.ozone || 30,
             pm2_5: aqiData.current.pm2_5 || 15,
             description: "Atmospheric data retrieved from Open-Meteo Grid.",
             location: "Indian Subcontinent (Real-Time)"
           });
         } catch (e) {
           // Extreme Fallback
           return res.json({
             temp: 30.5,
             humidity: 65,
             aqi: 2,
             co: 400,
             no2: 20,
             o3: 35,
             pm2_5: 25,
             description: "Fallback data active.",
             location: "India Local"
           });
         }
      }

      const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
      const pollutionRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
      
      const weatherData: any = await weatherRes.json();
      const pollutionData: any = await pollutionRes.json();

      res.json({
        temp: weatherData.main.temp,
        humidity: weatherData.main.humidity,
        aqi: pollutionData.list[0].main.aqi,
        co: pollutionData.list[0].components.co,
        no2: pollutionData.list[0].components.no2,
        o3: pollutionData.list[0].components.o3,
        pm2_5: pollutionData.list[0].components.pm2_5,
        description: weatherData.weather[0].description,
        location: weatherData.name
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
