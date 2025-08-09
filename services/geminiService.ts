import { GoogleGenAI, Part, Type } from "@google/genai";
import { normalizeData } from './excelService';
import { HouseholdData } from "../types";

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

const householdDataSchema = {
    type: Type.OBJECT,
    properties: {
        unitName: { type: Type.STRING, description: "Name or ID of the housing unit." },
        name: { type: Type.STRING, description: "Name of the primary resident or family." },
        location: { type: Type.STRING, description: "Location or address of the household." },
        familyMembers: { type: Type.INTEGER, description: "Number of people living in the house. Should be a whole number." },
        houseType: { type: Type.STRING, description: "Type of house (e.g., Apartment, Independent House)." },
        houseStructure: { type: Type.STRING, description: "Structure of the house (e.g., RCC, Brick)." },
        totalFloorArea: { type: Type.NUMBER, description: "Total floor area, typically in square feet. Extract only the number." },
        yearOfConstruction: { type: Type.INTEGER, description: "The year the house was built. Should be a whole number." },
        avgMonthlyBill: { type: Type.NUMBER, description: "Average monthly electricity bill. Extract only the number, ignoring currency symbols." },
        avgMonthlyWaterBill: { type: Type.NUMBER, description: "Average monthly water bill. Extract only the number." },
        avgMonthlyVehicleCost: { type: Type.NUMBER, description: "Average monthly transportation or fuel cost. Extract only the number." },
        useWindowFilms: { type: Type.BOOLEAN, description: "Whether reflective window films are used (e.g., Yes/1 -> true, No/2 -> false)." },
        hasEnergyEfficientAppliances: { type: Type.BOOLEAN, description: "Whether energy-efficient appliances are used (e.g., Yes/1 -> true, No/2 -> false)." },
        unplugDevicesWhenNotinUse: { type: Type.BOOLEAN, description: "Whether devices are unplugged when not in use (e.g., Yes/1 -> true, No/2 -> false)." },
        usePowerStrip: { type: Type.BOOLEAN, description: "Whether power strips are used for multiple devices (e.g., Yes/1 -> true, No/2 -> false)." },
        cleanRefrigeratorCoils: { type: Type.BOOLEAN, description: "Whether refrigerator coils are cleaned regularly (e.g., Yes/1 -> true, No/2 -> false)." },
        hasSolarPanels: { type: Type.BOOLEAN, description: "Whether solar panels are installed (e.g., Yes/1 -> true, No/2 -> false)." },
        cookingFuel: { type: Type.STRING, description: "Primary fuel used for cooking (e.g., LPG, PNG, Kerosene)." },
    },
};

const fileProcessingSchema = {
    type: Type.ARRAY,
    items: householdDataSchema
};


export const processFileWithAI = async (file: File): Promise<HouseholdData[]> => {
  const filePart = await fileToGenerativePart(file);

  const textPart = {
    text: `You are an expert data extractor. Your task is to analyze the provided file (which could be a PDF or a spreadsheet) and extract all rows of tabular data.
You MUST map the extracted data to the provided JSON schema. Pay close attention to the descriptions to correctly identify columns, even if the headers are different or misspelled (e.g., "Bill Amount", "Average electricity cost", "bill amt" should all map to "avgMonthlyBill").
- Convert boolean-like values (e.g., "Yes", "Y", "1", "No", "N", "2", "0") to strict JSON true/false.
- Convert numerical values to numbers, removing any currency symbols, commas, or units (like "sq.ft.").
- If a value is missing for a particular cell, use a sensible default like an empty string for text, 0 for numbers, or false for booleans.
The output MUST be a single, valid JSON array of objects conforming exactly to the schema. Do not include any other text, explanations, or markdown.`
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [textPart, filePart] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: fileProcessingSchema,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      throw new Error("The model returned an empty response. The document might not contain recognizable data.");
    }
    const rawData = JSON.parse(jsonText);
    
    if (!Array.isArray(rawData)) {
        throw new Error("The extracted data is not an array. The document might not contain a standard table.");
    }

    // The AI output should be clean due to the schema, but normalization can act as a final sanitizer.
    const data = normalizeData(rawData);

    return data;
  } catch (error) {
    console.error("Error processing file with Gemini API:", error);
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse the model's response. The data structure in the file may be complex or unclear.");
    }
    throw new Error("Failed to parse data from the uploaded file. It might be corrupted or in an unsupported format.");
  }
};


export const getEnergyBreakdown = async (
  dataRow: Record<string, any>
): Promise<{ category: string; percentage: number }[]> => {
  const textPart = {
    text: `You are an energy efficiency expert. Based on the following data for a single household in India, estimate the percentage breakdown of their monthly electricity consumption.
    
    Household Data: ${JSON.stringify(dataRow, null, 2)}
    
    Provide your estimation as a JSON array of objects, where each object has a "category" (e.g., "Lighting", "Cooling (Fans/AC)", "Refrigeration", "Appliances (TV, etc.)", "Water Heating", "Other") and a "percentage". The percentages must sum up to 100.
    
    The final output must ONLY be the valid JSON array. Do not include any text, explanations, or markdown formatting.`
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [textPart] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              percentage: { type: Type.NUMBER },
            },
            required: ["category", "percentage"],
          },
        },
      },
    });

    const jsonText = response.text.trim();
    const breakdown = JSON.parse(jsonText);

    if (!Array.isArray(breakdown) || breakdown.some(item => typeof item.category !== 'string' || typeof item.percentage !== 'number')) {
        throw new Error("Model returned data in an unexpected format.");
    }
    
    const totalPercentage = breakdown.reduce((sum, item) => sum + item.percentage, 0);
    if (totalPercentage === 0) return breakdown;
    
    const normalizedBreakdown = breakdown.map(item => ({
        ...item,
        percentage: Math.round((item.percentage / totalPercentage) * 100),
    }));

    // Ensure it sums to exactly 100 after rounding
    const finalTotal = normalizedBreakdown.reduce((sum, item) => sum + item.percentage, 0);
    const roundingDiff = 100 - finalTotal;
    if (roundingDiff !== 0 && normalizedBreakdown.length > 0) {
        normalizedBreakdown[0].percentage += roundingDiff;
    }

    return normalizedBreakdown;

  } catch (error) {
    console.error("Error getting energy breakdown from Gemini API:", error);
    throw new Error("AI could not generate an energy breakdown for this household.");
  }
};