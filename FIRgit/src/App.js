import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Tabs,
  Tab,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import { Security, Description, Visibility } from '@mui/icons-material';
import FIRForm from './components/FIRForm';
import FormPreview from './components/FormPreview';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const initialFirData = {
  complainant: {
    name: '',
    age: '',
    gender: '',
    address: '',
    phone: '',
    email: ''
  },
  incident: {
    date: '',
    time: '',
    location: '',
    description: '',
    type: ''
  },
  agentExtractedData: {
    intent: ["dishonest_intent_to_take"],
    method: ["unauthorized_entry", "without_consent"],
    location: ["house", "residence", "public_road"],
    time: ["night_time", "sunset_to_sunrise"],
    victim_context: ["house_owner", "individual"],
    offender_attribute: ["repeat_offender"],
    event_condition: ["property_taken", "property_known_to_be_stolen"]
  },
  offenceClassification: {
    offence_determination: {
      is_offence: true,
      offences: [
        {
          offence_id: "O1",
          ipc_section: "379",
          description: "Theft of inverter and livestock",
          legal_nature: "theft",
          cognizable: true,
          compoundable: true,
          linked_event_ids: ["E2", "E3", "E7"],
          reasoning: "An inverter, cow, and goat were discovered missing the morning after witnesses reported suspicious nighttime activity, including an open gate and unknown persons near the property. Rinku's prior inquiry about the inverter (E3) and his criminal history support motive. These facts satisfy the definition of theft under IPC Section 379 (now BNS Section 303)."
        },
        {
          offence_id: "O2",
          ipc_section: "457",
          description: "Lurking house-trespass by night in order to commit theft",
          legal_nature: "house trespass at night",
          cognizable: true,
          compoundable: false,
          linked_event_ids: ["E1", "E8", "E9"],
          reasoning: "Golu and Sharda witnessed individuals lurking near the premises at night. Deepak also reported suspicious sounds. These accounts suggest unlawful entry into premises at night to commit theft, which falls under IPC 457 (now BNS 330(2))."
        },
        {
          offence_id: "O3",
          ipc_section: "411",
          description: "Dishonestly receiving stolen property",
          legal_nature: "possession of stolen goods",
          cognizable: true,
          compoundable: true,
          linked_event_ids: ["E5", "E6"],
          reasoning: "Chunni Yadav was found in possession of an inverter similar to the stolen one (E5) and failed to produce any purchase proof (E6). This suggests a violation under IPC 411 (now BNS 324) for dishonest possession of stolen property."
        }
      ]
    }
  }
};

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [firData, setFirData] = useState(initialFirData);
  const [tab, setTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const updateFirData = (update) => {
    setFirData((prev) => ({ ...prev, ...update }));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', background: '#f7f9fb', px: { xs: 1, md: 6 }, pt: 2, pb: 4 }}>
        <Box sx={{ position: 'sticky', top: 0, zIndex: 10, background: '#f7f9fb', pb: 2 }}>
          <AppBar position="static">
            <Toolbar>
              <Security sx={{ mr: 2 }} />
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                FIR Application - First Information Report
              </Typography>
            </Toolbar>
          </AppBar>
        </Box>
        <Paper elevation={3} sx={{ mb: 3 }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            aria-label="FIR application tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              icon={<Description />} 
              label="FIR Form & Chat" 
              iconPosition="start"
            />
            <Tab 
              icon={<Visibility />} 
              label="Preview" 
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        <TabPanel value={tab} index={0}>
          <FIRForm firData={firData} updateFirData={updateFirData} />
        </TabPanel>
        
        <TabPanel value={tab} index={1}>
          <FormPreview firData={firData} updateFirData={updateFirData} />
        </TabPanel>
      </Box>
    </ThemeProvider>
  );
}

export default App; 