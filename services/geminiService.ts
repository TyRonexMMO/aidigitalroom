import { GoogleGenAI, Type } from "@google/genai";
import type { ReceiptData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const studentDetailsSchema = {
  type: Type.OBJECT,
  properties: {
    studentName: { type: Type.STRING, description: "The student's full name, preserving the original script from input." },
    classLevel: { type: Type.STRING, description: 'e.g., "Class X", "Class XII", "Class V"' },
    section: { type: Type.STRING, description: 'e.g., "A", "B", "C"' },
    rollNo: { type: Type.STRING, description: "A unique roll number, e.g., 'S1234'" },
    majorSubject: { type: Type.STRING, description: 'e.g., "Science", "Commerce", "Computer Science"' },
    amount: { type: Type.NUMBER, description: "A tuition fee between 10000 and 50000 INR." },
    amountInWords: { type: Type.STRING, description: 'The tuition fee in English words, e.g., "Fifty Thousand Rupees Only"' },
    paymentMode: { type: Type.STRING, description: 'e.g., "Cash", "Bank Transfer", "UPI"' },
    paymentDetails: { type: Type.STRING, description: 'e.g., "Paid in full", "Transaction ID: 12345"' },
  },
  required: ["studentName", "classLevel", "section", "rollNo", "majorSubject", "amount", "amountInWords", "paymentMode", "paymentDetails"],
};

export const generateStudentDetails = async (names: string[]): Promise<Omit<ReceiptData, 'id' | 'receiptNo' | 'issueDate' | 'academicYear' | 'receivedFrom' | 'paymentFor' | 'schoolAddress' | 'schoolPhone'>[]> => {
  const prompt = `
    You are an administrative assistant for a school in India. Your task is to generate tuition receipt details for a list of students.
    For the following list of student names: ${names.join(', ')}
    Generate a JSON array where each object represents one student's details according to the provided schema.
    - Preserve the 'studentName' exactly as provided in the input list.
    - All other generated fields should be in English and reflect a plausible Indian school context.
    - 'amountInWords' must be the English language representation of the 'amount', ending with "Rupees Only".
    `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: studentDetailsSchema,
        },
      },
    });

    const jsonText = response.text.trim();
    const generatedData = JSON.parse(jsonText);

    // Gemini might return a single object if only one name is provided
    return Array.isArray(generatedData) ? generatedData : [generatedData];
  } catch (error) {
    console.error("Error generating student details:", error);
    throw new Error("Failed to generate student details from AI.");
  }
};


export const generateSignature = async (): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: "A sophisticated, flowing, handwritten signature for an official school document. The signature should be illegible but look professional, like a principal's signature. Black ink on a pure white background, isolated, no shadows.",
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '16:9',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/png;base64,${base64ImageBytes}`;
    }
    throw new Error("No image was generated.");
  } catch (error) {
    console.error("Error generating signature:", error);
    throw new Error("Failed to generate AI signature.");
  }
};