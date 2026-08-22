const { exec } = require('child_process');
const fs = require('fs');

console.log('Starting build...');
exec('npx vite build', (error, stdout, stderr) => {
    const output = `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}\n\nERROR:\n${error ? error.message : 'None'}`;
    fs.writeFileSync('build_log.txt', output);
    console.log('Build finished. Log written to build_log.txt');
});
