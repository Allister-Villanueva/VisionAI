import * as FileSystem from 'expo-file-system/legacy';

// Define the three targeted personas and requirements
export const PROMPTS = {
  academic: `Act as a university professor analyzing this image. Respond ONLY with a raw JSON object matching this exact shape:
  {
    "objects": ["item1", "item2"],
    "context": "Detailed educational context and background about the items or environment",
    "activities": "Academic observation of any actions or processes occurring",
    "recommendations": "One piece of constructive feedback or learning next step"
  }
  Do not wrap the response in markdown blocks. Return only pure parseable JSON text.`,

  safety: `Act as a workplace safety inspector analyzing this image. Respond ONLY with a raw JSON object matching this exact shape:
  {
    "objects": ["item1", "item2"],
    "context": "The overall workspace environment description",
    "activities": "Identified visible hazards or safety violations (or a clear statement that none exist)",
    "recommendations": "Corrective safety actions or preventive protocols to implement"
  }
  Do not wrap the response in markdown blocks. Return only pure parseable JSON text.`,

  inventory: `Act as an asset management clerk analyzing this image. Respond ONLY with a raw JSON object matching this exact shape:
  {
    "objects": ["item1", "item2"],
    "context": "A clean, clinical classification of the location or storage setup",
    "activities": "Asset condition summary or quantity observation with absolutely no extra commentary",
    "recommendations": "Inventory tracking next step or logging suggestion"
  }
  Do not wrap the response in markdown blocks. Return only pure parseable JSON text.`
};

// Keep your existing imageToBase64 and analyzeImage functions exactly the same below...
/**
 * Converts a local file URI into a clean Base64 data string
 * @param {string} fileUri - The local path to the captured photo
 * @returns {Promise<string>} Pure base64 data string
 */
export async function imageToBase64(fileUri) {
  try {
    // Read the file directly from the device cache as a base64 string
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: 'base64',
    });
    return base64;
  } catch (error) {
    console.error("Failed to convert image to base64:", error);
    throw error;
  }
}

/**
 * Sends a base64 encoded image and prompt payload to the Gemini API
 */
export async function analyzeImage(base64Image, prompt) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_KEY;
  
  if (!apiKey) {
    throw new Error("Gemini API key is missing. Check your root .env file configuration.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: base64Image
            }
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API Error (${response.status}): ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Networking breakdown inside analyzeImage service:", error);
    throw error;
  }
}