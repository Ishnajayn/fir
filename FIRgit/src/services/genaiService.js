// GenAI Service - Modular and Extensible
class GenAIService {
  constructor() {
    this.providers = {
      openai: null,
      anthropic: null,
      custom: null
    };
    this.currentProvider = 'custom'; // Default to custom implementation
  }

  // Initialize different GenAI providers
  initializeProvider(provider, config) {
    switch (provider) {
      case 'openai':
        this.providers.openai = {
          apiKey: config.apiKey,
          model: config.model || 'gpt-4',
          baseURL: config.baseURL || 'https://api.openai.com/v1'
        };
        break;
      case 'anthropic':
        this.providers.anthropic = {
          apiKey: config.apiKey,
          model: config.model || 'claude-3-sonnet-20240229'
        };
        break;
      case 'custom':
        this.providers.custom = {
          endpoint: config.endpoint,
          headers: config.headers || {},
          model: config.model || 'custom-model'
        };
        break;
    }
  }

  // Set the active provider
  setProvider(provider) {
    if (this.providers[provider]) {
      this.currentProvider = provider;
      return true;
    }
    return false;
  }

  // Extract structured data from conversation
  async extractStructuredData(userInput, conversationHistory = []) {
    const prompt = this.buildExtractionPrompt(userInput, conversationHistory);
    
    try {
      const response = await this.callGenAI(prompt);
      return this.parseStructuredResponse(response);
    } catch (error) {
      console.error('Error extracting structured data:', error);
      return this.fallbackExtraction(userInput);
    }
  }

  // Build prompt for data extraction
  buildExtractionPrompt(userInput, conversationHistory) {
    const context = conversationHistory.length > 0 
      ? `Previous conversation: ${conversationHistory.map(msg => msg.content).join(' ')}`
      : '';

    return `
You are a legal AI assistant analyzing FIR (First Information Report) data. Extract structured information from the user input.

User Input: "${userInput}"
${context ? `Context: ${context}` : ''}

Extract and return ONLY a JSON object with the following structure:
{
  "intent": ["array_of_intents"],
  "method": ["array_of_methods"], 
  "location": ["array_of_locations"],
  "time": ["array_of_time_indicators"],
  "victim_context": ["array_of_victim_contexts"],
  "offender_attribute": ["array_of_offender_attributes"],
  "event_condition": ["array_of_event_conditions"]
}

Valid values for each category:
- intent: ["dishonest_intent_to_take", "fraudulent_intent", "violent_intent"]
- method: ["unauthorized_entry", "without_consent", "force", "deception"]
- location: ["house", "residence", "public_road", "commercial_premises", "vehicle"]
- time: ["night_time", "sunset_to_sunrise", "day_time", "specific_time"]
- victim_context: ["house_owner", "individual", "business_owner", "employee"]
- offender_attribute: ["repeat_offender", "known_offender", "unknown_offender", "armed"]
- event_condition: ["property_taken", "property_damaged", "property_known_to_be_stolen", "injury_caused"]

Return ONLY the JSON object, no additional text.
    `.trim();
  }

  // Call the appropriate GenAI provider
  async callGenAI(prompt) {
    const provider = this.providers[this.currentProvider];
    
    if (!provider) {
      throw new Error('No GenAI provider configured');
    }

    switch (this.currentProvider) {
      case 'openai':
        return await this.callOpenAI(provider, prompt);
      case 'anthropic':
        return await this.callAnthropic(provider, prompt);
      case 'custom':
        return await this.callCustomProvider(provider, prompt);
      default:
        throw new Error('Unsupported provider');
    }
  }

