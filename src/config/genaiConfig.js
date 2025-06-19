// GenAI Configuration - Easy setup for different providers

export const genAIConfig = {
  // OpenAI Configuration
  openai: {
    enabled: false, // Set to true to enable OpenAI
    apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
    model: 'gpt-4',
    baseURL: 'https://api.openai.com/v1',
    temperature: 0.1,
    maxTokens: 1000
  },

  // Anthropic Configuration
  anthropic: {
    enabled: false, // Set to true to enable Anthropic
    apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY || '',
    model: 'claude-3-sonnet-20240229',
    maxTokens: 1000
  },

  // Custom Provider Configuration
  custom: {
    enabled: true, // Default to custom implementation
    endpoint: process.env.REACT_APP_CUSTOM_GENAI_ENDPOINT || '',
    headers: {
      'Authorization': process.env.REACT_APP_CUSTOM_GENAI_AUTH || '',
      'Content-Type': 'application/json'
    },
    model: 'custom-model'
  },

  // Voice Configuration
  voice: {
    enabled: true,
    autoSpeak: false, // Auto-speak AI responses
    language: 'en-US',
    rate: 0.9,
    pitch: 1.0,
    volume: 0.8
  },

  // Legal Analysis Configuration
  legalAnalysis: {
    jurisdiction: 'IN', // India
    code: 'IPC', // Indian Penal Code
    includePunishment: true,
    includeBailable: true,
    severityThresholds: {
      high: 4, // 4+ sections = high severity
      medium: 2, // 2-3 sections = medium severity
      low: 1 // 0-1 sections = low severity
    }
  },

  // Data Extraction Configuration
  dataExtraction: {
    categories: {
      intent: ['dishonest_intent_to_take', 'fraudulent_intent', 'violent_intent'],
      method: ['unauthorized_entry', 'without_consent', 'force', 'deception'],
      location: ['house', 'residence', 'public_road', 'commercial_premises', 'vehicle'],
      time: ['night_time', 'sunset_to_sunrise', 'day_time', 'specific_time'],
      victim_context: ['house_owner', 'individual', 'business_owner', 'employee'],
      offender_attribute: ['repeat_offender', 'known_offender', 'unknown_offender', 'armed'],
      event_condition: ['property_taken', 'property_damaged', 'property_known_to_be_stolen', 'injury_caused']
    },
    confidenceThreshold: 0.7,
    enableFallback: true
  }
};

// Helper functions for configuration management
export const configHelpers = {
  // Get active provider
  getActiveProvider() {
    if (genAIConfig.openai.enabled) return 'openai';
    if (genAIConfig.anthropic.enabled) return 'anthropic';
    if (genAIConfig.custom.enabled) return 'custom';
    return 'custom'; // Default fallback
  },

  // Get provider configuration
  getProviderConfig(provider) {
    return genAIConfig[provider] || genAIConfig.custom;
  },

  // Validate configuration
  validateConfig() {
    const activeProvider = this.getActiveProvider();
    const config = this.getProviderConfig(activeProvider);
    
    const errors = [];
    
    if (activeProvider === 'openai' && !config.apiKey) {
      errors.push('OpenAI API key is required');
    }
    
    if (activeProvider === 'anthropic' && !config.apiKey) {
      errors.push('Anthropic API key is required');
    }
    
    if (activeProvider === 'custom' && !config.endpoint) {
      errors.push('Custom provider endpoint is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      activeProvider,
      config
    };
  },

  // Update configuration
  updateConfig(updates) {
    Object.keys(updates).forEach(key => {
      if (genAIConfig[key]) {
        genAIConfig[key] = { ...genAIConfig[key], ...updates[key] };
      }
    });
  },

  // Get environment variables for setup
  getEnvironmentSetup() {
    return {
      openai: {
        apiKey: process.env.REACT_APP_OPENAI_API_KEY || 'Not set',
        model: process.env.REACT_APP_OPENAI_MODEL || 'gpt-4'
      },
      anthropic: {
        apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY || 'Not set',
        model: process.env.REACT_APP_ANTHROPIC_MODEL || 'claude-3-sonnet-20240229'
      },
      custom: {
        endpoint: process.env.REACT_APP_CUSTOM_GENAI_ENDPOINT || 'Not set',
        auth: process.env.REACT_APP_CUSTOM_GENAI_AUTH || 'Not set'
      }
    };
  }
};

// Setup instructions
export const setupInstructions = {
  openai: `
1. Get your OpenAI API key from https://platform.openai.com/api-keys
2. Create a .env file in your project root
3. Add: REACT_APP_OPENAI_API_KEY=your_api_key_here
4. Set genAIConfig.openai.enabled = true
5. Restart your development server
  `,
  
  anthropic: `
1. Get your Anthropic API key from https://console.anthropic.com/
2. Create a .env file in your project root
3. Add: REACT_APP_ANTHROPIC_API_KEY=your_api_key_here
4. Set genAIConfig.anthropic.enabled = true
5. Restart your development server
  `,
  
  custom: `
1. Set up your custom GenAI endpoint
2. Create a .env file in your project root
3. Add: REACT_APP_CUSTOM_GENAI_ENDPOINT=your_endpoint_url
4. Add: REACT_APP_CUSTOM_GENAI_AUTH=your_auth_token (if required)
5. Customize the API call format in genaiService.js
6. Restart your development server
  `
};

export default genAIConfig; 