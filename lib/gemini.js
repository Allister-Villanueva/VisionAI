import * as FileSystem from 'expo-file-system/legacy';

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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

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