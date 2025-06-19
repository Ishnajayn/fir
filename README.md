# FIR (First Information Report) Application

A React-based FIR application with GenAI integration for intelligent form filling and legal analysis.

## Features

- **Tab 1**: Three-column layout with field status, FIR form, and AI chat interface
- **Tab 2**: Form preview, legal analysis, and section matching visualization
- **GenAI Integration**: Modular AI service supporting multiple providers
- **Voice Input**: Speech recognition and text-to-speech capabilities
- **Auto-population**: Form fields automatically filled based on conversation
- **Legal Analysis**: Automatic section matching and severity assessment

## Quick Start

### Option 1: Using Batch File (Recommended)
```bash
# Double-click or run in Command Prompt
run-app.bat
```

### Option 2: Manual Start
```bash
# Install dependencies
npm install

# Start the application
npm start
```

## Project Structure

```
FIR/
├── src/
│   ├── components/
│   │   ├── FIRForm.js          # Main form with AI chat
│   │   └── FormPreview.js      # Preview and legal analysis
│   ├── services/
│   │   ├── genaiService.js     # Modular GenAI integration
│   │   └── voiceService.js     # Voice input/output
│   ├── config/
│   │   └── genaiConfig.js      # AI provider configuration
│   ├── App.js                  # Main application
│   └── index.js               # Entry point
├── public/                    # Static assets
├── package.json              # Dependencies
├── run-app.bat              # Quick start script
└── README.md                # This file
```

## Configuration

### GenAI Setup
Edit `src/config/genaiConfig.js` to configure your preferred AI provider:

```javascript
const genAIConfig = {
  providers: {
    openai: {
      apiKey: 'your-openai-key',
      model: 'gpt-3.5-turbo'
    },
    anthropic: {
      apiKey: 'your-anthropic-key',
      model: 'claude-3-sonnet'
    }
  },
  activeProvider: 'openai',
  voice: {
    enabled: true,
    autoSpeak: true
  }
};
```

## Usage

1. **Start the application** using one of the batch files
2. **Switch to Tab 1** to begin filling the FIR
3. **Chat with the AI** to describe the incident
4. **Watch fields auto-populate** as the AI extracts information
5. **Switch to Tab 2** to see the complete analysis and legal sections

## Troubleshooting

### PowerShell Execution Policy Error
If you encounter PowerShell script execution errors, use the batch files instead:
- `run-app.bat` - Clean install and start
- `start-app.bat` - Quick start

### Port Already in Use
If port 3000 is busy, the app will automatically offer to use another port.

### Node.js Not Found
Ensure Node.js is installed and in your system PATH, or use the batch files which set the PATH temporarily.

## Dependencies

- React 18
- Material-UI (MUI)
- Web Speech API (for voice features)
- Modular GenAI service architecture

## License

This project is for educational and demonstration purposes. 