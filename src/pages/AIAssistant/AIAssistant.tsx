import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  ExpandMore,
  Help,
  School,
  Computer,
  Keyboard
} from '@mui/icons-material';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  category?: string;
}

interface KnowledgeBase {
  [key: string]: {
    keywords: string[];
    answer: string;
    category: string;
  };
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m your Information Processing & Typewriting AI Assistant. I can help you with questions about computer care, typing techniques, business document formatting, and all aspects of the National Certificate in Secretarial Studies curriculum. What would you like to know?',
      role: 'assistant',
      timestamp: new Date(),
      category: 'welcome'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Comprehensive knowledge base for the syllabus
  const knowledgeBase: KnowledgeBase = {
    computerCare: {
      keywords: ['computer care', 'handle computer', 'clean computer', 'maintain computer', 'computer safety'],
      answer: `COMPUTER CARE GUIDELINES:

1. PHYSICAL HANDLING:
   • Always use clean, dry hands when handling equipment
   • Avoid touching screens or sensitive components directly
   • Lift equipment with both hands, never by cables or screens
   • Support laptop base when carrying, not the screen

2. CLEANING PROCEDURES:
   • Use soft, lint-free cloths for cleaning
   • Use appropriate screen cleaners (alcohol-free)
   • Clean keyboard with compressed air or soft brush
   • Avoid liquids near electrical components

3. ENVIRONMENTAL PROTECTION:
   • Keep computers away from direct sunlight and heat sources
   • Maintain room temperature between 18-24°C
   • Ensure proper ventilation around equipment
   • Protect from dust, moisture, and magnetic fields

4. DAILY MAINTENANCE:
   • Check cable connections regularly
   • Keep air vents clear of obstructions
   • Shut down properly before moving equipment
   • Report any unusual sounds, smells, or behaviors immediately`,
      category: 'Computer Care'
    },

    homeRowTyping: {
      keywords: ['home row', 'asdf', 'jkl', 'finger placement', 'typing position', 'home keys'],
      answer: `HOME ROW TYPING TECHNIQUE:

1. FINGER PLACEMENT:
   • Left hand: A(pinky), S(ring), D(middle), F(index)
   • Right hand: J(index), K(middle), L(ring), ;(pinky)
   • Thumbs rest on the space bar

2. PROPER POSTURE:
   • Sit up straight with feet flat on floor
   • Wrists straight and hovering over keyboard
   • Fingers curved naturally over home row keys
   • Eyes on the text, not the keyboard

3. TECHNIQUE TIPS:
   • Start slowly with accuracy over speed
   • Use proper finger for each key
   • Return fingers to home row after each keystroke
   • Practice daily for muscle memory development

4. COMMON MISTAKES TO AVOID:
   • Don't look at the keyboard while typing
   • Avoid using wrong fingers for keys
   • Don't rest wrists on desk while typing
   • Don't tense up shoulders or arms`,
      category: 'Keyboard Mastery'
    },

    businessLetters: {
      keywords: ['business letter', 'letter format', 'formal letter', 'correspondence', 'letter layout'],
      answer: `BUSINESS LETTER FORMAT:

1. LETTER STRUCTURE:
   • Sender's address (letterhead or top right)
   • Date (below sender's address)
   • Recipient's address (left margin)
   • Salutation (Dear Sir/Madam, Dear Mr./Ms.)
   • Body paragraphs with clear spacing
   • Complimentary close (Yours sincerely/faithfully)
   • Signature and typed name

2. FORMATTING STANDARDS:
   • Use consistent margins (2.5cm all around)
   • Single spacing within paragraphs
   • Double spacing between paragraphs
   • Professional font (Times New Roman, Arial)
   • Font size 11-12 points

3. TONE AND STYLE:
   • Formal and professional language
   • Clear and concise sentences
   • Proper grammar and spelling
   • Courteous and respectful tone

4. COMMON LETTER TYPES:
   • Enquiry letters
   • Order letters  
   • Complaint letters
   • Application letters
   • Acknowledgment letters`,
      category: 'Business Documents'
    },

    memorandum: {
      keywords: ['memo', 'memorandum', 'internal communication', 'memo format'],
      answer: `MEMORANDUM FORMAT:

1. MEMO HEADING:
   • MEMORANDUM (centered, bold)
   • TO: (recipient name and title)
   • FROM: (sender name and title)
   • DATE: (full date)
   • SUBJECT: (brief, descriptive subject line)

2. FORMATTING RULES:
   • Use consistent spacing and alignment
   • Keep subject line concise but informative
   • Single space within paragraphs
   • Double space between sections
   • No salutation or complimentary close needed

3. CONTENT STRUCTURE:
   • Opening paragraph: purpose and context
   • Body paragraphs: detailed information
   • Closing paragraph: action required or summary
   • Attachments noted if applicable

4. PROFESSIONAL STANDARDS:
   • Clear, direct communication
   • Logical organization of information
   • Professional tone throughout
   • Proofread for accuracy`,
      category: 'Business Documents'
    },

    systemPower: {
      keywords: ['startup', 'shutdown', 'power on', 'power off', 'boot up', 'turn on computer'],
      answer: `SYSTEM POWER MANAGEMENT:

1. PROPER STARTUP SEQUENCE:
   • Check all cable connections are secure
   • Turn on peripherals first (monitor, printer, speakers)
   • Press power button on system unit
   • Wait for POST (Power-On Self-Test) completion
   • Allow operating system to fully load
   • Enter login credentials if required

2. SAFE SHUTDOWN PROCEDURE:
   • Save all open documents and close applications
   • Click Start menu → Shutdown/Power Off
   • Select "Shut down" option from menu
   • Wait for "Safe to turn off" message
   • Turn off monitor and peripherals
   • Turn off power strips or UPS if used

3. RESTART PROCEDURES:
   • Use Restart option for system updates
   • Allow complete shutdown before restart begins
   • Don't interrupt the restart process
   • Wait for complete system reload

4. TROUBLESHOOTING:
   • If system won't start, check power connections
   • If shutdown fails, wait and try again
   • Use Task Manager to close unresponsive programs
   • Contact IT support for persistent problems`,
      category: 'Computer Operations'
    },

    typingSpeed: {
      keywords: ['typing speed', 'wpm', 'words per minute', 'speed building', 'fast typing'],
      answer: `TYPING SPEED DEVELOPMENT:

1. SPEED BUILDING STRATEGIES:
   • Focus on accuracy first, speed follows naturally
   • Practice regularly for short periods (15-20 minutes)
   • Use proper finger technique consistently
   • Gradually increase speed while maintaining accuracy

2. SYLLABUS REQUIREMENTS:
   • Part I target: 25 WPM with 95% accuracy
   • Part II target: 35 WPM with 95% accuracy
   • Professional standard: 40+ WPM

3. PRACTICE TECHNIQUES:
   • Start with home row keys only
   • Progress to full alphabet combinations
   • Practice common letter combinations
   • Use business document content for practice

4. MONITORING PROGRESS:
   • Track both speed and accuracy metrics
   • Identify problem keys or combinations
   • Focus extra practice on weak areas
   • Set realistic daily improvement goals

5. COMMON SPEED BARRIERS:
   • Looking at keyboard while typing
   • Using incorrect finger placement
   • Tensing up during speed tests
   • Trying to go too fast too soon`,
      category: 'Speed Development'
    },

    printerSetup: {
      keywords: ['printer', 'print', 'paper jam', 'ink cartridge', 'toner', 'printer setup'],
      answer: `PRINTER SETUP & OPERATION:

1. PAPER LOADING:
   • Check paper tray capacity limits
   • Adjust paper guides to correct paper size
   • Load paper with print side facing down (usually)
   • Fan paper before loading to prevent jams
   • Don't overfill the paper tray

2. CARTRIDGE INSTALLATION:
   INK CARTRIDGES:
   • Turn off printer before installation
   • Remove all protective tape and packaging
   • Insert cartridge until it clicks securely
   • Run printer alignment procedure
   • Print test page to verify installation

   TONER CARTRIDGES:
   • Wear gloves to avoid toner contact
   • Remove all packing materials carefully
   • Shake gently 5-6 times as instructed
   • Install firmly ensuring proper seating
   • Reset chip counter if required

3. TROUBLESHOOTING COMMON ISSUES:
   • Paper jams: Turn off, remove paper carefully
   • Poor quality: Clean print heads or replace cartridge
   • No printing: Check connections and drivers
   • Streaked output: Replace or clean cartridge

4. MAINTENANCE:
   • Regular cleaning of print heads
   • Keep spare cartridges in cool, dry place
   • Monitor ink/toner levels regularly
   • Clean paper path periodically`,
      category: 'Printer Operations'
    },

    fileManagement: {
      keywords: ['file', 'folder', 'save', 'organize files', 'backup', 'storage'],
      answer: `FILE MANAGEMENT & STORAGE:

1. FILE ORGANIZATION:
   • Create logical folder structures
   • Use descriptive file names with dates
   • Maintain consistent naming conventions
   • Organize by project, date, or document type

2. BACKUP STRATEGIES:
   • Follow 3-2-1 rule: 3 copies, 2 different media, 1 offsite
   • Schedule regular automatic backups
   • Test restore procedures periodically
   • Keep backups in secure locations

3. STORAGE MEDIA CARE:
   USB DRIVES:
   • Store in protective cases
   • Safely eject before removal
   • Avoid extreme temperatures
   • Regular virus scanning

   EXTERNAL DRIVES:
   • Handle carefully - sensitive to shock
   • Store upright when not in use
   • Regular health checks
   • Proper ventilation during use

4. SECURITY MEASURES:
   • Password protect sensitive documents
   • Use encryption for confidential data
   • Control access permissions appropriately
   • Secure disposal of old storage media`,
      category: 'Storage Management'
    }
  };

