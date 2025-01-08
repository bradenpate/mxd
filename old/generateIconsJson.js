const fs = require('fs');
const path = require('path');

const iconDirs = ['./images/icons/filled', './images/icons/lined'];

const result = {};

iconDirs.forEach(dir => {
    const type = path.basename(dir);
    result[type] = fs.readdirSync(dir).filter(file => file.endsWith('.svg'));
});

fs.writeFileSync('./icons.json', JSON.stringify(result, null, 2));
console.log('icons.json created successfully!');