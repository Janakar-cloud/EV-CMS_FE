#!/usr/bin/env node

/**
 * Vercel Deployment Configuration Verification Script
 *
 * This script verifies that all required configuration files and settings
 * are in place before deploying to Vercel.
 *
 * Usage: node verify-vercel-config.js
 */

const fs = require('fs');
const path = require('path');

// Color output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('');
  log(`═══════════════════════════════════════`, 'cyan');
  log(`${title}`, 'cyan');
  log(`═══════════════════════════════════════`, 'cyan');
}

function checkFile(filepath, description) {
  const fullPath = path.join(process.cwd(), filepath);
  const exists = fs.existsSync(fullPath);

  if (exists) {
    log(`✓ ${description}`, 'green');
    return true;
  } else {
    log(`✗ ${description}`, 'red');
    log(`  Missing: ${filepath}`, 'yellow');
    return false;
  }
}

function checkFileContent(filepath, searchText, description) {
  const fullPath = path.join(process.cwd(), filepath);

  if (!fs.existsSync(fullPath)) {
    log(`✗ ${description}`, 'red');
    log(`  File not found: ${filepath}`, 'yellow');
    return false;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  if (content.includes(searchText)) {
    log(`✓ ${description}`, 'green');
    return true;
  } else {
    log(`✗ ${description}`, 'red');
    log(`  Content not found in ${filepath}`, 'yellow');
    return false;
  }
}

function checkPackageJson() {
  const pkgPath = path.join(process.cwd(), 'package.json');

  if (!fs.existsSync(pkgPath)) {
    log('✗ package.json not found', 'red');
    return false;
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  let allGood = true;

  // Check scripts
  const requiredScripts = ['build', 'start', 'dev'];
  for (const script of requiredScripts) {
    if (pkg.scripts && pkg.scripts[script]) {
      log(`  ✓ Script exists: ${script}`, 'green');
    } else {
      log(`  ✗ Missing script: ${script}`, 'red');
      allGood = false;
    }
  }

  // Check name
  if (pkg.name && pkg.name !== '') {
    log(`  ✓ Package name: ${pkg.name}`, 'green');
  } else {
    log(`  ✗ Package name is empty`, 'red');
    allGood = false;
  }

  // Check node version
  if (pkg.engines && pkg.engines.node) {
    log(`  ✓ Node version specified: ${pkg.engines.node}`, 'green');
  } else {
    log(`  ⚠ Node version not specified (optional)`, 'yellow');
  }

  return allGood;
}

function checkVercelJson() {
  const vercelPath = path.join(process.cwd(), 'vercel.json');

  if (!fs.existsSync(vercelPath)) {
    log('✗ vercel.json not found', 'red');
    return false;
  }

  try {
    const vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
    let allGood = true;

    if (vercel.buildCommand) {
      log(`  ✓ Build command: ${vercel.buildCommand}`, 'green');
    } else {
      log(`  ⚠ Build command not specified (will use default)`, 'yellow');
    }

    if (vercel.env) {
      log(`  ✓ Environment variables: ${Object.keys(vercel.env).length} defined`, 'green');
    }

    if (vercel.headers) {
      log(`  ✓ Security headers: ${vercel.headers.length} configured`, 'green');
    }

    if (vercel.rewrites) {
      log(`  ✓ API rewrites: ${vercel.rewrites.length} configured`, 'green');
    }

    return allGood;
  } catch (error) {
    log('✗ vercel.json is invalid JSON', 'red');
    log(`  Error: ${error.message}`, 'yellow');
    return false;
  }
}

function checkEnvironmentFiles() {
  let allGood = true;

  const files = [
    { path: '.env.example', desc: '.env.example (template)' },
    { path: '.env.local', desc: '.env.local (local development)' },
  ];

  for (const file of files) {
    const fullPath = path.join(process.cwd(), file.path);
    const exists = fs.existsSync(fullPath);
    if (exists) {
      log(`  ✓ ${file.desc} exists`, 'green');
    } else {
      log(`  ⚠ ${file.desc} missing`, 'yellow');
    }
  }

  return allGood;
}

function checkBuildArtifacts() {
  const nextPath = path.join(process.cwd(), '.next');
  const pkgPath = path.join(process.cwd(), 'package.json');
  const lockPath = path.join(process.cwd(), 'package-lock.json');

  let allGood = true;

  if (fs.existsSync(nextPath)) {
    log(`  ✓ .next build directory exists`, 'green');
  } else {
    log(`  ⚠ .next directory not found (run 'npm run build' first)`, 'yellow');
  }

  if (fs.existsSync(pkgPath)) {
    log(`  ✓ package.json exists`, 'green');
  } else {
    log(`  ✗ package.json missing`, 'red');
    allGood = false;
  }

  if (fs.existsSync(lockPath)) {
    log(`  ✓ package-lock.json exists (lockfile)`, 'green');
  } else {
    log(`  ⚠ package-lock.json missing (will be regenerated)`, 'yellow');
  }

  return allGood;
}

function checkGitignore() {
  const gitPath = path.join(process.cwd(), '.gitignore');

  if (!fs.existsSync(gitPath)) {
    log(`  ⚠ .gitignore not found`, 'yellow');
    return false;
  }

  const content = fs.readFileSync(gitPath, 'utf8');
  const required = ['.next', 'node_modules', '.env.local', '.env.*.local'];
  let allGood = true;

  for (const item of required) {
    if (content.includes(item)) {
      log(`  ✓ Ignores: ${item}`, 'green');
    } else {
      log(`  ⚠ Not ignoring: ${item}`, 'yellow');
      allGood = false;
    }
  }

  return allGood;
}

// Main verification
console.clear();
log('Vercel Deployment Configuration Verification', 'blue');
console.log('');

let totalChecks = 0;
let passedChecks = 0;

// Configuration Files
section('Configuration Files');
totalChecks += 2;
passedChecks += checkFile('vercel.json', 'Vercel configuration') ? 1 : 0;
passedChecks += checkFile('next.config.js', 'Next.js configuration') ? 1 : 0;

// Package Configuration
section('Package Configuration');
totalChecks += 1;
passedChecks += checkPackageJson() ? 1 : 0;

// Vercel JSON Details
section('Vercel Configuration Details');
checkVercelJson();

// Environment
section('Environment Configuration');
checkEnvironmentFiles();

// Build Artifacts
section('Build Artifacts');
totalChecks += 1;
passedChecks += checkBuildArtifacts() ? 1 : 0;

// Git Configuration
section('Git Configuration');
checkGitignore();

// Summary
section('Verification Summary');
log(`Total Critical Checks: ${totalChecks}`, 'cyan');
log(`Passed: ${passedChecks}/${totalChecks}`, 'green');

if (passedChecks === totalChecks) {
  log('', 'reset');
  log('All critical checks passed! Ready for Vercel deployment.', 'green');
  log('', 'reset');
  log('Next steps:', 'cyan');
  log('1. Ensure all environment variables are set in Vercel dashboard', 'yellow');
  log('2. Run: npm run test:backend (to verify backend connectivity)', 'yellow');
  log('3. Run: npm run build (to verify production build works)', 'yellow');
  log('4. Push to GitHub and trigger deployment in Vercel', 'yellow');
  log('', 'reset');
  process.exit(0);
} else {
  log('', 'reset');
  log('Some checks failed. Please fix the issues above before deploying.', 'yellow');
  log('', 'reset');
  process.exit(1);
}
