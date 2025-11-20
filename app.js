const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Multi-API ondersteuning
let aiClient;
let aiProvider = 'none';
let aiEnabled = false;

// Check welke API beschikbaar is
if (process.env.GROQ_API_KEY) {
  // Gebruik Groq API met werkende models
  aiClient = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
  });
  aiProvider = 'groq';
  aiEnabled = true;
  console.log('✅ Groq API geconfigureerd (GRATIS)');
} 

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');

// Maak benodigde mappen aan
const ensureDirectories = () => {
  const directories = ['uploads', 'reports'];
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

ensureDirectories();

// Multer configuratie
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, Date.now() + '-' + sanitizedName);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.js', '.py', '.java', '.html', '.css', '.php', '.cpp', '.c', '.ts'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error(`Bestandstype ${fileExt} is niet toegestaan`), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// Helper functies
function getErrorMessage(error, language = 'nl') {
  const errorMessages = {
    'NO_FILE': {
      nl: 'Geen bestand geüpload',
      en: 'No file uploaded'
    },
    'FILE_EMPTY': {
      nl: 'Het bestand is leeg',
      en: 'The file is empty'
    },
    'FILE_TOO_LARGE': {
      nl: 'Bestand is te groot (max 5MB)',
      en: 'File is too large (max 5MB)'
    },
    'DEFAULT': {
      nl: 'Er ging iets mis. Probeer het opnieuw.',
      en: 'Something went wrong. Please try again.'
    }
  };

  let key = 'DEFAULT';
  if (error.message === 'NO_FILE') key = 'NO_FILE';
  else if (error.message === 'FILE_EMPTY') key = 'FILE_EMPTY';
  else if (error.message.includes('max 5MB')) key = 'FILE_TOO_LARGE';

  return errorMessages[key][language];
}

function generateMockAnalysis(code, fileName, language, targetLanguage) {
  console.log('🎭 Gebruik mock data - geen AI API beschikbaar');
  
  const isEnglish = language === 'en';
  
  return {
    improvedCode: code,
    feedback: {
      overall: isEnglish 
        ? "This is a demo analysis. Configure Groq API for detailed code reviews."
        : "Dit is een demo analyse. Configureer Groq API voor gedetailleerde code reviews.",
      strengths: [
        isEnglish ? "Code structure is readable" : "Code structuur is leesbaar",
        isEnglish ? "Good variable naming" : "Goede variabele namen"
      ],
      improvements: [
        isEnglish ? "Add error handling" : "Voeg foutafhandeling toe",
        isEnglish ? "Use const instead of let where possible" : "Gebruik const in plaats van let waar mogelijk",
        isEnglish ? "Split large functions into smaller ones" : "Splits grote functies in kleinere"
      ],
      bestPractices: [
        isEnglish ? "Add comments for complex logic" : "Voeg commentaar toe voor complexe logica",
        isEnglish ? "Follow consistent code style" : "Houd consistente code stijl aan",
        isEnglish ? "Use modern language features" : "Gebruik moderne taal features"
      ],
      security: [
        isEnglish ? "Implement input validation" : "Implementeer input validatie"
      ],
      performance: [
        isEnglish ? "Optimize database queries" : "Optimaliseer database queries"
      ]
    },
    statistics: {
      complexity: "medium",
      readability: "7",
      maintainability: "6",
      efficiency: "5"
    },
    analysisTime: "0s",
    aiEnabled: false
  };
}

// Routes
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'AI Code Analyzer',
    language: req.query.lang || 'nl'
  });
});

