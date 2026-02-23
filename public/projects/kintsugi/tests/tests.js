/**
 * Kintsugi - Test Harness
 * Runs all module tests and reports results
 */

import * as config from '../js/config.js';
import * as state from '../js/state.js';
import * as audio from '../js/audio.js';
import * as lacquer from '../js/lacquer.js';
import * as fracture from '../js/fracture.js';
import * as gold from '../js/gold.js';
import * as particles from '../js/particles.js';
import * as physics from '../js/physics.js';
import * as renderer from '../js/renderer.js';
import * as input from '../js/input.js';

// All modules with _test functions
const modules = [
  { name: 'config', module: config },
  { name: 'state', module: state },
  { name: 'audio', module: audio },
  { name: 'lacquer', module: lacquer },
  { name: 'fracture', module: fracture },
  { name: 'gold', module: gold },
  { name: 'particles', module: particles },
  { name: 'physics', module: physics },
  { name: 'renderer', module: renderer },
  { name: 'input', module: input },
];

/**
 * Run all tests and return results
 */
export function runAll() {
  const allResults = [];
  
  for (const { name, module } of modules) {
    if (typeof module._test === 'function') {
      try {
        const results = module._test();
        allResults.push({
          module: name,
          results: results,
          error: null,
        });
      } catch (error) {
        allResults.push({
          module: name,
          results: [],
          error: error.message,
        });
      }
    } else {
      allResults.push({
        module: name,
        results: [],
        error: 'No _test function exported',
      });
    }
  }
  
  return allResults;
}

/**
 * Run all tests and log results to console
 */
export function runAndLog() {
  console.group('🧪 Kintsugi Test Suite');
  
  const allResults = runAll();
  let totalPassed = 0;
  let totalFailed = 0;
  let totalErrors = 0;
  
  for (const moduleResult of allResults) {
    const { module, results, error } = moduleResult;
    
    if (error) {
      console.group(`❌ ${module} - ERROR`);
      console.error(error);
      console.groupEnd();
      totalErrors++;
      continue;
    }
    
    const passed = results.filter(r => r.pass).length;
    const failed = results.filter(r => !r.pass).length;
    totalPassed += passed;
    totalFailed += failed;
    
    const icon = failed === 0 ? '✅' : '⚠️';
    console.group(`${icon} ${module} (${passed}/${results.length})`);
    
    for (const result of results) {
      if (result.pass) {
        console.log(`  ✓ ${result.name}`);
      } else {
        console.warn(`  ✗ ${result.name}`);
      }
    }
    
    console.groupEnd();
  }
  
  console.log('');
  console.log(`📊 Summary: ${totalPassed} passed, ${totalFailed} failed, ${totalErrors} errors`);
  console.groupEnd();
  
  return { totalPassed, totalFailed, totalErrors };
}

/**
 * Run tests and display results in DOM
 */
export function runAndDisplay(containerId = 'test-results') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Test container #${containerId} not found`);
    return runAndLog();
  }
  
  const allResults = runAll();
  let totalPassed = 0;
  let totalFailed = 0;
  let totalErrors = 0;
  
  let html = '<h2>🧪 Kintsugi Test Suite</h2>';
  
  for (const moduleResult of allResults) {
    const { module, results, error } = moduleResult;
    
    if (error) {
      html += `<div class="module error"><h3>❌ ${module}</h3><p>${error}</p></div>`;
      totalErrors++;
      continue;
    }
    
    const passed = results.filter(r => r.pass).length;
    const failed = results.filter(r => !r.pass).length;
    totalPassed += passed;
    totalFailed += failed;
    
    const icon = failed === 0 ? '✅' : '⚠️';
    html += `<div class="module ${failed === 0 ? 'pass' : 'fail'}">`;
    html += `<h3>${icon} ${module} (${passed}/${results.length})</h3>`;
    html += '<ul>';
    
    for (const result of results) {
      const rIcon = result.pass ? '✓' : '✗';
      const rClass = result.pass ? 'pass' : 'fail';
      html += `<li class="${rClass}">${rIcon} ${result.name}</li>`;
    }
    
    html += '</ul></div>';
  }
  
  html += `<div class="summary">`;
  html += `<strong>📊 Summary:</strong> ${totalPassed} passed, ${totalFailed} failed, ${totalErrors} errors`;
  html += `</div>`;
  
  container.innerHTML = html;
  
  return { totalPassed, totalFailed, totalErrors };
}

// Auto-run in dev mode (check for ?test query param)
if (typeof window !== 'undefined' && window.location.search.includes('test')) {
  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => runAndLog());
  } else {
    runAndLog();
  }
}
