#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function printHelp() {
  console.log(`session-handoff - generate concise operator handoff briefs from local JSON\n
Usage:
  node tools/session-handoff/session-handoff.js --input <handoff.json> [--format text|json]

Options:
  --input <path>   Read handoff source JSON (required)
  --format <type>  Output format: text|json (default: text)
  --help, -h       Show this help message
`);
}

function parseArgs(argv) {
  const args = { input: null, format: 'text', help: false };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg === '--input') {
      const value = argv[i + 1];
      if (!value || value.startsWith('--')) {
        throw new Error('Missing value for --input.');
      }
      args.input = value;
      i += 1;
    } else if (arg === '--format') {
      const value = (argv[i + 1] || '').toLowerCase();
      if (!value || value.startsWith('--')) {
        throw new Error('Missing value for --format.');
      }
      args.format = value;
      i += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!['text', 'json'].includes(args.format)) {
    throw new Error(`Invalid --format value: ${args.format}. Use text or json.`);
  }

  if (!args.help && !args.input) {
    throw new Error('You must provide --input <handoff.json>.');
  }

  return args;
}

function toArray(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => String(item || '').trim().length > 0).map((item) => String(item).trim());
  }
  if (value === null || value === undefined) {
    return [];
  }
  const str = String(value).trim();
  return str ? [str] : [];
}

function loadInput(inputPath) {
  const resolved = path.resolve(process.cwd(), inputPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Input file not found: ${resolved}`);
  }

  try {
    const raw = fs.readFileSync(resolved, 'utf8');
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Input JSON must be an object.');
    }

    return { source: resolved, payload: parsed };
  } catch (error) {
    throw new Error(`Failed to read/parse JSON from ${resolved}: ${error.message}`);
  }
}

function buildHandoff(payload) {
  const project = String(payload.project || payload.projectName || 'Current workstream').trim();
  const owner = String(payload.owner || payload.operator || 'Operator').trim();
  const now = payload.timestamp || new Date().toISOString();

  const statusParts = [];
  if (payload.status) statusParts.push(String(payload.status).trim());
  if (payload.progress) statusParts.push(`Progress: ${String(payload.progress).trim()}`);
  if (payload.context) statusParts.push(String(payload.context).trim());
  if (statusParts.length === 0) statusParts.push('No explicit status provided.');

  const blockers = toArray(payload.blockers);
  const tasks = toArray(payload.tasks);
  const nextActionsInput = toArray(payload.nextActions);

  const nextActions = [];
  nextActions.push(...nextActionsInput);

  for (const task of tasks) {
    if (nextActions.length >= 3) break;
    nextActions.push(`Advance task: ${task}`);
  }

  if (nextActions.length === 0) {
    nextActions.push('Review current notes and define immediate execution priorities.');
  }

  while (nextActions.length < 3) {
    nextActions.push('Capture one concrete checkpoint update and confirm ownership.');
  }

  const trimmedNext = nextActions.slice(0, 3);

  const updateLines = [];
  updateLines.push(`${project} handoff update (${owner})`);
  updateLines.push(`Status: ${statusParts.join(' ')}`);
  updateLines.push(`Blockers: ${blockers.length ? blockers.join('; ') : 'None currently flagged.'}`);
  updateLines.push(`Next: ${trimmedNext.map((step, i) => `${i + 1}) ${step}`).join(' ')}`);

  return {
    sourceTimestamp: now,
    project,
    owner,
    currentStatus: statusParts.join(' '),
    blockers: blockers.length ? blockers : ['None currently flagged.'],
    next3Actions: trimmedNext,
    readyToSendUpdate: updateLines.join(' ')
  };
}

function formatText(result, source) {
  const lines = [];
  lines.push('session-handoff brief');
  lines.push(`source: ${source}`);
  lines.push(`timestamp: ${result.sourceTimestamp}`);
  lines.push(`project: ${result.project}`);
  lines.push(`owner: ${result.owner}`);
  lines.push('');
  lines.push('Current status:');
  lines.push(`- ${result.currentStatus}`);
  lines.push('');
  lines.push('Blockers:');
  result.blockers.forEach((item) => lines.push(`- ${item}`));
  lines.push('');
  lines.push('Next 3 actions:');
  result.next3Actions.forEach((item, i) => lines.push(`${i + 1}. ${item}`));
  lines.push('');
  lines.push('Ready-to-send update:');
  lines.push(result.readyToSendUpdate);

  return lines.join('\n');
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));

    if (args.help) {
      printHelp();
      process.exit(0);
    }

    const { source, payload } = loadInput(args.input);
    const result = buildHandoff(payload);

    if (args.format === 'json') {
      console.log(JSON.stringify({ source, ...result }, null, 2));
    } else {
      console.log(formatText(result, source));
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error('Use --help for usage details.');
    process.exit(1);
  }
}

main();
