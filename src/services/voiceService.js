// Voice Service - Speech Recognition and Text-to-Speech
class VoiceService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.isSpeaking = false;
    this.onResult = null;
    this.onError = null;
    this.onStart = null;
    this.onEnd = null;
    
    this.initializeSpeechRecognition();
  }

  // Initialize speech recognition
  initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      // Configure recognition settings
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;
      
      // Set up event handlers
      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onStart) this.onStart();
      };
      
      this.recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (this.onResult) {
          this.onResult({
            final: finalTranscript,
            interim: interimTranscript,
            isFinal: event.results[event.results.length - 1].isFinal
          });
        }
      };
      
      this.recognition.onerror = (event) => {
        this.isListening = false;
        if (this.onError) this.onError(event.error);
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onEnd) this.onEnd();
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }

  // Start listening for voice input
  startListening() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        return true;
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        return false;
      }
    }
    return false;
  }

  // Stop listening
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  // Check if speech recognition is supported
  isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  // Check if currently listening
  getListeningStatus() {
    return this.isListening;
  }

  // Set event handlers
  setEventHandlers(handlers) {
    if (handlers.onResult) this.onResult = handlers.onResult;
    if (handlers.onError) this.onError = handlers.onError;
    if (handlers.onStart) this.onStart = handlers.onStart;
    if (handlers.onEnd) this.onEnd = handlers.onEnd;
  }

  // Text-to-speech functionality
  speak(text, options = {}) {
    if (!this.synthesis) {
      console.warn('Speech synthesis not supported');
      return false;
    }

    // Stop any current speech
    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure speech options
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;
    utterance.lang = options.lang || 'en-US';
    
    // Set voice if specified
    if (options.voice) {
      utterance.voice = options.voice;
    }

    // Event handlers
    utterance.onstart = () => {
      this.isSpeaking = true;
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (event) => {
      this.isSpeaking = false;
      if (options.onError) options.onError(event);
    };

    // Start speaking
    this.synthesis.speak(utterance);
    return true;
  }

  // Stop speaking
  stopSpeaking() {
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  // Check if currently speaking
  getSpeakingStatus() {
    return this.isSpeaking;
  }

  // Get available voices
  getVoices() {
    return new Promise((resolve) => {
      if (this.synthesis) {
        let voices = this.synthesis.getVoices();
        if (voices.length > 0) {
          resolve(voices);
        } else {
          this.synthesis.onvoiceschanged = () => {
            voices = this.synthesis.getVoices();
            resolve(voices);
          };
        }
      } else {
        resolve([]);
      }
    });
  }

  // Get default voice
  getDefaultVoice() {
    return this.getVoices().then(voices => {
      return voices.find(voice => voice.default) || voices[0] || null;
    });
  }

  // Speak with AI response
  speakAIResponse(text) {
    return this.speak(text, {
      rate: 0.9,
      pitch: 1.0,
      volume: 0.8,
      onStart: () => console.log('AI speaking started'),
      onEnd: () => console.log('AI speaking ended'),
      onError: (error) => console.error('AI speaking error:', error)
    });
  }

  // Toggle listening (start/stop)
  toggleListening() {
    if (this.isListening) {
      this.stopListening();
      return false;
    } else {
      return this.startListening();
    }
  }

  // Clean up resources
  destroy() {
    this.stopListening();
    this.stopSpeaking();
    this.onResult = null;
    this.onError = null;
    this.onStart = null;
    this.onEnd = null;
  }
}

// Create singleton instance
const voiceService = new VoiceService();

export default voiceService; 