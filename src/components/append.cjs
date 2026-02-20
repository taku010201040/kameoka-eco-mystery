const fs = require('fs');

const sourceFile = process.argv[2];
const targetFile = process.argv[3];

try {
    const data = fs.readFileSync(sourceFile, 'utf8');
    fs.appendFileSync(targetFile, data, 'utf8');
    console.log(`Successfully appended ${sourceFile} to ${targetFile}`);
} catch (err) {
    console.error('Error appending file:', err);
    process.exit(1);
}
