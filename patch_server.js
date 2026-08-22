const fs = require('fs');
const path = require('path');

const serverFile = path.join(__dirname, 'server', 'server.js');
let code = fs.readFileSync(serverFile, 'utf8');

// 1. Add CustomPersona model require
const customPersonaRequire = "const CustomPersona = require('./models/CustomPersona');\n";
if (!code.includes('CustomPersona')) {
  code = code.replace("const User = require('./models/User');", "const User = require('./models/User');\n" + customPersonaRequire);
}

// 2. Add API routes
const newRoutes = `
/* =======================================================================
   CUSTOM PERSONAS ROUTES
======================================================================= */
app.get('/api/personas/custom', authMiddleware, async (req, res) => {
  try {
    const customPersonas = await CustomPersona.find({ userId: req.user.userId });
    res.json(customPersonas);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch custom personas' });
  }
});

app.post('/api/personas/custom', authMiddleware, async (req, res) => {
  try {
    const { name, description, backstory, initialMessage, startingFactors } = req.body;
    
    // Auto-generate Dicebear PF
    const seed = name.replace(/\\s+/g, '') + Date.now();
    const avatarUrl = \`https://api.dicebear.com/9.x/notionists/svg?seed=\${seed}&backgroundColor=f3f4f6\`;

    const custom = new CustomPersona({
      userId: req.user.userId,
      name,
      description,
      backstory,
      initialMessage,
      startingFactors: startingFactors || { frustration: 5, patience: 5, trust: 5, loyalty: 5, satisfaction: 5 },
      avatarUrl,
      crmData: {
        accountName: "Custom User",
        accountStatus: "Unknown",
        customerSince: "N/A",
        issueRelatedTo: "Custom Scenario"
      }
    });

    await custom.save();
    // Return with an 'id' field to match global personas structure
    const customWithId = custom.toObject();
    customWithId.id = custom._id.toString();
    
    res.json(customWithId);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create custom persona', details: err.message });
  }
});

/* =======================================================================
   LEADERBOARD ROUTE
======================================================================= */
app.get('/api/leaderboard', async (req, res) => {
  try {
    // Find highest scores globally, grouped by user and persona
    const topSessions = await Conversation.find({ 
      'reportCard.overallScore': { $exists: true },
      userId: { $ne: null }
    })
    .sort({ 'reportCard.overallScore': -1 })
    .populate('userId', 'username')
    .limit(100);

    res.json(topSessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

`;

if (!code.includes('/api/personas/custom')) {
  code = code.replace("/* =======================================================================\n   SIMULATOR ROUTES\n======================================================================= */", newRoutes + "/* =======================================================================\n   SIMULATOR ROUTES\n======================================================================= */");
}

// 3. Fix /api/start to support custom personas
// Replace: const persona = personas.find(p => p.id === personaId) || personas[0];
// With: a DB lookup for custom persona if not found in global personas array

const startRegex = /const persona = personas\.find\(p => p\.id === personaId\) \|\| personas\[0\];/;
const newStartLogic = `
    let persona = personas.find(p => p.id === personaId);
    if (!persona) {
      const customP = await CustomPersona.findById(personaId);
      if (customP) {
        persona = customP.toObject();
        persona.id = persona._id.toString();
      } else {
        persona = personas[0];
      }
    }
`;
code = code.replace(startRegex, newStartLogic);

fs.writeFileSync(serverFile, code);
console.log('Server patched successfully!');