  const quickQuestions = [
    "How do I properly clean my computer screen?",
    "What's the correct finger placement for home row typing?",
    "How do I format a business letter correctly?",
    "What are the proper computer startup procedures?",
    "How can I improve my typing speed?",
    "How do I load paper in the printer correctly?",
    "What's the difference between a memo and a letter?",
    "How should I organize my computer files?"
  ];

  const findBestAnswer = (question: string): ChatMessage => {
    const questionLower = question.toLowerCase();
    
    // Search through knowledge base
    for (const [, knowledge] of Object.entries(knowledgeBase)) {
      for (const keyword of knowledge.keywords) {
        if (questionLower.includes(keyword.toLowerCase())) {
          return {
            id: Date.now().toString(),
            content: knowledge.answer,
            role: 'assistant',
            timestamp: new Date(),
            category: knowledge.category
          };
        }
      }
    }

    // Default response for unmatched questions
    return {
      id: Date.now().toString(),
      content: `I understand you're asking about "${question}". While I don't have a specific answer for that exact question, I can help with topics related to:

• Computer Care and Maintenance
• Keyboard Mastery and Typing Techniques  
• Business Document Formatting (Letters, Memos, Reports)
• System Operations (Startup, Shutdown, File Management)
• Printer Setup and Troubleshooting
• Speed Development and Accuracy Training

Could you try rephrasing your question or ask about one of these specific topics? For example, you could ask:
- "How do I improve my typing accuracy?"
- "What's the proper way to shut down a computer?"
- "How should I format a business memorandum?"

I'm here to help with your Information Processing and Typewriting studies!`,
      role: 'assistant',
      timestamp: new Date(),
      category: 'General Help'
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = findBestAnswer(inputMessage);
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
          🤖 AI Learning Assistant
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
          Get instant help with Information Processing & Typewriting questions
        </Typography>
      </Box>

      <Box display="flex" gap={2} height="calc(100vh - 200px)" flexDirection={{ xs: 'column', md: 'row' }}>
        {/* Chat Area */}
        <Paper elevation={2} sx={{ flex: 2, display: 'flex', flexDirection: 'column', minHeight: { xs: '400px', md: 'auto' } }}>
          {/* Messages */}
          <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 1.5, md: 2 } }}>
            <List>
              {messages.map((message) => (
                <ListItem key={message.id} sx={{ alignItems: 'flex-start', mb: 1.5, px: 0 }}>
                  <ListItemAvatar>
                    <Avatar 
                      sx={{ 
                        bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                        width: { xs: 32, md: 40 },
                        height: { xs: 32, md: 40 }
                      }}
                    >
                      {message.role === 'user' ? 
                        <Person sx={{ fontSize: { xs: 16, md: 20 } }} /> : 
                        <SmartToy sx={{ fontSize: { xs: 16, md: 20 } }} />
                      }
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="subtitle2" sx={{ fontSize: { xs: '0.85rem', md: '0.95rem' } }}>
                          {message.role === 'user' ? 'You' : 'AI Assistant'}
                        </Typography>
                        {message.category && (
                          <Chip 
                            label={message.category} 
                            size="small" 
                            variant="outlined"
                            color="primary"
                          />
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {message.timestamp.toLocaleTimeString()}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          whiteSpace: 'pre-line',
                          fontFamily: message.role === 'assistant' ? 'monospace' : 'inherit',
                          fontSize: message.role === 'assistant' ? '13px' : 'inherit'
                        }}
                      >
                        {message.content}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
              
              {isLoading && (
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <SmartToy />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="AI Assistant is thinking..."
                    secondary={<CircularProgress size={20} />}
                  />
                </ListItem>
              )}
            </List>
          </Box>

          <Divider />

          {/* Input Area */}
          <Box sx={{ p: 2 }}>
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                multiline
                maxRows={3}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about Information Processing & Typewriting..."
                variant="outlined"
                disabled={isLoading}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                sx={{ minWidth: 'auto', px: 3 }}
              >
                <Send />
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Quick Help Panel */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3, height: '100%', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              📚 Quick Questions
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Click on any question to ask the AI assistant:
            </Typography>

            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outlined"
                fullWidth
                sx={{ mb: 1, textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => handleQuickQuestion(question)}
              >
                <Help sx={{ mr: 1, fontSize: 16 }} />
                {question}
              </Button>
            ))}

            <Divider sx={{ my: 3 }} />

            {/* Topic Categories */}
            <Typography variant="h6" gutterBottom>
              🎯 Topic Categories
            </Typography>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Computer sx={{ mr: 1 }} />
                <Typography>Computer Operations</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  • System startup and shutdown<br/>
                  • Hardware and software usage<br/>
                  • File management and storage<br/>
                  • Printer setup and operation<br/>
                  • Troubleshooting and maintenance
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Keyboard sx={{ mr: 1 }} />
                <Typography>Typing & Speed Development</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  • Home row finger placement<br/>
                  • Proper typing technique<br/>
                  • Speed building exercises<br/>
                  • Accuracy improvement<br/>
                  • Common typing mistakes
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <School sx={{ mr: 1 }} />
                <Typography>Business Documents</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  • Business letter formatting<br/>
                  • Memorandum structure<br/>
                  • Report and invoice creation<br/>
                  • Professional presentation<br/>
                  • Document templates and standards
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                💡 <strong>Tip:</strong> Be specific in your questions for better answers. 
                For example: "How do I format the date in a business letter?" rather than "How do I write letters?"
              </Typography>
            </Alert>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default AIAssistant;