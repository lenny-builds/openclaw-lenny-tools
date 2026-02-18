#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DEFAULT_TOP = 10;
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'how', 'in', 'is', 'it', 'of', 'on', 'or',
  'that', 'the', 'this', 'to', 'was', 'what', 'when', 'where', 'who', 'will', 'with', 'your', 'you', 'into',
  'via', 'using', 'use', 'guide', 'tips', 'best', 'new', 'getting', 'get'
]);

function printHelp() {
  console.log(`bookmark-intelligence - cluster saved links into themes and weekly digest\n
Usage:
  node tools/bookmark-intelligence/bookmark-intelligence.js --input <bookmarks.json> [--format text|json] [--top <number>]

Options:
  --input <path>   Read bookmarks from a JSON file
  --format <type>  Output format: text|json (default: text)
  --top <number>   Number of top clusters/themes to include (default: 10)
  --help, -h       Show this help message
`);
}

function parseArgs(argv) {
  const args = { input: null, format: 'text', top: DEFAULT_TOP, help: false };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg === '--input') {
      args.input = argv[i + 1];
      i += 1;
    } else if (arg === '--format') {
      args.format = (argv[i + 1] || '').toLowerCase();
      i += 1;
    } else if (arg === '--top') {
      args.top = Number(argv[i + 1]);
      i += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!args.help && !args.input) {
    throw new Error('You must provide --input <bookmarks.json>.');
  }

  if (!['text', 'json'].includes(args.format)) {
    throw new Error(`Invalid --format value: ${args.format}. Use text or json.`);
  }

  if (!Number.isInteger(args.top) || args.top <= 0) {
    throw new Error(`Invalid --top value: ${args.top}. Use a positive integer.`);
  }

  return args;
}

function loadBookmarks(inputPath) {
  const filePath = path.resolve(process.cwd(), inputPath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Input file not found: ${filePath}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Failed to read/parse JSON from ${filePath}: ${error.message}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Input JSON must be an array of bookmark objects.');
  }

  return { filePath, bookmarks: parsed };
}

function tokenizeBookmark(bookmark) {
  const tags = Array.isArray(bookmark.tags) ? bookmark.tags.join(' ') : '';
  const blob = `${bookmark.title || ''} ${bookmark.notes || ''} ${tags}`.toLowerCase();

  return blob
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function buildClusters(bookmarks) {
  const clusters = new Map();

  for (const bookmark of bookmarks) {
    const tokens = tokenizeBookmark(bookmark);
    if (tokens.length === 0) continue;

    const counts = new Map();
    for (const token of tokens) {
      counts.set(token, (counts.get(token) || 0) + 1);
    }

    const keyword = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];

    if (!clusters.has(keyword)) {
      clusters.set(keyword, {
        keyword,
        count: 0,
        bookmarks: [],
        tokenCounts: new Map()
      });
    }

    const cluster = clusters.get(keyword);
    cluster.count += 1;
    cluster.bookmarks.push({
      url: bookmark.url || '',
      title: bookmark.title || '(untitled)',
      tags: Array.isArray(bookmark.tags) ? bookmark.tags : [],
      savedAt: bookmark.savedAt || null
    });

    for (const token of tokens) {
      cluster.tokenCounts.set(token, (cluster.tokenCounts.get(token) || 0) + 1);
    }
  }

  return [...clusters.values()].map((cluster) => ({
    keyword: cluster.keyword,
    count: cluster.count,
    topKeywords: [...cluster.tokenCounts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 5)
      .map(([word, count]) => ({ word, count })),
    bookmarks: cluster.bookmarks
  }));
}

function buildThemeCounts(bookmarks) {
  const themeCounts = new Map();

  for (const bookmark of bookmarks) {
    const seen = new Set(tokenizeBookmark(bookmark));
    for (const token of seen) {
      themeCounts.set(token, (themeCounts.get(token) || 0) + 1);
    }
  }

  return [...themeCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([theme, count]) => ({ theme, count }));
}

