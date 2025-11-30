#!/usr/bin/env node
const { spawn, execSync } = require('child_process');
const path = require('path');

function runCommand(command, args, opts = {}) {
  const cp = spawn(command, args, Object.assign({ stdio: 'inherit', shell: true }, opts));
  return cp;
}

function commandExists(cmd) {
  try {
    execSync(`${cmd} --version`, { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

async function main() {
  const repoRoot = path.resolve(__dirname, '..');

  // Run tests before starting services
  console.log('\n=== Running Tests ===\n');
  
  // Run backend tests
  console.log('Running backend tests...');
  try {
    const flaskDir = path.join(repoRoot, 'flask-server');
    if (commandExists('docker')) {
      // If using Docker, run tests in container
      try {
        execSync('docker-compose exec -T flask python test_app.py', { 
          cwd: repoRoot, 
          stdio: 'inherit' 
        });
      } catch (e) {
        console.log('Backend tests failed or container not running, continuing...');
      }
    } else if (commandExists('poetry')) {
      // If using local Poetry, run tests locally
      execSync('poetry run python test_app.py', { 
        cwd: flaskDir, 
        stdio: 'inherit' 
      });
    }
  } catch (err) {
    console.error('Backend tests failed:', err.message);
    console.log('Continuing with startup...\n');
  }

  // Run frontend tests
  console.log('\nRunning frontend tests...');
  try {
    execSync('npm test -- --watchAll=false --passWithNoTests', { 
      cwd: path.join(repoRoot, 'client'), 
      stdio: 'inherit' 
    });
  } catch (err) {
    console.error('Frontend tests failed:', err.message);
    console.log('Continuing with startup...\n');
  }

  console.log('\n=== Tests Complete ===\n');

  // If docker is available, prefer docker-compose (most reproducible)
  if (commandExists('docker')) {
    console.log('Docker detected — launching with docker-compose (recommended)');
    const cp = runCommand('docker-compose', ['up', '--build'], { cwd: repoRoot });
    process.on('SIGINT', () => cp.kill('SIGINT'));
    process.on('SIGTERM', () => cp.kill('SIGTERM'));
    return;
  }

  console.log('Docker not found — performing local setup (this may take a few minutes)');

  // 1) Install client deps
  console.log('Installing client dependencies...');
  try {
    execSync('npm install', { cwd: path.join(repoRoot, 'client'), stdio: 'inherit' });
  } catch (err) {
    console.error('Failed to install client dependencies:', err);
    process.exit(1);
  }

  // 2) Prepare Python environment for Flask — Poetry only
  const flaskDir = path.join(repoRoot, 'flask-server');

  if (commandExists('poetry')) {
    try {
      console.log('Poetry detected — configuring Poetry python and installing dependencies');
      // Ensure Poetry uses a working python executable (avoid broken pyenv shims)
      try {
        const sysPython = execSync('which python3').toString().trim();
        if (sysPython) {
          console.log(`Setting Poetry to use python: ${sysPython}`);
          try {
            execSync(`poetry env use ${sysPython}`, { cwd: flaskDir, stdio: 'inherit' });
          } catch (e) {
            // non-fatal: poetry env use may fail if environment already exists
            console.log('poetry env use failed or env already exists, continuing');
          }
        }
      } catch (e) {
        console.log('Could not determine system python, continuing with Poetry default');
      }

      execSync('poetry install --no-interaction', { cwd: flaskDir, stdio: 'inherit' });
    } catch (err) {
      console.error('Poetry install failed:', err);
      process.exit(1);
    }
  } else {
    console.error('\nPoetry is required for local Python dependency management.');
    console.error('Please install Poetry (https://python-poetry.org/docs/#installation) and re-run `npm start`.');
    process.exit(1);
  }

  // 3) Start Flask and React concurrently
  console.log('Starting Flask and React (local mode)');

  // Flask command: Poetry only
  const flaskCmd = 'poetry run flask --app app run --host=0.0.0.0';

  const flaskProc = runCommand(flaskCmd, [], { cwd: flaskDir });
  const reactProc = runCommand('npm', ['start'], { cwd: path.join(repoRoot, 'client') });

  function killAll(signal) {
    try { flaskProc.kill(signal); } catch (e) {}
    try { reactProc.kill(signal); } catch (e) {}
    process.exit();
  }

  process.on('SIGINT', () => killAll('SIGINT'));
  process.on('SIGTERM', () => killAll('SIGTERM'));
}

main();
