// File: scripts/dev.js
// Description: Run backend and frontend concurrently with a delay for the backend using ES module syntax

import { spawn } from 'child_process';

// Function to spawn a process in a given directory with "npm run dev"
// delay parameter is in milliseconds
function runProcess(cwd, delay = 0) {
  setTimeout(() => {
    const proc = spawn('npm', ['run', 'dev'], {
      cwd,
      shell: true,
      stdio: 'inherit'
    });
    proc.on('close', (code) => {
      if (code !== 0) {
        console.error(`Process in ${cwd} exited with code ${code}`);
        process.exit(code);
      }
    });
  }, delay);
}

// Run backend with a delay of 1000ms and frontend immediately
runProcess('back', 500);
runProcess('front', 0);