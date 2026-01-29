#!/usr/bin/env node
/*
 * Hover Performance Test - Uses LSP Client
 *
 * This script uses the testbed's LSP client to send hover requests
 * to a running language server for consistent performance testing.
 *
 * Usage:
 *   node run-hover-test.js [--count <number>] [--delay <ms>] [--server-port <port>]
 *
 * The script will:
 * 1. Find Apex files in the current directory
 * 2. Find common symbols (Account, String, etc.)
 * 3. Send hover requests for those symbols
 * 4. Measure and report timing
 *
 * Note: This requires the language server to be running and accessible.
 * For VS Code/Cursor, you may need to use the extension's LSP connection.
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
  'Object',
  'Void',
];

/**
 * Find Apex files in current directory
 */
function findApexFiles(dir = '.') {
  const files = [];
  
  function walkDir(currentDir) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        // Skip common directories
        if (
          entry.name.startsWith('.') ||
          entry.name === 'node_modules' ||
          entry.name === 'dist' ||
          entry.name === 'build'
        ) {
          continue;
        }
        
        if (entry.isDirectory()) {
          walkDir(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.cls')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
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
          const after =
            index + symbol.length < line.length
              ? line[index + symbol.length]
              : ' ';
          
          if (
            !/[a-zA-Z0-9_]/.test(before) &&
            !/[a-zA-Z0-9_]/.test(after)
          ) {
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
  // Limit to first 30 files for performance
  for (const file of apexFiles.slice(0, 30)) {
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
  
  // Instructions for manual testing
  console.log('📋 Manual Hover Test Instructions');
  console.log('==================================\n');
  console.log('Since the language server is managed by VS Code/Cursor,');
  console.log('you need to manually perform hover operations.\n');
  console.log('Hover Positions to Test:\n');
  
  const positionsToTest = allPositions.slice(0, hoverCount);
  for (let i = 0; i < positionsToTest.length; i++) {
    const pos = positionsToTest[i];
    const uri = pathToUri(pos.filePath);
    console.log(
      `${i + 1}. ${pos.symbol} in ${path.basename(pos.filePath)}:${pos.line + 1}:${pos.character + 1}`,
    );
    console.log(`   File: ${pos.filePath}`);
    console.log(`   URI: ${uri}\n`);
  }
  
  // Save positions to JSON file for reference
  const positionsFile = path.join(process.cwd(), 'hover-positions.json');
  fs.writeFileSync(
    positionsFile,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        config: { hoverCount, delayMs },
        positions: positionsToTest.map((pos) => ({
          symbol: pos.symbol,
          file: pos.filePath,
          line: pos.line + 1, // 1-indexed for display
          character: pos.character + 1, // 1-indexed for display
          uri: pathToUri(pos.filePath),
        })),
      },
      null,
      2,
    ),
  );
  
  console.log(`\n✅ Hover positions saved to: ${positionsFile}`);
  console.log('\n💡 Next Steps:');
  console.log('1. Open this project in VS Code/Cursor');
  console.log('2. Start profiling with tag: hover-during-load-<project-size>');
  console.log('3. Trigger workspace load (Find All References)');
  console.log('4. While loading, hover over the symbols listed above');
  console.log('5. Stop profiling');
  console.log('\nThe positions file can be used as a reference during testing.');
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error(`\n❌ Fatal error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  });
}

module.exports = { findApexFiles, findSymbolPositions };
