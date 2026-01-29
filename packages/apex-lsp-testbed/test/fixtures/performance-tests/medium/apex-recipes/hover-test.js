#!/usr/bin/env node
/*
 * Hover Performance Test Script
 *
 * This script sends hover requests to the Apex Language Server for consistent
 * performance testing across small, medium, and large projects.
 *
 * Usage:
 *   node hover-test.js [--count <number>] [--delay <ms>]
 *
 * Examples:
 *   # Send 20 hover requests with 100ms delay between each
 *   node hover-test.js --count 20 --delay 100
 *
 *   # Send 50 hover requests (default) with 50ms delay (default)
 *   node hover-test.js
 */

const fs = require('fs');
const path = require('path');

// Common Apex symbols that exist in all projects
const COMMON_SYMBOLS = [
  'Account',
  'String',
  'Integer',
  'Boolean',
  'System',
  'List',
  'Map',
  'Set',
  'Date',
  'DateTime',
];

/**
 * Send LSP request via stdin/stdout
 */
function sendLSPRequest(method, params = {}) {
  const request = {
    jsonrpc: '2.0',
    id: Date.now() + Math.random(),
    method,
    params,
  };

  const requestStr = JSON.stringify(request);
  const contentLength = Buffer.byteLength(requestStr, 'utf8');
  const message = `Content-Length: ${contentLength}\r\n\r\n${requestStr}`;

  process.stdout.write(message);
}

/**
 * Read LSP response from stdin
 */
function readLSPResponse() {
  return new Promise((resolve, reject) => {
    let buffer = '';
    let contentLength = null;

    const stdin = process.stdin;
    stdin.setEncoding('utf8');

    const onData = (chunk) => {
      buffer += chunk;

      // Parse headers
      if (contentLength === null) {
        const headerEnd = buffer.indexOf('\r\n\r\n');
        if (headerEnd === -1) return;

        const headers = buffer.substring(0, headerEnd).split('\r\n');
        buffer = buffer.substring(headerEnd + 4);

        for (const header of headers) {
          if (header.startsWith('Content-Length:')) {
            contentLength = parseInt(header.substring(15).trim(), 10);
          }
        }
      }

      // Parse body
      if (contentLength !== null && buffer.length >= contentLength) {
        const body = buffer.substring(0, contentLength);
        buffer = buffer.substring(contentLength);

        stdin.removeListener('data', onData);
        try {
          const response = JSON.parse(body);
          resolve(response);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      }
    };

    stdin.on('data', onData);

    // Timeout after 30 seconds for hover requests
    setTimeout(() => {
      stdin.removeListener('data', onData);
      reject(new Error('Timeout waiting for response'));
    }, 30000);
  });
}

/**
 * Find Apex files in current directory
 */
function findApexFiles(dir = '.') {
  const files = [];
  
  function walkDir(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      // Skip node_modules, .git, etc.
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }
      
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.cls')) {
        files.push(fullPath);
      }
    }
  }
  
  walkDir(dir);
  return files;
}

/**
 * Read Apex file and find positions of symbols
 */
function findSymbolPositions(filePath, symbols) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const positions = [];
    
    for (const symbol of symbols) {
      for (let lineNum = 0; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum];
        const index = line.indexOf(symbol);
        
        if (index >= 0) {
          // Check if it's a whole word (not part of another word)
          const before = index > 0 ? line[index - 1] : ' ';
          const after = index + symbol.length < line.length ? line[index + symbol.length] : ' ';
          
          if (!/[a-zA-Z0-9_]/.test(before) && !/[a-zA-Z0-9_]/.test(after)) {
            positions.push({
              symbol,
              line: lineNum,
              character: index,
              filePath,
            });
            break; // Only take first occurrence per symbol per file
          }
        }
      }
    }
    
    return positions;
  } catch (error) {
    return [];
  }
}

/**
 * Convert file path to URI
 */
function pathToUri(filePath) {
  const absolutePath = path.resolve(filePath);
  if (process.platform === 'win32') {
    return `file:///${absolutePath.replace(/\\/g, '/')}`;
  }
  return `file://${absolutePath}`;
}

/**
 * Send hover request
 */