app.post('/analyze', upload.single('codeFile'), async (req, res) => {
  let filePath;
  
  try {
    if (!req.file) {
      throw new Error('NO_FILE');
    }

    filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const fileName = req.file.originalname;
    const language = req.body.language || 'nl';
    const targetLanguage = req.body.targetLanguage || 'javascript';

    if (fileContent.length === 0) {
      throw new Error('FILE_EMPTY');
    }

    console.log(`🔍 Analyse gestart: ${fileName}`);
    console.log(`🤖 AI Provider: ${aiProvider}`);
    console.log(`📝 Code lengte: ${fileContent.length} karakters`);

    // AI-analyse uitvoeren
    const analysis = await analyzeCodeWithAI(fileContent, fileName, language, targetLanguage);
    
    // Rapport genereren
    const report = {
      id: Date.now(),
      fileName: fileName,
      originalCode: fileContent,
      improvedCode: analysis.improvedCode,
      feedback: analysis.feedback,
      statistics: analysis.statistics,
      timestamp: new Date().toISOString(),
      language: language,
      aiEnabled: analysis.aiEnabled,
      aiProvider: aiProvider
    };

    // Rapport opslaan
    const reportPath = path.join('reports', `report-${report.id}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`✅ Analyse voltooid: ${fileName}`);
    console.log(`🤖 AI gebruikt: ${analysis.aiEnabled}`);

    res.render('results', { 
      report: report,
      language: language
    });

  } catch (error) {
    console.error('❌ Analyse fout:', error.message);
    
    // Cleanup
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const message = getErrorMessage(error, req.body?.language || 'nl');
    res.status(500).render('error', { 
      message: message,
      language: req.body?.language || 'nl',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// VERBETERDE AI Analyse functie met WERKENDE Groq Models
async function analyzeCodeWithAI(code, fileName, language, targetLanguage) {
  const startTime = Date.now();
  
  // Als geen AI beschikbaar is, gebruik mock data
  if (!aiClient || !aiEnabled) {
    return generateMockAnalysis(code, fileName, language, targetLanguage);
  }

  try {
    console.log(`🚀 GEDETAILLEERDE AI analyse gestart met ${aiProvider.toUpperCase()}...`);
    
    // Gebruik WERKENDE Groq models
    let model;
    if (aiProvider === 'groq') {
      // Probeer verschillende werkende Groq models
      const availableModels = [
        'llama-3.1-8b-instant',    // Snel en gratis
        'llama-3.1-70b-versatile', // Krachtig voor code
        'mixtral-8x7b-32768',      // Goed voor code analysis
        'llama3-8b-8192'           // Fallback
      ];
      
      model = availableModels[0]; // Start met het eerste model
      console.log(`🧠 Gebruik model: ${model}`);
    } else {
      model = 'gpt-4';
    }
    
    // EXTRA GEDETAILLEERDE PROMPT voor code reviews
    const isEnglish = language === 'en';
    
    const prompt = `
JE BENT EEN EXPERT CODE REVIEWER EN SENIOR SOFTWARE ENGINEER.

# OPDRACHT:
Analyseer de onderstaande code ULTRA-GEDETAILLEERD en geef CONCRETE, UITVOERBARE verbeteringen.

# BESTANDSINFORMATIE:
- Bestandsnaam: ${fileName}
- Programmeertaal: ${targetLanguage}
- Code lengte: ${code.length} karakters

# TE ANALYSEREN CODE:
\`\`\`${targetLanguage}
${code}
\`\`\`

# ANALYSE CRITERIA (WEES EXTREEM GEDETAILLEERD):

## 1. ALGEMENE CODE KWALITEIT
- Architectuur en structuur
- Leesbaarheid en onderhoudbaarheid  
- Code organisatie en modulariteit
- Consistentie in code style

## 2. PERFORMANCE OPTIMALISATIES
- Algorithmische complexiteit
- Geheugengebruik
- Database queries (indien van toepassing)
- Loops en iteraties

## 3. BEVEILIGING (SECURITY)
- Input validatie en sanitization
- Authentication en authorization
- Data protection
- Kwetsbaarheden en risks

## 4. BEST PRACTICES
- Taal-specifieke conventions
- Design patterns
- Error handling
- Code documentation

## 5. SPECIFIEKE PROBLEMEN
- Bugs en logical errors
- Edge cases
- Potential failures
- Compatibility issues

# GEVRAAGDE OUTPUT FORMAAT (JSON):

{
  "improvedCode": "VOLLEDIGE verbeterde code hier. Toon ALLE wijzigingen duidelijk aan. Gebruik comments om wijzigingen te markeren.",
  "feedback": {
    "overall": "Zeer gedetailleerde samenvatting van 4-5 zinnen die de algemene code kwaliteit beschrijft, belangrijkste issues en aanbevelingen",
    "strengths": ["minimaal 5 specifieke sterke punten met uitleg", "wees concreet en gedetailleerd"],
    "improvements": ["minimaal 8 concrete verbeterpunten", "specificeer exact wat en waar verbeterd moet worden", "geef voorbeelden"],
    "bestPractices": ["minimaal 5 aanbevolen practices", "specifiek voor ${targetLanguage}"],
    "security": ["minimaal 3 security recommendations", "concrete beveiligingsissues en oplossingen"],
    "performance": ["minimaal 3 performance tips", "specifieke optimalisaties"]
  },
  "statistics": {
    "complexity": "zeer_laag/laag/medium/hoog/zeer_hoog",
    "readability": "cijfer 1-10 met uitleg",
    "maintainability": "cijfer 1-10 met uitleg", 
    "efficiency": "cijfer 1-10 met uitleg"
  }
}

# BELANGRIJK:
- WEES EXTREEM GEDETAILLEERD EN SPECIFIEK
- Geef concrete voorbeelden en code snippets
- Toon exact hoe de code verbeterd kan worden
- Benoem regelnummers of specifieke code secties
- Gebruik duidelijke, technische taal
- Focus op actionable recommendations

Antwoord in het ${isEnglish ? 'Engels' : 'Nederlands'}.
`;

    console.log('📝 Verzend gedetailleerde prompt naar AI...');
    
    const completion = await aiClient.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system", 
          content: `Je bent een senior software engineer met 15+ jaar ervaring in code reviews, refactoring, en software architecture. Je geeft altijd ultra-gedetailleerde, technische feedback met concrete voorbeelden. Je antwoordt altijd in het gevraagde JSON formaat en bent extreem specifiek in je analyse.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1, // Zeer laag voor consistente, gedetailleerde output
      max_tokens: 6000, // Meer tokens voor gedetailleerde reviews
      top_p: 0.9
    });

    const response = completion.choices[0].message.content;
    const analysisTime = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
    
    console.log(`✅ ${aiProvider.toUpperCase()} analyse voltooid in`, analysisTime);
    console.log('📊 Response lengte:', response.length, 'karakters');

    let result;
    try {
      // Uitgebreide JSON parsing met error handling
      let cleanResponse = response;
      
      // Verwijder code blocks
      cleanResponse = cleanResponse.replace(/```json\s*/g, '');
      cleanResponse = cleanResponse.replace(/\s*```/g, '');
      cleanResponse = cleanResponse.trim();
      
      // Als er nog niet-JSON tekst voor staat, extraheer JSON
      if (!cleanResponse.startsWith('{')) {
        const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanResponse = jsonMatch[0];
        }
      }
      
      result = JSON.parse(cleanResponse);
      result.analysisTime = analysisTime;
      result.aiEnabled = true;
      
      console.log('✅ GEDETAILLEERDE AI analyse succesvol!');
      console.log('📈 Complexiteit:', result.statistics.complexity);
      console.log('⭐ Leesbaarheid:', result.statistics.readability);
      console.log('🔧 Aantal verbeterpunten:', result.feedback.improvements.length);

    } catch (parseError) {
      console.error('❌ JSON parse fout:', parseError.message);
      console.log('🔄 Gebruik fallback naar mock data');
      result = generateMockAnalysis(code, fileName, language, targetLanguage);
      result.aiEnabled = false;
    }
    
    return result;

  } catch (error) {
    console.error(`❌ ${aiProvider.toUpperCase()} analyse mislukt:`, error.message);
    
    if (error.status === 429) {
      console.log('💸 Rate limit bereikt - wacht even en probeer opnieuw');
    } else if (error.status === 400) {
      console.log('🔧 Model niet beschikbaar - probeer ander model');
      // Hier kunnen we eventueel een fallback model proberen
    }
    
    const result = generateMockAnalysis(code, fileName, language, targetLanguage);
    result.aiEnabled = false;
    return result;
  }
}

// API endpoint voor rapporten
app.get('/reports/:id', (req, res) => {
  try {
    const reportPath = path.join('reports', `report-${req.params.id}.json`);
    
    if (!fs.existsSync(reportPath)) {
      const message = req.query.lang === 'en' 
        ? 'Report not found' 
        : 'Rapport niet gevonden';
      return res.status(404).render('error', {
        message: message,
        language: req.query.lang || 'nl'
      });
    }

    const reportData = fs.readFileSync(reportPath, 'utf8');
    const report = JSON.parse(reportData);
    
    res.render('results', {
      report: report,
      language: req.query.lang || report.language || 'nl'
    });
  } catch (error) {
    console.error('Rapport laad fout:', error);
    const message = req.query.lang === 'en' 
      ? 'Error loading report' 
      : 'Fout bij laden rapport';
    res.status(500).render('error', {
      message: message,
      language: req.query.lang || 'nl',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// 404 handler
app.use((req, res) => {
  const language = req.query.lang || 'nl';
  const message = language === 'nl' ? 'Pagina niet gevonden' : 'Page not found';
  res.status(404).render('error', {
    message: message,
    language: language
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Onverwachte fout:', error);
  const language = req.query.lang || 'nl';
  const message = language === 'nl' ? 'Interne server fout' : 'Internal server error';
  res.status(500).render('error', {
    message: message,
    language: language,
    error: process.env.NODE_ENV === 'development' ? error : {}
  });
});

// Start server
app.listen(port, () => {
  console.log(`\n🚀 AI Code Analyzer draait op http://localhost:${port}`);
  console.log(`📁 Uploads map: ${path.resolve('uploads')}`);
  console.log(`📊 Reports map: ${path.resolve('reports')}`);
  
  if (aiEnabled) {
    console.log(`✅ ${aiProvider.toUpperCase()} API is ACTIEF - GEDETAILLEERDE AI analyse!`);
    console.log('🎉 Je krijgt nu EXTREEM GEDETAILLEERDE code reviews!');
    console.log('🧠 Model: llama-3.1-8b-instant (snel en krachtig)');
  } else {
    console.log('❌ GEEN AI API GECONFIGUREERD');
    console.log('');
    console.log('💡 OPLOSSING: Voeg Groq API key toe aan .env bestand');
    console.log('💡 Ga naar: https://console.groq.com');
    console.log('💡 Kopieer API key en voeg toe: GROQ_API_KEY=je_key');
  }
});