#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const LEGACY_PATTERNS = [/paper\s*trade/i, /market\s*scan/i, /wallet\s*tracker/i];

const MOCK_JOBS = [
  { name: 'Paper Trade Scanner', schedule: '*/5 * * * *', consecutiveErrors: 6, lastStatus: 'error' },
  { name: 'Nightly Backfill', schedule: '0 2 * * *', consecutiveErrors: 1, lastStatus: 'ok' },
  { name: 'Portfolio Digest', schedule: '0 8 * * *', consecutiveErrors: 0, lastStatus: 'ok' },
  { name: 'Market Scan Alerts', schedule: '*/10 * * * *', consecutiveErrors: 0, lastStatus: 'ok' },
  { name: 'Invoice Sync', schedule: '*/30 * * * *', consecutiveErrors: 0, lastStatus: 'error' }
];

function printHelp() {
  console.log(`cron-cleaner - detect noisy cron jobs and suggest non-destructive cleanup actions\n
Usage:
  node tools/cron-cleaner/cron-cleaner.js [--input <jobs.json> | --mock] [--format text|json]

Options:
  --input <path>   Read cron jobs from JSON file
  --mock           Use built-in mock dataset
  --format <type>  Output format: text|json (default: text)
  --help           Show this help message
`);
}

function parseArgs(argv) {
  const args = { format: 'text', mock: false, input: null, help: false };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg === '--mock') {
      args.mock = true;
    } else if (arg === '--input') {
      args.input = argv[i + 1];
      i += 1;
    } else if (arg === '--format') {
      args.format = (argv[i + 1] || '').toLowerCase();
      i += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!['text', 'json'].includes(args.format)) {
    throw new Error(`Invalid --format value: ${args.format}. Use text or json.`);
  }

  if (!args.mock && !args.input && !args.help) {
    throw new Error('You must provide either --input <jobs.json> or --mock.');
  }

  if (args.mock && args.input) {
    throw new Error('Use either --input or --mock, not both.');
  }

  return args;
}

function loadJobs(args) {
  if (args.mock) {
    return { source: 'mock', jobs: MOCK_JOBS };
  }

  const filePath = path.resolve(process.cwd(), args.input);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Input file not found: ${filePath}`);
  }

  let parsed;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Failed to read/parse JSON from ${filePath}: ${error.message}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Input JSON must be an array of cron job objects.');
  }

  return { source: filePath, jobs: parsed };
}

function isLegacyTradingScan(name) {
  const value = String(name || '');
  return LEGACY_PATTERNS.some((pattern) => pattern.test(value));
}

function analyzeJobs(jobs) {
  const safeToDisable = [];
  const review = [];
  const clean = [];

  for (const job of jobs) {
    const consecutiveErrors = Number(job?.consecutiveErrors || 0);
    const lastStatus = String(job?.lastStatus || '').toLowerCase();
    const legacyMatch = isLegacyTradingScan(job?.name);

    const noisy = consecutiveErrors > 0 || lastStatus === 'error' || legacyMatch;

    const normalized = {
      name: job?.name ?? '(unnamed)',
      schedule: job?.schedule ?? '(unknown)',
      consecutiveErrors,
      lastStatus: lastStatus || '(unknown)',
      reason: []
    };

    if (consecutiveErrors > 0) normalized.reason.push('consecutiveErrors > 0');
    if (lastStatus === 'error') normalized.reason.push('lastStatus == error');
    if (legacyMatch) normalized.reason.push('legacy trading scan name match');

    if (legacyMatch) {
      safeToDisable.push(normalized);
    } else if (noisy) {
      review.push(normalized);
    } else {
      clean.push(normalized);
    }
  }

  return {
    summary: {
      total: jobs.length,
      safeToDisable: safeToDisable.length,
      review: review.length,
      clean: clean.length
    },
    lists: {
      SAFE_TO_DISABLE: safeToDisable,
      REVIEW: review,
      CLEAN: clean
    },
    suggestedActions: [
      'Default mode is advisory only: do not auto-disable jobs without confirmation.',
      'Start with SAFE_TO_DISABLE jobs: disable in staging first and monitor for 24h.',
      'For REVIEW jobs, inspect logs and retry history before deciding to disable or fix.',
      'Keep CLEAN jobs unchanged and continue normal monitoring.'
    ]
  };
}

function formatText(result, source) {
  const lines = [];
  lines.push('cron-cleaner report');
  lines.push(`source: ${source}`);
  lines.push('');
  lines.push(`total: ${result.summary.total}`);
  lines.push(`SAFE_TO_DISABLE: ${result.summary.safeToDisable}`);
  lines.push(`REVIEW: ${result.summary.review}`);
  lines.push(`CLEAN: ${result.summary.clean}`);
  lines.push('');

  const sections = ['SAFE_TO_DISABLE', 'REVIEW', 'CLEAN'];
  for (const section of sections) {
    lines.push(`${section}:`);
    const items = result.lists[section];
    if (items.length === 0) {
      lines.push('  - (none)');
    } else {
      for (const item of items) {
        const reasonText = item.reason.length ? ` | reasons: ${item.reason.join(', ')}` : '';
        lines.push(`  - ${item.name} [${item.schedule}]${reasonText}`);
      }
    }
    lines.push('');
  }

  lines.push('Suggested actions:');
  result.suggestedActions.forEach((action, i) => lines.push(`  ${i + 1}. ${action}`));

  return lines.join('\n');
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));

    if (args.help) {
      printHelp();
      process.exit(0);
    }

    const { source, jobs } = loadJobs(args);
    const result = analyzeJobs(jobs);

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