function buildWeeklyDigest(bookmarks, themeCounts, clusters) {
  const total = bookmarks.length;
  const withNotes = bookmarks.filter((b) => (b.notes || '').trim().length > 0).length;
  const withTags = bookmarks.filter((b) => Array.isArray(b.tags) && b.tags.length > 0).length;
  const distinctDomains = new Set(
    bookmarks
      .map((b) => {
        try {
          return new URL(b.url).hostname.replace(/^www\./, '');
        } catch {
          return null;
        }
      })
      .filter(Boolean)
  );

  const topTheme = themeCounts[0]?.theme || 'n/a';
  const topCluster = clusters[0]?.keyword || 'n/a';

  return [
    `Saved ${total} bookmarks this period across ${distinctDomains.size} distinct domains.`,
    `Most repeated theme: "${topTheme}" (${themeCounts[0]?.count || 0} mentions).`,
    `Largest topic cluster centers on "${topCluster}" with ${clusters[0]?.count || 0} links.`,
    `${withTags}/${total} bookmarks include tags; ${withNotes}/${total} include notes.`,
    'Overall signal: keep curating by tagging consistently to improve future clustering quality.'
  ];
}

function buildSuggestedActions(themeCounts, clusters) {
  const first = themeCounts[0]?.theme || 'top theme';
  const second = themeCounts[1]?.theme || first;
  const cluster = clusters[0]?.keyword || first;

  return [
    `Create a focused reading sprint for "${cluster}" and review top links this week.`,
    `Promote recurring themes like "${first}" and "${second}" into a permanent learning list.`,
    'Archive low-value or duplicate bookmarks after reviewing clusters with only one item.',
    'Backfill missing tags on untagged bookmarks to improve recommendation quality.',
    'Turn one high-density cluster into a short internal note or blog draft.'
  ];
}

function analyzeBookmarks(bookmarks, topN) {
  const clusters = buildClusters(bookmarks)
    .sort((a, b) => b.count - a.count || a.keyword.localeCompare(b.keyword))
    .slice(0, topN);

  const themes = buildThemeCounts(bookmarks).slice(0, topN);
  const digest = buildWeeklyDigest(bookmarks, themes, clusters);
  const suggestedActions = buildSuggestedActions(themes, clusters);

  return {
    summary: {
      totalBookmarks: bookmarks.length,
      clusterCount: clusters.length,
      themeCount: themes.length
    },
    topicClusters: clusters,
    topRepeatedThemes: themes,
    weeklyDigest: digest,
    suggestedActions
  };
}

function formatText(result, source) {
  const lines = [];
  lines.push('bookmark-intelligence report');
  lines.push(`source: ${source}`);
  lines.push('');
  lines.push(`totalBookmarks: ${result.summary.totalBookmarks}`);
  lines.push(`topicClusters: ${result.summary.clusterCount}`);
  lines.push(`topRepeatedThemes: ${result.summary.themeCount}`);
  lines.push('');

  lines.push('Topic clusters:');
  if (result.topicClusters.length === 0) {
    lines.push('  - (none)');
  } else {
    result.topicClusters.forEach((cluster, idx) => {
      const tags = cluster.topKeywords.map((k) => `${k.word}:${k.count}`).join(', ');
      lines.push(`  ${idx + 1}. ${cluster.keyword} (${cluster.count})`);
      lines.push(`     keywords: ${tags}`);
    });
  }
  lines.push('');

  lines.push('Top repeated themes:');
  if (result.topRepeatedThemes.length === 0) {
    lines.push('  - (none)');
  } else {
    result.topRepeatedThemes.forEach((theme, idx) => lines.push(`  ${idx + 1}. ${theme.theme} (${theme.count})`));
  }
  lines.push('');

  lines.push('Weekly digest (5 bullets):');
  result.weeklyDigest.forEach((item, idx) => lines.push(`  ${idx + 1}. ${item}`));
  lines.push('');

  lines.push('Suggested actions:');
  result.suggestedActions.forEach((item, idx) => lines.push(`  ${idx + 1}. ${item}`));

  return lines.join('\n');
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));

    if (args.help) {
      printHelp();
      process.exit(0);
    }

    const { filePath, bookmarks } = loadBookmarks(args.input);
    const result = analyzeBookmarks(bookmarks, args.top);

    if (args.format === 'json') {
      console.log(JSON.stringify({ source: filePath, ...result }, null, 2));
    } else {
      console.log(formatText(result, filePath));
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error('Use --help for usage details.');
    process.exit(1);
  }
}

main();
