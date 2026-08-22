const fs = require('fs');
let code = fs.readFileSync('server/server.js', 'utf8');

const oldCatch = `  } catch (error) {
    console.error('Error generating report card:', error);
    res.status(500).json({ error: 'Failed to generate report card' });
  }`;

const newCatch = `  } catch (error) {
    console.error('Error generating report card:', error.stack || error);
    res.status(500).json({ error: 'Failed to generate report card', details: error.message, stack: error.stack });
  }`;

code = code.replace(oldCatch, newCatch);
fs.writeFileSync('server/server.js', code);
console.log('Patched error response');
