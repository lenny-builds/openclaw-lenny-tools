#!/usr/bin/env node
/**
 * Relay Health Checker (V1)
 *
 * Generic CLI checker for OpenClaw browser relay health using saved JSON
 * (status/tabs) or mock mode.
 *
 * TODO: Directly integrate with OpenClaw APIs/tools when runtime bridge is available.
 */

const fs = require('fs');
const path = require('path');

function usage() {
  console.log(`relay-health-checker - evaluate OpenClaw Browser Relay readiness from JSON snapshots\n
Usage:
  node tools/relay-health-checker/relay-health-checker.js [--profile <name>] [--status <status.json>] [--tabs <tabs.json>] [--format text|json]
  node tools/relay-health-checker/relay-health-checker.js --mock [--profile <name>] [--format text|json]

Options:
  --profile, -p <name>  Browser profile name (default: chrome)
  --status <path>       Path to browser.status JSON
  --tabs <path>         Path to browser.tabs JSON
  --mock                Use built-in mock payloads
  --format <type>       Output format: text|json (default: text)
  --help, -h            Show this help message
`);
}

function parseArgs(argv) {
  const args = {
    profile: 'chrome',
    statusPath: null,
    tabsPath: null,
    mock: false,
    format: 'text',
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];

    if (a === '--help' || a === '-h') {
      args.help = true;
    } else if (a === '--mock') {
      args.mock = true;
    } else if (a === '--profile' || a === '-p') {
      const value = argv[i + 1];
      if (!value || value.startsWith('-')) {
        throw new Error('Missing value for --profile.');
      }
      args.profile = value;
      i += 1;
    } else if (a === '--status') {
      const value = argv[i + 1];
      if (!value || value.startsWith('-')) {
        throw new Error('Missing value for --status.');
      }
      args.statusPath = value;
      i += 1;
    } else if (a === '--tabs') {
      const value = argv[i + 1];
      if (!value || value.startsWith('-')) {
        throw new Error('Missing value for --tabs.');
      }
      args.tabsPath = value;
      i += 1;
    } else if (a === '--format') {
      const value = (argv[i + 1] || '').toLowerCase();
      if (!value || value.startsWith('-')) {
        throw new Error('Missing value for --format.');
      }
      args.format = value;
      i += 1;
    } else {
      throw new Error(`Unknown argument: ${a}`);
    }
  }

  if (!['text', 'json'].includes(args.format)) {
    throw new Error(`Invalid --format value: ${args.format}. Use text or json.`);
  }

  if (args.mock && (args.statusPath || args.tabsPath)) {
    throw new Error('Use either --mock or --status/--tabs inputs, not both.');
  }

  return args;
}

function readJson(filePath, label) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to read ${label} JSON at ${filePath}: ${err.message}`);
  }
}

function normalizeTabs(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (Array.isArray(input.tabs)) return input.tabs;
  if (Array.isArray(input.data)) return input.data;
  return [];
}

function looksConnectedTab(tab) {
  const hay = JSON.stringify(tab || {}).toLowerCase();
  return hay.includes('connected') || hay.includes('relay') || hay.includes('attached');
}

function isXTab(tab) {
  const hay = JSON.stringify(tab || {}).toLowerCase();
  return hay.includes('x.com') || hay.includes('twitter.com');
}

function checkHealth({ profile, status, tabs }) {
  const checks = [];
  const recommendations = [];

  const statusBlob = JSON.stringify(status || {}).toLowerCase();
  const profileSeen = statusBlob.includes(profile.toLowerCase());

  checks.push({
    name: 'browser.status present',
    ok: !!status,
    detail: status ? 'Status payload loaded.' : 'Missing status payload.',
  });

  checks.push({
    name: `profile '${profile}' referenced`,
    ok: profileSeen,
    detail: profileSeen
      ? `Profile '${profile}' appears in status data.`
      : `Profile '${profile}' not found in status payload.`,
  });

  const tabsList = normalizeTabs(tabs);
  checks.push({
    name: 'browser.tabs present',
    ok: Array.isArray(tabsList),
    detail: `Tabs payload parsed (${tabsList.length} tabs).`,
  });

  const xTabs = tabsList.filter(isXTab);
  checks.push({
    name: 'X tab discovered',
    ok: xTabs.length > 0,
    detail: xTabs.length > 0
      ? `Found ${xTabs.length} X/Twitter tab(s).`
      : 'No X/Twitter tabs found.',
  });

  const connectedXTabs = xTabs.filter(looksConnectedTab);
  checks.push({
    name: 'X tab connected to relay',
    ok: connectedXTabs.length > 0,
    detail: connectedXTabs.length > 0
      ? `Connected X tab(s): ${connectedXTabs.length}`
      : 'No connected X tab detected.',
  });

  if (!status) recommendations.push('Provide --status JSON from browser.status output.');
  if (!tabs) recommendations.push('Provide --tabs JSON from browser.tabs output.');
  if (!profileSeen) recommendations.push(`Verify profile '${profile}' is started (try profile='chrome').`);
  if (xTabs.length === 0) recommendations.push('Open x.com in the browser profile and keep the tab active.');
  if (xTabs.length > 0 && connectedXTabs.length === 0) {
    recommendations.push('Attach relay to the X tab (click OpenClaw Browser Relay toolbar icon until badge is ON).');
  }

  if (recommendations.length === 0) {
    recommendations.push('Relay looks healthy. Keep this tab attached and re-check if automation fails.');
  }

  const failed = checks.filter((c) => !c.ok).length;
  const overall = failed === 0 ? 'HEALTHY' : failed <= 2 ? 'DEGRADED' : 'UNHEALTHY';

  return { overall, checks, recommendations };
}

function formatText(report) {
  const lines = [];
  lines.push(`Relay Health: ${report.overall}`);
  lines.push('----------------------------------------');
  report.checks.forEach((c) => {
    lines.push(`${c.ok ? '✅' : '❌'} ${c.name} — ${c.detail}`);
  });
  lines.push('');
  lines.push('Suggested fixes:');
  report.recommendations.forEach((r, i) => {
    lines.push(`${i + 1}. ${r}`);
  });
  return lines.join('\n');
}

function getMockData(profile) {
  return {
    status: {
      profile,
      running: true,
      relay: 'available',
      note: 'Mocked status payload',
    },
    tabs: {
      tabs: [
        {
          id: 'tab-1',
          title: 'Home / X',
          url: 'https://x.com/home',
          relayConnected: true,
        },
        {
          id: 'tab-2',
          title: 'Docs',
          url: 'https://docs.example.com',
        },
      ],
    },
  };
}

function resolveExitCode(report) {
  return report.overall === 'HEALTHY' ? 0 : report.overall === 'DEGRADED' ? 1 : 2;
}

(function main() {
  try {
    const args = parseArgs(process.argv.slice(2));

    if (args.help) {
      usage();
      process.exit(0);
    }

    let status = null;
    let tabs = null;

    if (args.mock) {
      const mock = getMockData(args.profile);
      status = mock.status;
      tabs = mock.tabs;
    } else {
      if (args.statusPath) status = readJson(path.resolve(process.cwd(), args.statusPath), 'status');
      if (args.tabsPath) tabs = readJson(path.resolve(process.cwd(), args.tabsPath), 'tabs');
    }

    const report = checkHealth({
      profile: args.profile,
      status,
      tabs,
    });

    if (args.format === 'json') {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(formatText(report));
      console.log('');
    }

    process.exit(resolveExitCode(report));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    console.error('Use --help for usage details.');
    process.exit(1);
  }
})();
