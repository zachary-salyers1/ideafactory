import { GoogleGenAI, Type } from "@google/genai";
import { Idea, BuildPlan } from '../types';

const apiKey = process.env.API_KEY || '';

// Initialize the client.
// Note: In a real production app, you might want to handle missing keys more gracefully in the UI.
const ai = new GoogleGenAI({ apiKey });

export const generateDailyIdeas = async (): Promise<Idea[]> => {
  if (!apiKey) {
    console.warn("No API Key provided. Returning mock data.");
    return mockIdeas();
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate 5 highly profitable, validated software product ideas for late 2025. 
      Focus on macro trends like AI agents, Apple Vision Pro, climate tech, and neurotech.
      
      Return a JSON array of objects.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    one_liner: { type: Type.STRING },
                    platform: { type: Type.STRING, enum: ['Mobile', 'Web', 'Desktop', 'Extension'] },
                    monthly_search_volume: { type: Type.INTEGER },
                    competition_level: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Very High'] },
                    estimated_revenue_low_usd: { type: Type.INTEGER },
                    estimated_revenue_high_usd: { type: Type.INTEGER },
                    success_probability: { type: Type.INTEGER },
                    why_this_wins: { type: Type.STRING }
                },
                required: ["name", "one_liner", "platform", "monthly_search_volume", "competition_level", "estimated_revenue_low_usd", "estimated_revenue_high_usd", "success_probability", "why_this_wins"]
            }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from Gemini");

    const rawIdeas = JSON.parse(text);
    
    // Enrich with client-side fields like date and ID if missing
    return rawIdeas.map((idea: any) => ({
      ...idea,
      id: idea.id || crypto.randomUUID(),
      created_at: new Date().toISOString(),
      chosen: false,
    }));

  } catch (error) {
    console.error("Gemini generation failed:", error);
    return mockIdeas();
  }
};

export const generateBuildPlan = async (idea: Idea): Promise<BuildPlan> => {
  if (!apiKey) {
    return mockBuildPlan(idea);
  }

  try {
    const prompt = `
      Act as a world-class Product Manager and Marketing Expert.
      I have chosen to build the following product:
      
      Name: ${idea.name}
      Description: ${idea.one_liner}
      Platform: ${idea.platform}
      Target Success Probability: ${idea.success_probability}%
      Why it wins: ${idea.why_this_wins}

      Generate a comprehensive 'Build & Launch' plan.
      
      Provide the output in valid JSON format with the following structure:
      {
        "marketing": {
           "gtm_strategy": "A 2-3 sentence summary of the Go-To-Market strategy.",
           "target_audience": ["Persona 1", "Persona 2", "Persona 3"],
           "launch_channels": ["Channel 1", "Channel 2"]
        },
        "product": {
           "core_features": ["Feature 1", "Feature 2", "Feature 3"],
           "tech_stack": ["Tech 1", "Tech 2"],
           "mvp_roadmap": "A short paragraph describing the path to MVP."
        },
        "markdown_full": "A detailed markdown string containing a full 1-page PRD, including specific detailed ad copy examples, database schema suggestions, and a week-by-week execution plan."
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No build plan returned");

    return JSON.parse(text) as BuildPlan;

  } catch (error) {
    console.error("Build plan generation failed:", error);
    return mockBuildPlan(idea);
  }
};

// --- Mocks for fallback ---

const mockIdeas = (): Idea[] => [
  {
    id: '1',
    name: 'ZenFlow Agent',
    one_liner: 'Autonomous AI that manages your calendar and declines meetings based on your deep work goals.',
    platform: 'Extension',
    monthly_search_volume: 45000,
    competition_level: 'Medium',
    estimated_revenue_low_usd: 5000,
    estimated_revenue_high_usd: 25000,
    success_probability: 88,
    why_this_wins: 'Deep work is a massive pain point; existing tools are passive, this is active agentic defense.',
    created_at: new Date().toISOString(),
    chosen: false,
  },
  {
    id: '2',
    name: 'MemoryLane VR',
    one_liner: 'Nostalgia therapy app for Apple Vision Pro connecting elderly with AI-reconstructed childhood environments.',
    platform: 'Mobile', // Technically spatial computing, but categorizing broadly
    monthly_search_volume: 12000,
    competition_level: 'Low',
    estimated_revenue_low_usd: 15000,
    estimated_revenue_high_usd: 80000,
    success_probability: 92,
    why_this_wins: 'Aging population + new hardware form factor = massive blue ocean.',
    created_at: new Date().toISOString(),
    chosen: false,
  }
];

const mockBuildPlan = (idea: Idea): BuildPlan => ({
  marketing: {
    gtm_strategy: "Launch on Product Hunt followed by targeted LinkedIn ads focusing on productivity burnout.",
    target_audience: ["Remote Workers", "Software Engineers", "Founders"],
    launch_channels: ["Product Hunt", "X (Twitter)", "LinkedIn"]
  },
  product: {
    core_features: ["Calendar Integration", "Natural Language Settings", "Auto-Decline Bot"],
    tech_stack: ["React", "Node.js", "OpenAI API"],
    mvp_roadmap: "Week 1: Design & Auth. Week 2: Calendar Sync. Week 3: Agent Logic. Week 4: Launch."
  },
  markdown_full: `# Build Plan for ${idea.name}\n\n**Summary**\nThis is a fallback plan because the API key was missing. \n\n## Strategy\nFocus on the core value proposition: "${idea.one_liner}".`
});
