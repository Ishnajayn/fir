import React, { useState, useEffect, useRef } from 'react';
import {
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  IconButton,
  InputAdornment,
  Alert,
  AlertTitle,
  Switch,
  FormControlLabel,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Send,
  Person,
  Event,
  LocationOn,
  Phone,
  Email,
  Warning,
  SmartToy,
  Psychology,
  Security,
  AccessTime,
  Home,
  PersonOff,
  Mic,
  MicOff,
  VolumeUp,
  VolumeOff,
  Settings,
  Refresh
} from '@mui/icons-material';

// Import services
import genAIService from '../services/genaiService';
import voiceService from '../services/voiceService';
import { genAIConfig, configHelpers } from '../config/genaiConfig';

const FIRForm = ({ firData, updateFirData }) => {
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m your GenAI assistant. I\'ll help you fill out the FIR and extract structured information from our conversation. You can type or use voice input to describe the incident.'
    },
    {
      id: 2,
      type: 'user',
      content: 'Someone broke into my house at night without permission and stole my laptop. I\'m the owner and this person has done this before. The property was taken and I know it was stolen.'
    },
    {
      id: 3,
      type: 'ai',
      content: 'I\'ve extracted structured data from your description. Based on your report, I\'ve identified: dishonest intent to take property, unauthorized entry without consent, incident occurred at your residence during night time, you are the house owner, the offender is a repeat offender, and property was taken and known to be stolen. This information will help with legal analysis and form completion.'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(genAIConfig.voice.enabled);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [genAIStatus, setGenAIStatus] = useState('ready');
  const [configErrors, setConfigErrors] = useState([]);
  
  const chatEndRef = useRef(null);

  // Initialize services on component mount
  useEffect(() => {
    initializeServices();
    setupVoiceHandlers();
    scrollToBottom();
    // Auto-populate form based on initial extracted data
    autoPopulateForm();
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Auto-populate form based on extracted data and conversation
  const autoPopulateForm = () => {
    const { agentExtractedData } = firData;
    
    // Auto-populate incident type based on intent
    if (agentExtractedData.intent?.includes('dishonest_intent_to_take') && !firData.incident.type) {
      handleFieldChange('incident', 'type', 'Theft');
    }
    
    // Auto-populate severity based on extracted data
    if (!firData.incident.severity) {
      const severity = determineSeverity(agentExtractedData);
      handleFieldChange('incident', 'severity', severity);
    }
    
    // Auto-populate description based on conversation
    if (!firData.incident.description) {
      const description = generateDescriptionFromData(agentExtractedData);
      handleFieldChange('incident', 'description', description);
    }
    
    // Auto-populate location if available
    if (agentExtractedData.location?.length > 0 && !firData.incident.location) {
      const location = agentExtractedData.location.join(', ');
      handleFieldChange('incident', 'location', location);
    }
    
    // Auto-populate time if available
    if (agentExtractedData.time?.length > 0 && !firData.incident.time) {
      const time = agentExtractedData.time.includes('night_time') ? 'Night time' : 'Day time';
      handleFieldChange('incident', 'time', time);
    }
  };

  // Determine severity based on extracted data
  const determineSeverity = (extractedData) => {
    const factors = [];
    
    if (extractedData.intent?.includes('dishonest_intent_to_take')) factors.push('theft');
    if (extractedData.method?.includes('unauthorized_entry')) factors.push('break-in');
    if (extractedData.time?.includes('night_time')) factors.push('night-time');
    if (extractedData.offender_attribute?.includes('repeat_offender')) factors.push('repeat-offender');
    if (extractedData.location?.includes('house')) factors.push('residential');
    
    if (factors.length >= 4) return 'High';
    if (factors.length >= 2) return 'Medium';
    return 'Low';
  };

  // Generate description from extracted data
  const generateDescriptionFromData = (extractedData) => {
    const parts = [];
    
    if (extractedData.intent?.includes('dishonest_intent_to_take')) {
      parts.push('Theft incident');
    }
    
    if (extractedData.method?.includes('unauthorized_entry')) {
      parts.push('involved unauthorized entry');
    }
    
    if (extractedData.location?.includes('house')) {
      parts.push('into residential property');
    }
    
    if (extractedData.time?.includes('night_time')) {
      parts.push('during night time');
    }
    
    if (extractedData.offender_attribute?.includes('repeat_offender')) {
      parts.push('by a repeat offender');
    }
    
    if (extractedData.event_condition?.includes('property_taken')) {
      parts.push('resulting in property being taken');
    }
    
    return parts.join(' ') + '.';
  };

  // Initialize GenAI and voice services
  const initializeServices = () => {
    // Initialize GenAI service
    const validation = configHelpers.validateConfig();
    if (!validation.isValid) {
      setConfigErrors(validation.errors);
      setGenAIStatus('error');
    } else {
      const config = configHelpers.getProviderConfig(validation.activeProvider);
      genAIService.initializeProvider(validation.activeProvider, config);
      genAIService.setProvider(validation.activeProvider);
      setGenAIStatus('ready');
    }

    // Initialize voice service
    if (voiceService.isSupported()) {
      voiceService.setEventHandlers({
        onStart: () => setIsListening(true),
        onEnd: () => setIsListening(false),
        onResult: handleVoiceResult,
        onError: handleVoiceError
      });
    } else {
      setVoiceEnabled(false);
    }
  };

  // Setup voice event handlers
  const setupVoiceHandlers = () => {
    voiceService.setEventHandlers({
      onStart: () => setIsListening(true),
      onEnd: () => setIsListening(false),
      onResult: handleVoiceResult,
      onError: handleVoiceError
    });
  };

  // Handle voice recognition results
  const handleVoiceResult = (result) => {
    if (result.isFinal) {
      setChatInput(result.final);
      setInterimTranscript('');
      handleChatSend(result.final);
    } else {
      setInterimTranscript(result.interim);
    }
  };

  // Handle voice recognition errors
  const handleVoiceError = (error) => {
    console.error('Voice recognition error:', error);
    setIsListening(false);
    setInterimTranscript('');
  };

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Get all field statuses including extracted data
  const getAllFieldStatuses = () => {
    const fields = [
      // Form fields
      { key: 'complainant.name', title: 'Complainant Name', value: firData.complainant.name },
      { key: 'complainant.age', title: 'Complainant Age', value: firData.complainant.age },
      { key: 'complainant.gender', title: 'Complainant Gender', value: firData.complainant.gender },
      { key: 'complainant.address', title: 'Complainant Address', value: firData.complainant.address },
      { key: 'complainant.phone', title: 'Complainant Phone', value: firData.complainant.phone },
      { key: 'incident.date', title: 'Incident Date', value: firData.incident.date },
      { key: 'incident.time', title: 'Incident Time', value: firData.incident.time },
      { key: 'incident.location', title: 'Incident Location', value: firData.incident.location },
      { key: 'incident.description', title: 'Incident Description', value: firData.incident.description },
      { key: 'incident.type', title: 'Incident Type', value: firData.incident.type },
      { key: 'incident.severity', title: 'Incident Severity', value: firData.incident.severity },
      
      // Extracted data fields
      { key: 'extracted.intent', title: 'Intent', value: firData.agentExtractedData.intent?.length > 0 ? firData.agentExtractedData.intent.join(', ') : null },
      { key: 'extracted.method', title: 'Method', value: firData.agentExtractedData.method?.length > 0 ? firData.agentExtractedData.method.join(', ') : null },
      { key: 'extracted.location', title: 'Location', value: firData.agentExtractedData.location?.length > 0 ? firData.agentExtractedData.location.join(', ') : null },
      { key: 'extracted.time', title: 'Time', value: firData.agentExtractedData.time?.length > 0 ? firData.agentExtractedData.time.join(', ') : null },
      { key: 'extracted.victim_context', title: 'Victim Context', value: firData.agentExtractedData.victim_context?.length > 0 ? firData.agentExtractedData.victim_context.join(', ') : null },
      { key: 'extracted.offender_attribute', title: 'Offender Attributes', value: firData.agentExtractedData.offender_attribute?.length > 0 ? firData.agentExtractedData.offender_attribute.join(', ') : null },
      { key: 'extracted.event_condition', title: 'Event Conditions', value: firData.agentExtractedData.event_condition?.length > 0 ? firData.agentExtractedData.event_condition.join(', ') : null }
    ];

    return fields.map(field => ({
      ...field,
      isCompleted: !!field.value,
      isExtracted: field.key.startsWith('extracted.')
    }));
  };

  const handleFieldChange = (section, field, value) => {
    updateFirData({
      [section]: {
        ...firData[section],
        [field]: value
      }
    });
  };

  const handleAgentDataUpdate = (category, values) => {
    updateFirData({
      agentExtractedData: {
        ...firData.agentExtractedData,
        [category]: values
      }
    });
  };

  const handleChatSend = async (input = chatInput) => {
    if (!input.trim()) return;

    const userMessage = {
      id: chatMessages.length + 1,
      type: 'user',
      content: input
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsProcessing(true);
    setGenAIStatus('processing');

    try {
      // Extract structured data using GenAI service
      const conversationHistory = chatMessages.slice(-5); // Last 5 messages for context
      const extractedData = await genAIService.extractStructuredData(input, conversationHistory);
      
      // Update agent extracted data
      Object.keys(extractedData).forEach(category => {
        if (extractedData[category] && extractedData[category].length > 0) {
          handleAgentDataUpdate(category, extractedData[category]);
        }
      });

      // Auto-populate form based on new extracted data
      autoPopulateFormFromData(extractedData, input);

      // Generate AI response
      const aiResponse = await generateAIResponse(input, extractedData);
      
      const aiMessage = {
        id: chatMessages.length + 2,
        type: 'ai',
        content: aiResponse
      };

      setChatMessages(prev => [...prev, aiMessage]);
      setGenAIStatus('ready');

    } catch (error) {
      console.error('Error processing chat:', error);
      setGenAIStatus('error');
      
      const errorMessage = {
        id: chatMessages.length + 2,
        type: 'ai',
        content: 'I apologize, but I encountered an error processing your request. Please try again or check your GenAI configuration.'
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-populate form based on extracted data and user input
  const autoPopulateFormFromData = (extractedData, userInput) => {
    const input = userInput.toLowerCase();
    
    // Extract complainant information
    if (input.includes('name') && input.includes('complainant')) {
      const name = userInput.match(/(?:name|call|am) (?:is )?([a-zA-Z\s]+)/i);
      if (name && !firData.complainant.name) {
        handleFieldChange('complainant', 'name', name[1].trim());
      }
    }
    
    if (input.includes('age') && input.includes('complainant')) {
      const age = userInput.match(/(\d+)/);
      if (age && !firData.complainant.age) {
        handleFieldChange('complainant', 'age', age[1]);
      }
    }
    
    if (input.includes('gender') && input.includes('complainant')) {
      if (input.includes('male') && !firData.complainant.gender) {
        handleFieldChange('complainant', 'gender', 'Male');
      } else if (input.includes('female') && !firData.complainant.gender) {
        handleFieldChange('complainant', 'gender', 'Female');
      }
    }
    
    if (input.includes('address') || input.includes('live')) {
      const address = userInput.replace(/(?:address|live|residing|staying)/gi, '').trim();
      if (address.length > 5 && !firData.complainant.address) {
        handleFieldChange('complainant', 'address', address);
      }
    }
    
    if (input.includes('phone') || input.includes('number') || input.includes('contact')) {
      const phone = userInput.match(/(\d{10,})/);
      if (phone && !firData.complainant.phone) {
        handleFieldChange('complainant', 'phone', phone[1]);
      }
    }
    
    // Extract incident information
    if (input.includes('incident') || input.includes('happened') || input.includes('occurred')) {
      if (input.includes('date') || input.includes('when')) {
        const date = userInput.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
        if (date && !firData.incident.date) {
          handleFieldChange('incident', 'date', date[1]);
        }
      }
    }
    
    if (input.includes('time') || input.includes('hour')) {
      const time = userInput.match(/(\d{1,2}:\d{2})/);
      if (time && !firData.incident.time) {
        handleFieldChange('incident', 'time', time[1]);
      }
    }
    
    if (input.includes('where') || input.includes('location') || input.includes('place')) {
      const location = userInput.replace(/(?:where|location|place|occurred|happened)/gi, '').trim();
      if (location.length > 3 && !firData.incident.location) {
        handleFieldChange('incident', 'location', location);
      }
    }
    
    if (input.includes('describe') || input.includes('what happened') || input.includes('details')) {
      const description = userInput.replace(/(?:describe|what happened|details|tell me about)/gi, '').trim();
      if (description.length > 10 && !firData.incident.description) {
        handleFieldChange('incident', 'description', description);
      }
    }

    // Auto-populate based on extracted data
    if (extractedData.intent?.includes('dishonest_intent_to_take') && !firData.incident.type) {
      handleFieldChange('incident', 'type', 'Theft');
    }
    
    if (extractedData.location?.length > 0 && !firData.incident.location) {
      const location = extractedData.location.join(', ');
      handleFieldChange('incident', 'location', location);
    }
    
    if (extractedData.time?.length > 0 && !firData.incident.time) {
      const time = extractedData.time.includes('night_time') ? 'Night time' : 'Day time';
      handleFieldChange('incident', 'time', time);
    }
    
    // Update severity based on new data
    const severity = determineSeverity(extractedData);
    if (severity !== firData.incident.severity) {
      handleFieldChange('incident', 'severity', severity);
    }
  };

  const generateAIResponse = async (userInput, extractedData) => {
    // Simple form filling logic (can be enhanced with GenAI)
    const input = userInput.toLowerCase();
    
    if (input.includes('name') && input.includes('complainant')) {
      const name = userInput.match(/(?:name|call|am) (?:is )?([a-zA-Z\s]+)/i);
      if (name) {
        handleFieldChange('complainant', 'name', name[1].trim());
        return `I've updated the complainant name to "${name[1].trim()}". What's the complainant's age?`;
      }
    }
    
    if (input.includes('age') && input.includes('complainant')) {
      const age = userInput.match(/(\d+)/);
      if (age) {
        handleFieldChange('complainant', 'age', age[1]);
        return `I've updated the complainant age to ${age[1]}. What's the complainant's gender?`;
      }
    }
    
    if (input.includes('gender') && input.includes('complainant')) {
      if (input.includes('male')) {
        handleFieldChange('complainant', 'gender', 'Male');
        return 'I\'ve updated the complainant gender to Male. What\'s the complainant\'s address?';
      } else if (input.includes('female')) {
        handleFieldChange('complainant', 'gender', 'Female');
        return "I've updated the complainant gender to Female. What's the complainant's address?";
      }
    }
    
    if (input.includes('address') || input.includes('live')) {
      const address = userInput.replace(/(?:address|live|residing|staying)/gi, '').trim();
      if (address.length > 5) {
        handleFieldChange('complainant', 'address', address);
        return `I've updated the complainant address. What's the complainant's phone number?`;
      }
    }
    
    if (input.includes('phone') || input.includes('number') || input.includes('contact')) {
      const phone = userInput.match(/(\d{10,})/);
      if (phone) {
        handleFieldChange('complainant', 'phone', phone[1]);
        return `I've updated the complainant phone number. When did the incident occur?`;
      }
    }
    
    if (input.includes('incident') || input.includes('happened') || input.includes('occurred')) {
      if (input.includes('date') || input.includes('when')) {
        const date = userInput.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
        if (date) {
          handleFieldChange('incident', 'date', date[1]);
          return `I've updated the incident date. What time did it occur?`;
        }
      }
    }
    
    if (input.includes('time') || input.includes('hour')) {
      const time = userInput.match(/(\d{1,2}:\d{2})/);
      if (time) {
        handleFieldChange('incident', 'time', time[1]);
        return `I've updated the incident time. Where did the incident occur?`;
      }
    }
    
    if (input.includes('where') || input.includes('location') || input.includes('place')) {
      const location = userInput.replace(/(?:where|location|place|occurred|happened)/gi, '').trim();
      if (location.length > 3) {
        handleFieldChange('incident', 'location', location);
        return `I've updated the incident location. Can you describe what happened?`;
      }
    }
    
    if (input.includes('describe') || input.includes('what happened') || input.includes('details')) {
      const description = userInput.replace(/(?:describe|what happened|details|tell me about)/gi, '').trim();
      if (description.length > 10) {
        handleFieldChange('incident', 'description', description);
        return `I've updated the incident description. What type of incident was this? (e.g., theft, assault, fraud)`;
      }
    }

    // If no specific form filling, provide general response
    const dataPoints = Object.values(extractedData).flat().length;
    if (dataPoints > 0) {
      return `I've extracted ${dataPoints} data points from your description and auto-populated the form. Please provide more specific details so I can help you complete the remaining fields.`;
    }
    
    return "I understand. Please provide more specific details so I can help you fill out the form correctly and extract relevant information. You can tell me about the complainant's information, incident details, or ask me to help with any specific field.";
  };

  // Voice input handlers
  const handleVoiceToggle = () => {
    if (isListening) {
      voiceService.stopListening();
    } else {
      voiceService.startListening();
    }
  };

  const allFields = getAllFieldStatuses();

  return (
    <Grid container spacing={4}>
      {/* Column 1: Field Status List */}
      <Grid item xs={12} md={3}>
        <Paper elevation={2} sx={{ p: 2, height: '70vh', overflow: 'auto', borderRadius: 3, boxShadow: 2, background: '#fff', '::-webkit-scrollbar': { width: 8, background: '#f0f0f0' }, '::-webkit-scrollbar-thumb': { background: '#bdbdbd', borderRadius: 4 } }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Psychology sx={{ mr: 1, color: 'primary.main' }} />
            Field Status
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <List dense>
            {allFields.map((field, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {field.isCompleted ? (
                    <CheckCircle sx={{ color: 'green', fontSize: 20 }} />
                  ) : (
                    <Cancel sx={{ color: 'red', fontSize: 20 }} />
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={field.title}
                  secondary={field.isCompleted ? field.value : 'Not filled'}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: field.isCompleted ? 'bold' : 'normal',
                      color: field.isCompleted ? 'text.primary' : 'text.secondary'
                    },
                    '& .MuiListItemText-secondary': {
                      fontSize: '0.75rem',
                      color: field.isCompleted ? 'success.main' : 'text.disabled'
                    }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>

      {/* Column 2: FIR Form */}
      <Grid item xs={12} md={4}>
        <Paper elevation={2} sx={{ p: 2, height: '70vh', overflow: 'auto', borderRadius: 3, boxShadow: 2, background: '#fff', '::-webkit-scrollbar': { width: 8, background: '#f0f0f0' }, '::-webkit-scrollbar-thumb': { background: '#bdbdbd', borderRadius: 4 } }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Person sx={{ mr: 1 }} />
            FIR Form (Auto-populated)
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            {/* Complainant Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Complainant Details
              </Typography>
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Name"
                value={firData.complainant.name}
                onChange={(e) => handleFieldChange('complainant', 'name', e.target.value)}
                size="small"
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Age"
                value={firData.complainant.age}
                onChange={(e) => handleFieldChange('complainant', 'age', e.target.value)}
                size="small"
              />
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Gender</InputLabel>
                <Select
                  value={firData.complainant.gender}
                  onChange={(e) => handleFieldChange('complainant', 'gender', e.target.value)}
                  label="Gender"
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Phone"
                value={firData.complainant.phone}
                onChange={(e) => handleFieldChange('complainant', 'phone', e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone sx={{ fontSize: 16 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={firData.complainant.address}
                onChange={(e) => handleFieldChange('complainant', 'address', e.target.value)}
                size="small"
                multiline
                rows={2}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn sx={{ fontSize: 16 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={firData.complainant.email}
                onChange={(e) => handleFieldChange('complainant', 'email', e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ fontSize: 16 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Incident Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                Incident Details
              </Typography>
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Date"
                value={firData.incident.date}
                onChange={(e) => handleFieldChange('incident', 'date', e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Event sx={{ fontSize: 16 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Time"
                value={firData.incident.time}
                onChange={(e) => handleFieldChange('incident', 'time', e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccessTime sx={{ fontSize: 16 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={firData.incident.location}
                onChange={(e) => handleFieldChange('incident', 'location', e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn sx={{ fontSize: 16 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={firData.incident.description}
                onChange={(e) => handleFieldChange('incident', 'description', e.target.value)}
                size="small"
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={firData.incident.type}
                  onChange={(e) => handleFieldChange('incident', 'type', e.target.value)}
                  label="Type"
                >
                  <MenuItem value="Theft">Theft</MenuItem>
                  <MenuItem value="Assault">Assault</MenuItem>
                  <MenuItem value="Fraud">Fraud</MenuItem>
                  <MenuItem value="Burglary">Burglary</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Severity</InputLabel>
                <Select
                  value={firData.incident.severity}
                  onChange={(e) => handleFieldChange('incident', 'severity', e.target.value)}
                  label="Severity"
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Column 3: AI Chat Interface with Voice */}
      <Grid item xs={12} md={5}>
        <Paper elevation={2} sx={{ p: 2, height: '70vh', overflow: 'auto', borderRadius: 3, boxShadow: 2, background: '#fff', '::-webkit-scrollbar': { width: 8, background: '#f0f0f0' }, '::-webkit-scrollbar-thumb': { background: '#bdbdbd', borderRadius: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <SmartToy sx={{ mr: 1 }} />
              GenAI Agent Chat
            </Typography>
            
            {/* Voice Controls */}
            {voiceService.isSupported() && (
              <FormControlLabel
                control={
                  <Switch
                    checked={voiceEnabled}
                    onChange={(e) => setVoiceEnabled(e.target.checked)}
                    size="small"
                  />
                }
                label="Voice"
              />
            )}
          </Box>
          
          <Divider sx={{ mb: 2 }} />

          {/* GenAI Status */}
          {configErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <AlertTitle>GenAI Configuration Error</AlertTitle>
              {configErrors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </Alert>
          )}

          {/* Chat Messages */}
          <Box sx={{ flexGrow: 1, mb: 2, background: '#f7f9fb', borderRadius: 2, p: 1 }}>
            {chatMessages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1
                }}
              >
                <Paper
                  sx={{
                    p: 1.5,
                    maxWidth: '80%',
                    backgroundColor: message.type === 'user' ? 'primary.main' : '#fff',
                    color: message.type === 'user' ? 'white' : 'text.primary',
                    borderRadius: 2,
                    boxShadow: 1,
                    mb: 1
                  }}
                >
                  <Typography variant="body2">
                    {message.content}
                  </Typography>
                </Paper>
              </Box>
            ))}
            
            {/* Interim transcript */}
            {interimTranscript && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <Paper sx={{ p: 1.5, maxWidth: '80%', backgroundColor: 'primary.light', color: 'white', borderRadius: 2, boxShadow: 1, mb: 1 }}>
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    {interimTranscript}
                  </Typography>
                </Paper>
              </Box>
            )}
            
            <div ref={chatEndRef} />
          </Box>

          {/* Chat Input with Voice */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Describe the incident..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
              size="small"
              disabled={isProcessing}
            />
            
            {/* Voice Button */}
            {voiceEnabled && voiceService.isSupported() && (
              <Tooltip title={isListening ? "Stop listening" : "Start voice input"}>
                <IconButton
                  onClick={handleVoiceToggle}
                  color={isListening ? "error" : "primary"}
                  disabled={isProcessing}
                >
                  {isListening ? <MicOff /> : <Mic />}
                </IconButton>
              </Tooltip>
            )}
            
            {/* Send Button */}
            <IconButton
              onClick={() => handleChatSend()}
              color="primary"
              disabled={!chatInput.trim() || isProcessing}
            >
              {isProcessing ? <CircularProgress size={20} /> : <Send />}
            </IconButton>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default FIRForm; 