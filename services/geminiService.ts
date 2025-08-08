import { GoogleGenAI, Part } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Helper function to convert File to a Gemini Part
const fileToGenerativePart = async (file: File): Promise<Part> => {
    const base64EncodedData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error("Failed to read file as data URL."));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
    
    return {
        inlineData: {
            data: base64EncodedData,
            mimeType: file.type,
        },
    };
};

export const processPdfFile = async (file: File): Promise<Record<string, any>[]> => {
  const filePart = await fileToGenerativePart(file);

  const textPart = {
    text: `You are an expert at extracting structured tabular data from PDF documents.
The user has uploaded a PDF. Your task is to:
1. Automatically identify the main table(s) within the document.
2. Detect the table headers. Convert each header into a clean, camelCase JSON key (e.g., "First Name" becomes "firstName", "Avg. Monthly Bill" becomes "avgMonthlyBill").
3. Extract all data rows from the table.
4. Structure the output as a single, valid JSON array of objects. Each object in the array represents a row from the table.

Follow these rules strictly:
- The final output must only be the valid JSON array of objects.
- Do not include any text, explanations, or markdown formatting outside of the final JSON array.`
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [textPart, filePart] }],
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      throw new Error("The model returned an empty response. The document might not contain recognizable data.");
    }
    const data = JSON.parse(jsonText);
    
    if (!Array.isArray(data)) {
        throw new Error("The extracted data is not an array. The document might not contain a standard table.");
    }

    return data as Record<string, any>[];
  } catch (error) {
    console.error("Error processing PDF with Gemini API:", error);
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse the model's response. The data structure in the PDF may not be a clear table.");
    }
    throw new Error("Failed to parse data from the uploaded PDF. The file might be corrupted or in an unsupported format.");
  }
};