async function sendHoverRequest(uri, line, character) {
  const params = {
    textDocument: { uri },
    position: { line, character },
  };
  
  sendLSPRequest('textDocument/hover', params);
  const response = await readLSPResponse();
  return response;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  let hoverCount = 50; // Default: 50 hover requests
  let delayMs = 50; // Default: 50ms delay between requests
  
  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--count' && i + 1 < args.length) {
      hoverCount = parseInt(args[++i], 10);
    } else if (args[i] === '--delay' && i + 1 < args.length) {
      delayMs = parseInt(args[++i], 10);
    }
  }
  
  console.log('🔍 Hover Performance Test');
  console.log('=========================\n');
  console.log(`Configuration:`);
  console.log(`  Hover requests: ${hoverCount}`);
  console.log(`  Delay between requests: ${delayMs}ms\n`);
  
  // Find Apex files
  console.log('Finding Apex files...');
  const apexFiles = findApexFiles('.');
  console.log(`Found ${apexFiles.length} Apex files\n`);
  
  if (apexFiles.length === 0) {
    console.error('❌ No Apex files found in current directory');
    console.error('   Run this script from a directory containing .cls files');
    process.exit(1);
  }
  
  // Find symbol positions
  console.log('Finding symbol positions...');
  const allPositions = [];
  for (const file of apexFiles.slice(0, 20)) { // Limit to first 20 files for performance
    const positions = findSymbolPositions(file, COMMON_SYMBOLS);
    allPositions.push(...positions);
  }
  
  console.log(`Found ${allPositions.length} symbol positions\n`);
  
  if (allPositions.length === 0) {
    console.error('❌ No common symbols found in Apex files');
    console.error('   Make sure files contain common symbols like Account, String, etc.');
    process.exit(1);
  }
  
  // Shuffle positions to get variety
  for (let i = allPositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allPositions[i], allPositions[j]] = [allPositions[j], allPositions[i]];
  }
  
  // Send hover requests
  console.log('Sending hover requests...\n');
  const results = [];
  const startTime = Date.now();
  
  for (let i = 0; i < Math.min(hoverCount, allPositions.length); i++) {
    const pos = allPositions[i % allPositions.length];
    const uri = pathToUri(pos.filePath);
    
    const requestStart = Date.now();
    try {
      const response = await sendHoverRequest(uri, pos.line, pos.character);
      const requestTime = Date.now() - requestStart;
      
      results.push({
        symbol: pos.symbol,
        file: path.basename(pos.filePath),
        line: pos.line,
        character: pos.character,
        time: requestTime,
        success: response.result !== null && response.result !== undefined,
      });
      
      process.stderr.write(`[${i + 1}/${hoverCount}] Hover on ${pos.symbol} in ${path.basename(pos.filePath)}:${pos.line}:${pos.character} - ${requestTime}ms ${response.result ? '✓' : '✗'}\n`);
    } catch (error) {
      const requestTime = Date.now() - requestStart;
      results.push({
        symbol: pos.symbol,
        file: path.basename(pos.filePath),
        line: pos.line,
        character: pos.character,
        time: requestTime,
        success: false,
        error: error.message,
      });
      
      process.stderr.write(`[${i + 1}/${hoverCount}] Hover on ${pos.symbol} in ${path.basename(pos.filePath)}:${pos.line}:${pos.character} - ${requestTime}ms ✗ (${error.message})\n`);
    }
    
    // Delay between requests
    if (i < hoverCount - 1 && delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  
  const totalTime = Date.now() - startTime;
  
  // Calculate statistics
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const times = results.map((r) => r.time);
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  
  // Print summary
  console.log('\n📊 Results Summary');
  console.log('==================\n');
  console.log(`Total requests: ${results.length}`);
  console.log(`Successful: ${successful} (${((successful / results.length) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${failed} (${((failed / results.length) * 100).toFixed(1)}%)`);
  console.log(`\nTiming:`);
  console.log(`  Total time: ${totalTime}ms`);
  console.log(`  Average: ${avgTime.toFixed(2)}ms`);
  console.log(`  Min: ${minTime}ms`);
  console.log(`  Max: ${maxTime}ms`);
  console.log(`  Requests/second: ${((results.length / totalTime) * 1000).toFixed(2)}`);
  
  // Save results to file
  const resultsFile = path.join(process.cwd(), 'hover-test-results.json');
  fs.writeFileSync(
    resultsFile,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        config: { hoverCount, delayMs },
        summary: {
          total: results.length,
          successful,
          failed,
          totalTime,
          avgTime,
          minTime,
          maxTime,
        },
        results,
      },
      null,
      2,
    ),
  );
  console.log(`\n✅ Results saved to: ${resultsFile}`);
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error(`\n❌ Fatal error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  });
}

module.exports = { sendHoverRequest, findApexFiles, findSymbolPositions };
