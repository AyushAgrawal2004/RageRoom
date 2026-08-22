const fs = require('fs');
let code = fs.readFileSync('README.md', 'utf8');

const deployDocs = `
---

## 🚀 Deployment Guide

To deploy this application to production, you will need to host the Backend, Frontend, and Database separately.

### 1️⃣ Database (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Get your connection string (e.g., \`mongodb+srv://...\`).
3. Replace the \`MONGODB_URI\` in your backend environment variables with this string.

### 2️⃣ Backend (Render, Railway, or Heroku)
1. Deploy the \`server\` directory to your hosting provider.
2. Ensure you set the following Environment Variables in your hosting dashboard:
   - \`MONGODB_URI\`: Your MongoDB Atlas connection string.
   - \`GROQ_API_KEY\`: Your Groq API key.
   - \`PORT\`: (Usually provided automatically by the host, e.g., 5005).
   - \`CLIENT_URL\`: The URL where your frontend will be deployed (e.g., \`https://rageroom.vercel.app\`). Update \`server.js\` CORS settings if needed.

### 3️⃣ Frontend (Vercel, Netlify, or Render)
1. Deploy the \`client\` directory.
2. In your deployment settings, add the following Environment Variable:
   - \`VITE_API_URL\`: The deployed URL of your backend (e.g., \`https://rageroom-api.onrender.com\`).
3. Build command: \`npm run build\`
4. Output directory: \`dist\`
`;

code = code.replace(/EOF$/, ''); // Just in case
code += deployDocs;

fs.writeFileSync('README.md', code);
console.log('Added deployment docs');
