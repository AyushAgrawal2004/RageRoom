const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Session.jsx', 'utf8');

// 1. Add messagesRef
if (!code.includes('const messagesRef = useRef(messages);')) {
   code = code.replace(
     "const [messages, setMessages] = useState([]);",
     "const [messages, setMessages] = useState([]);\n  const messagesRef = useRef(messages);\n  useEffect(() => { messagesRef.current = messages; }, [messages]);"
   );
}

// 2. Change endSession to use messagesRef
code = code.replace(
  "const userMessageCount = messages.filter(m => m.role === 'user').length;",
  "const userMessageCount = messagesRef.current.filter(m => m.role === 'user').length;"
);

fs.writeFileSync('client/src/pages/Session.jsx', code);
console.log('Patched messagesRef');
