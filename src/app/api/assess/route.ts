import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

export const runtime = 'nodejs';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided.' }, { status: 400 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: audioFile.type || 'audio/wav', data: base64Audio } },
            { text: "Analyze the pronunciation of the speaker in this English audio sample. Grade their overall proficiency out of 100. Break down every word sequentially and flag errors as either 'None', 'Mispronunciation', or 'Omission'." }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pronunciationScore: { type: Type.INTEGER },
            accuracyScore: { type: Type.INTEGER },
            words: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  errorType: { type: Type.STRING, enum: ['None', 'Mispronunciation', 'Omission'] },
                  accuracyScore: { type: Type.INTEGER }
                },
                required: ['word', 'errorType', 'accuracyScore']
              }
            }
          },
          required: ['pronunciationScore', 'accuracyScore', 'words']
        }
      }
    });

    return NextResponse.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Gemini Pipeline Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