  // OpenAI API call
  async callOpenAI(provider, prompt) {
    const response = await fetch(`${provider.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          {
            role: 'system',
            content: 'You are a legal AI assistant for FIR analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Anthropic API call
  async callAnthropic(provider, prompt) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': provider.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: provider.model,
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  // Custom provider call
  async callCustomProvider(provider, prompt) {
    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...provider.headers
      },
      body: JSON.stringify({
        prompt: prompt,
        model: provider.model
      })
    });

    if (!response.ok) {
      throw new Error(`Custom provider error: ${response.status}`);
    }

    const data = await response.json();
    return data.response || data.content || data.text;
  }

  // Parse structured response from GenAI
  parseStructuredResponse(response) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(response);
    } catch (error) {
      console.error('Error parsing GenAI response:', error);
      return this.fallbackExtraction(response);
    }
  }

  // Fallback extraction using simple keyword matching
  fallbackExtraction(input) {
    const extracted = {
      intent: [],
      method: [],
      location: [],
      time: [],
      victim_context: [],
      offender_attribute: [],
      event_condition: []
    };

    const lowerInput = input.toLowerCase();

    // Intent extraction
    if (lowerInput.includes('steal') || lowerInput.includes('theft') || lowerInput.includes('robbery')) {
      extracted.intent.push('dishonest_intent_to_take');
    }

    // Method extraction
    if (lowerInput.includes('break in') || lowerInput.includes('entered') || lowerInput.includes('unauthorized')) {
      extracted.method.push('unauthorized_entry');
    }
    if (lowerInput.includes('without permission') || lowerInput.includes('no consent')) {
      extracted.method.push('without_consent');
    }

    // Location extraction
    if (lowerInput.includes('house') || lowerInput.includes('home') || lowerInput.includes('residence')) {
      extracted.location.push('house', 'residence');
    }
    if (lowerInput.includes('road') || lowerInput.includes('street') || lowerInput.includes('public')) {
      extracted.location.push('public_road');
    }

    // Time extraction
    if (lowerInput.includes('night') || lowerInput.includes('dark') || lowerInput.includes('evening')) {
      extracted.time.push('night_time', 'sunset_to_sunrise');
    }

    // Victim context
    if (lowerInput.includes('owner') || lowerInput.includes('house owner')) {
      extracted.victim_context.push('house_owner');
    }
    if (lowerInput.includes('individual') || lowerInput.includes('person')) {
      extracted.victim_context.push('individual');
    }

    // Offender attributes
    if (lowerInput.includes('repeat') || lowerInput.includes('again') || lowerInput.includes('before')) {
      extracted.offender_attribute.push('repeat_offender');
    }

    // Event conditions
    if (lowerInput.includes('taken') || lowerInput.includes('stolen') || lowerInput.includes('missing')) {
      extracted.event_condition.push('property_taken');
    }
    if (lowerInput.includes('known') || lowerInput.includes('identified')) {
      extracted.event_condition.push('property_known_to_be_stolen');
    }

    return extracted;
  }

  // Generate legal analysis based on extracted data
  async generateLegalAnalysis(extractedData) {
    const prompt = this.buildLegalAnalysisPrompt(extractedData);
    
    try {
      const response = await this.callGenAI(prompt);
      return this.parseLegalAnalysis(response);
    } catch (error) {
      console.error('Error generating legal analysis:', error);
      return this.fallbackLegalAnalysis(extractedData);
    }
  }

  // Build prompt for legal analysis
  buildLegalAnalysisPrompt(extractedData) {
    return `
You are a legal expert analyzing FIR data. Based on the extracted information, provide legal analysis.

Extracted Data: ${JSON.stringify(extractedData, null, 2)}

Provide analysis in the following JSON format:
{
  "applicable_sections": ["list_of_legal_sections"],
  "reasoning": ["list_of_legal_reasoning"],
  "severity": "high|medium|low",
  "recommendations": ["list_of_investigation_recommendations"],
  "punishment_range": "description_of_punishment",
  "bailable": true|false
}

Focus on Indian Penal Code (IPC) sections and provide detailed legal justification.
Return ONLY the JSON object.
    `.trim();
  }

  // Parse legal analysis response
  parseLegalAnalysis(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(response);
    } catch (error) {
      console.error('Error parsing legal analysis:', error);
      return this.fallbackLegalAnalysis({});
    }
  }

  // Fallback legal analysis
  fallbackLegalAnalysis(extractedData) {
    const analysis = {
      applicable_sections: [],
      reasoning: [],
      severity: 'low',
      recommendations: ['Basic investigation required'],
      punishment_range: 'Standard punishment as per IPC',
      bailable: true
    };

    // Add sections based on extracted data
    if (extractedData.intent?.includes('dishonest_intent_to_take')) {
      analysis.applicable_sections.push('Section 378 - Theft');
      analysis.reasoning.push('Dishonest intention to take property establishes mens rea');
    }

    if (extractedData.method?.includes('unauthorized_entry')) {
      analysis.applicable_sections.push('Section 451 - House-trespass');
      analysis.reasoning.push('Unauthorized entry constitutes house-trespass');
    }

    // Determine severity
    if (analysis.applicable_sections.length >= 3) {
      analysis.severity = 'high';
      analysis.recommendations = ['Consider non-bailable offense', 'Immediate investigation required'];
    } else if (analysis.applicable_sections.length >= 2) {
      analysis.severity = 'medium';
      analysis.recommendations = ['Standard investigation procedures'];
    }

    return analysis;
  }
}

// Create singleton instance
const genAIService = new GenAIService();

export default genAIService; 