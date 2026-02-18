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

function parseArgs(argv) {
  const args = {
    profile: 'chrome',
    statusPath: null,
    tabsPath: null,
    mock: false,
    help: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') args.help = true;
    else if (a === '--mock') args.mock = true;
    else if (a === '--profile' || a === '-p') args.profile = argv[++i] || 'chrome';
    else if (a === '--status') args.statusPath = argv[++i] || null;
    else if (a === '--tabs') args.tabsPath = argv[++i] || null;
  }

  return args;
}

function usage() {
  console.log(`Relay Health Checker\n\nUsage:\n  node relay-health-checker.js [--profile chrome] [--status ./status.json] [--tabs ./tabs.json]\n  node relay-health-checker.js --mock\n\nOptions:\n  --profile, -p   Browser profile name (default: chrome)\n  --status        Path to browser.status JSON\n  --tabs          Path to browser.tabs JSON\n  --mock          Use built-in mock data\n  --help, -h      Show help\n`);
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

  if (!status) {
    recommendations.push('Provide --status JSON from browser.status output.');
  }
  if (!tabs) {
    recommendations.push('Provide --tabs JSON from browser.tabs output.');
  }
  if (!profileSeen) {
    recommendations.push(`Verify profile '${profile}' is started (try profile='chrome').`);
  }
  if (xTabs.length === 0) {
    recommendations.push('Open x.com in the browser profile and keep the tab active.');
  }
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

function printReport(report) {
  console.log(`\nRelay Health: ${report.overall}`);
  console.log('----------------------------------------');
  report.checks.forEach((c) => {
    console.log(`${c.ok ? '✅' : '❌'} ${c.name} — ${c.detail}`);
  });

  console.log('\nSuggested fixes:');
  report.recommendations.forEach((r, i) => {
    console.log(`${i + 1}. ${r}`);
  });
  console.log('');
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

(function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    usage();
    process.exit(0);
  }

  try {
    let status = null;
    let tabs = null;

    if (args.mock) {
      const mock = getMockData(args.profile);
      status = mock.status;
      tabs = mock.tabs;
    } else {
      if (args.statusPath) status = readJson(path.resolve(args.statusPath), 'status');
      if (args.tabsPath) tabs = readJson(path.resolve(args.tabsPath), 'tabs');
    }

    const report = checkHealth({
      profile: args.profile,
      status,
      tabs,
    });

    printReport(report);

    const exitCode = report.overall === 'HEALTHY' ? 0 : report.overall === 'DEGRADED' ? 1 : 2;
    process.exit(exitCode);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(3);
  }
})();
