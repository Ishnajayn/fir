import React, { useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  AlertTitle,
  Stack,
  Container
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Visibility,
  Person,
  LocationOn,
  Security,
  Psychology,
  SmartToy,
  ExpandMore,
  CheckCircle,
  Warning,
  AccessTime,
  PersonOff,
  Gavel,
  Article,
  TrendingUp
} from '@mui/icons-material';

const renderExtractedDataChips = (extracted) => (
  <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mt: 1, mb: 1 }}>
    {Object.entries(extracted).map(([key, values]) =>
      Array.isArray(values) && values.length > 0 ? (
        <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ fontWeight: 600, mr: 0.5, color: 'text.secondary' }}>{key.replace(/_/g, ' ')}:</Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {values.map((v, i) => (
              <Chip key={i} label={v} size="small" color="default" />
            ))}
          </Stack>
        </Box>
      ) : null
    )}
  </Stack>
);

const FormPreview = ({ firData, updateFirData }) => {
  const [editData, setEditData] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogSection, setDialogSection] = useState('');

  const handleEdit = (section) => {
    setEditData(firData[section] || {});
    setDialogSection(section);
    setOpenDialog(true);
  };

  const handleSave = () => {
    updateFirData({
      [dialogSection]: editData
    });
    setOpenDialog(false);
    setEditData({});
  };

  const handleCancel = () => {
    setOpenDialog(false);
    setEditData({});
  };

  const getCompletionPercentage = () => {
    const requiredFields = [
      'complainant.name', 'complainant.age', 'complainant.gender', 'complainant.address', 'complainant.phone',
      'incident.date', 'incident.time', 'incident.location', 'incident.description', 'incident.type'
    ];
    
    const completed = requiredFields.filter(field => {
      const [section, key] = field.split('.');
      return firData[section] && firData[section][key];
    });
    
    return Math.round((completed.length / requiredFields.length) * 100);
  };

  const getAgentDataStats = () => {
    const stats = {};
    Object.entries(firData.agentExtractedData || {}).forEach(([category, values]) => {
      stats[category] = Array.isArray(values) ? values.length : 0;
    });
    return stats;
  };

  // Legal analysis based on extracted data
  const generateLegalAnalysis = () => {
    const analysis = {
      applicableSections: [],
      reasoning: [],
      recommendations: []
    };

    const { agentExtractedData } = firData;

    // Analyze intent
    if (agentExtractedData.intent?.includes('dishonest_intent_to_take')) {
      analysis.applicableSections.push('Section 378 - Theft');
      analysis.reasoning.push('Dishonest intention to take property establishes the mens rea required for theft');
    }

    // Analyze method
    if (agentExtractedData.method?.includes('unauthorized_entry')) {
      analysis.applicableSections.push('Section 451 - House-trespass');
      analysis.reasoning.push('Unauthorized entry into a dwelling constitutes house-trespass');
    }

    if (agentExtractedData.method?.includes('without_consent')) {
      analysis.applicableSections.push('Section 425 - Mischief');
      analysis.reasoning.push('Entry without consent violates property rights');
    }

    // Analyze location
    if (agentExtractedData.location?.includes('house') || agentExtractedData.location?.includes('residence')) {
      analysis.applicableSections.push('Section 380 - Theft in dwelling house');
    }

    // Analyze time
    if (agentExtractedData.time?.includes('night_time') || agentExtractedData.time?.includes('sunset_to_sunrise')) {
      analysis.applicableSections.push('Section 380 - Theft in dwelling house');
    }

    // Analyze victim context
    if (agentExtractedData.victim_context?.includes('house_owner')) {
      analysis.reasoning.push('Victim is the lawful owner, establishing clear property rights');
    }

    // Analyze offender attributes
    if (agentExtractedData.offender_attribute?.includes('repeat_offender')) {
      analysis.applicableSections.push('Section 75 - Enhanced punishment for repeat offenders');
      analysis.reasoning.push('Repeat offender status warrants enhanced punishment');
    }

    // Analyze event conditions
    if (agentExtractedData.event_condition?.includes('property_taken')) {
      analysis.reasoning.push('Property was actually taken, completing the actus reus');
    }

    if (agentExtractedData.event_condition?.includes('property_known_to_be_stolen')) {
      analysis.applicableSections.push('Section 411 - Dishonestly receiving stolen property');
      analysis.reasoning.push('Knowledge of stolen property status adds to criminal liability');
    }

    // Determine severity
    const sectionCount = analysis.applicableSections.length;
    if (sectionCount >= 4) {
      analysis.recommendations.push('Consider non-bailable offense');
      analysis.recommendations.push('Immediate investigation required');
    } else if (sectionCount >= 2) {
      analysis.recommendations.push('Standard investigation procedures');
    } else {
      analysis.recommendations.push('Basic investigation sufficient');
    }

    return analysis;
  };

  const agentDataStats = getAgentDataStats();
  const completionPercentage = getCompletionPercentage();
  const legalAnalysis = generateLegalAnalysis();

  // Use agentExtractedData and offenceClassification from firData
  const extracted = firData.agentExtractedData || {};
  const offenceClassification = firData.offenceClassification || {};

  return (
    <Box sx={{ width: '100%', px: { xs: 2, md: 6 }, py: 4, background: '#f7f9fb', minHeight: '100vh' }}>
      {/* Offence Classification Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center' }}>
          <Warning sx={{ mr: 1, color: 'error.main', fontSize: 32 }} />
          Offence Classification
        </Typography>
        <Divider sx={{ mb: 4 }} />
        {offenceClassification.offence_determination && offenceClassification.offence_determination.is_offence ? (
          <Grid container spacing={4} wrap="wrap">
            {offenceClassification.offence_determination.offences.map((off, idx) => (
              <Grid item xs={12} sm={6} md={4} key={off.offence_id} sx={{ display: 'flex' }}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 3, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 1, wordBreak: 'break-word' }}>{`IPC Section ${off.ipc_section}`}</Typography>
                    <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 500, mb: 1, wordBreak: 'break-word' }}>{off.legal_nature}</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, wordBreak: 'break-word' }}>{off.description}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, wordBreak: 'break-word' }}>{off.reasoning}</Typography>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block' }}>Extracted Data</Typography>
                      {renderExtractedDataChips(extracted)}
                    </Box>
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
                    <Chip label={off.cognizable ? 'Cognizable' : 'Non-cognizable'} size="small" color={off.cognizable ? 'success' : 'default'} />
                    <Chip label={off.compoundable ? 'Compoundable' : 'Non-compoundable'} size="small" color={off.compoundable ? 'info' : 'default'} />
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No offences classified yet.
          </Typography>
        )}
      </Box>

      {/* Extracted Data Section */}
      <Box sx={{ p: { xs: 2, md: 4 }, background: '#fff', borderRadius: 2, boxShadow: 1, maxWidth: '100%' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center' }}>
          <SmartToy sx={{ mr: 1, color: 'primary.main', fontSize: 32 }} />
          Extracted Data
        </Typography>
        <Divider sx={{ mb: 4 }} />
        {Object.entries(extracted).length === 0 ? (
          <Typography variant="body2" color="text.secondary">No extracted data available.</Typography>
        ) : (
          <Stack spacing={3}>
            {Object.entries(extracted).map(([key, values]) =>
              Array.isArray(values) && values.length > 0 ? (
                <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle1" sx={{ minWidth: 140, fontWeight: 600, color: 'text.secondary' }}>{key.replace(/_/g, ' ')}:</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {values.map((v, i) => (
                      <Chip key={i} label={v} size="small" color="default" />
                    ))}
                  </Stack>
                </Box>
              ) : null
            )}
          </Stack>
        )}
      </Box>

      {/* Form Completion Overview */}
      <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Visibility sx={{ mr: 2 }} />
          FIR Form Preview & Analysis
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircle sx={{ mr: 1, color: 'green' }} />
                  Form Completion
                </Typography>
                <Typography variant="h3" color="primary" gutterBottom>
                  {completionPercentage}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {completionPercentage === 100 ? 'All required fields completed!' : 'Required fields remaining'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Psychology sx={{ mr: 1, color: 'secondary.main' }} />
                  Agent Data Extraction
                </Typography>
                <Typography variant="h3" color="secondary" gutterBottom>
                  {Object.values(agentDataStats).reduce((sum, count) => sum + count, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Structured data points extracted by GenAI
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Legal Analysis Section */}
      <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Gavel sx={{ mr: 1 }} />
          GenAI Legal Analysis & Section Justification
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={3}>
          {/* Applicable Sections */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="Applicable Legal Sections"
                avatar={<Article />}
              />
              <CardContent>
                {legalAnalysis.applicableSections.length > 0 ? (
                  <List dense>
                    {legalAnalysis.applicableSections.map((section, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Warning color="error" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={section}
                          secondary="Applicable based on extracted evidence"
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No specific sections identified yet. Continue conversation with GenAI agent for analysis.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Legal Reasoning */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="Legal Justification"
                avatar={<Psychology />}
              />
              <CardContent>
                {legalAnalysis.reasoning.length > 0 ? (
                  <List dense>
                    {legalAnalysis.reasoning.map((reason, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={reason}
                          secondary="Justified by extracted data"
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No legal reasoning available yet. Continue conversation with GenAI agent.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recommendations */}
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="Investigation Recommendations"
                avatar={<TrendingUp />}
              />
              <CardContent>
                {legalAnalysis.recommendations.length > 0 ? (
                  <List dense>
                    {legalAnalysis.recommendations.map((rec, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircle color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={rec} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No recommendations available yet. Continue conversation with GenAI agent.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCancel} maxWidth="md" fullWidth>
        <DialogTitle>
          Edit {dialogSection.charAt(0).toUpperCase() + dialogSection.slice(1)} Details
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {dialogSection === 'complainant' && (
              <>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={editData.name || ''}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Age"
                    value={editData.age || ''}
                    onChange={(e) => setEditData({ ...editData, age: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={editData.gender || ''}
                      onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
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
                    value={editData.phone || ''}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={editData.address || ''}
                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={editData.email || ''}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  />
                </Grid>
              </>
            )}
            
            {dialogSection === 'incident' && (
              <>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Date"
                    value={editData.date || ''}
                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Time"
                    value={editData.time || ''}
                    onChange={(e) => setEditData({ ...editData, time: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={editData.location || ''}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={editData.type || ''}
                      onChange={(e) => setEditData({ ...editData, type: e.target.value })}
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
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={editData.description || ''}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    multiline
                    rows={3}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} startIcon={<Cancel />}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" startIcon={<Save />}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FormPreview; 