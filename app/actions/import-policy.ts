'use server'

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import PDFParser from 'pdf2json';

// Define the schema calls for the LLM
const startSchema = z.object({
    rules: z.array(z.object({
        category: z.string().describe('The category of expense, e.g. Travel, IT Hardware'),
        expenseType: z.enum(['OPEX', 'CAPEX']).describe('Whether this is Capital or Operational expenditure'),
        minAmount: z.number().describe('The minimum amount that triggers this rule'),
        requiredRole: z.string().describe('The job title required to approve this'),
        stepOrder: z.number().describe('The sequence number for approval (1 = first approver)'),
    }))
});

export async function parsePolicyDocument(formData: FormData) {
    const file = formData.get('policyFile') as File;

    if (!file) {
        return { success: false, error: 'No file provided' };
    }

    try {
        // 1. Extract Text from PDF using pdf2json (Pure Node)
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const textContext = await new Promise<string>((resolve, reject) => {
            const pdfParser = new PDFParser(null, 1); // 1 = Raw Text mode

            pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
            pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
                // "rawText" is often URL encoded, pdf2json's getRawTextContent() is safer
                resolve(pdfParser.getRawTextContent());
            });

            pdfParser.parseBuffer(buffer);
        });

        const truncatedText = textContext.slice(0, 20000); // Limit context window

        // 2. Call AI (Mock if no key, or Real if key exists)
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            // Return Mock Data for Demo
            return {
                success: true,
                data: [
                    { category: "Hardware", expenseType: "CAPEX", minAmount: 1000, requiredRole: "IT Manager", stepOrder: 1 },
                    { category: "Hardware", expenseType: "CAPEX", minAmount: 5000, requiredRole: "Finance Director", stepOrder: 2 },
                    { category: "Travel", expenseType: "OPEX", minAmount: 0, requiredRole: "Line Manager", stepOrder: 1 },
                ],
                warning: "Running in Demo Mode (No API Key found). Set OPENAI_API_KEY to use real AI."
            };
        }

        // Real AI Call
        const { object } = await generateObject({
            model: openai('gpt-4o'),
            schema: startSchema,
            prompt: `
        You are a policy analyst. 
        Analyze the following "Delegation of Authority" document text.
        Extract all approval threshold rules.
        
        Text:
        ${truncatedText}
      `,
        });

        return { success: true, data: object.rules };

    } catch (error) {
        console.error('Parse Error:', error);
        return { success: false, error: 'Failed to parse document. The file might be corrupted or encrypted.' };
    }
}
