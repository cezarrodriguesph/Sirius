import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateLessonIdeas = async (
  subject: string,
  topic: string,
  classLevel: string
): Promise<string> => {
  if (!apiKey) {
    return "Erro: Chave de API não configurada. Por favor, configure a API_KEY.";
  }

  try {
    const prompt = `
      Atue como um assistente pedagógico experiente para um professor do Colégio Estrela Sirius.
      
      Disciplina: ${subject}
      Nível: ${classLevel}
      Tópico da Aula: ${topic}
      
      Gere um resumo estruturado para o diário de classe contendo:
      1. Um objetivo claro de aprendizagem (1 frase).
      2. Tópicos principais abordados (lista com bullets).
      3. Uma sugestão de atividade prática rápida.
      
      Mantenha o tom profissional, direto e em português do Brasil. Saída em Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Speed over deep thought for this UI helper
      }
    });

    return response.text || "Não foi possível gerar sugestões no momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Houve um erro ao conectar com a Inteligência Artificial.";
  }
};
