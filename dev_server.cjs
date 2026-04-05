const { spawn } = require('child_process');

const server = spawn('npm', ['run', 'dev'], {
    detached: true,
    stdio: 'ignore'
});

server.unref();
