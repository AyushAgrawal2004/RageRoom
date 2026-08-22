const fs = require('fs');

function findJsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = dir + '/' + file;
    if (fs.statSync(filePath).isDirectory()) {
      findJsxFiles(filePath, fileList);
    } else if (filePath.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = findJsxFiles('./client/src/pages');
files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  
  code = code.replace(/'http:\/\/localhost:5005(\/api\/[^']+)'/g, "\`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}$1\`");
  code = code.replace(/`http:\/\/localhost:5005(\/[^`]+)`/g, "\`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}$1\`");
  
  fs.writeFileSync(file, code);
});

console.log('URLs patched!');
