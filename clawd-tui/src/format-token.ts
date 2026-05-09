// Pretty-printers for Birdeye responses, tuned for the Clawd TUI palette.
import type {
  TokenOverview,
  TrendingResponseItem,
  WalletPortfolioItem,
  SearchTokenItem,
} from './birdeye.js';
import type { PriceSnapshot, HistoricalPrice } from './financialdatasets.js';
import type { DFlowMarket, DFlowOrderQuote, DFlowTrade } from './dflow.js';

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const ORANGE = '\x1b[38;5;215m';
const GRAY = '\x1b[90m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';

function compactUsd(n: number | undefined | null): string {
  if (n == null || !isFinite(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  if (abs >= 1) return `$${n.toFixed(2)}`;
  if (abs >= 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toPrecision(3)}`;
}

function compactNum(n: number | undefined | null): string {
  if (n == null || !isFinite(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function pct(n: number | undefined | null): string {
  if (n == null || !isFinite(n)) return `${GRAY}—${RESET}`;
  const v = `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
  return `${n >= 0 ? GREEN : RED}${v}${RESET}`;
}

function shortAddr(a: string): string {
  if (!a) return '';
  return a.length > 14 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
}

function row(label: string, value: string): string {
  return `  ${DIM}${label.padEnd(11)}${RESET}${value}`;
}

function plainPct(n: number | undefined | null): string {
  if (n == null || !isFinite(n)) return '—';
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}

export function formatTokenOverview(t: TokenOverview): string {
  const lines: string[] = [];
  const symbol = t.symbol ? `${BOLD}${ORANGE}$${t.symbol}${RESET}` : '';
  const name = t.name ? ` ${DIM}${t.name}${RESET}` : '';
  lines.push(`\n  ${symbol}${name}  ${GRAY}${shortAddr(t.address)}${RESET}`);

  lines.push(row('price', `${BOLD}${compactUsd(t.price)}${RESET}  1h ${pct(t.priceChange1hPercent)}  24h ${pct(t.priceChange24hPercent)}`));
  lines.push(row('mcap', `${compactUsd(t.marketCap)}${t.fdv ? `   ${DIM}fdv${RESET} ${compactUsd(t.fdv)}` : ''}`));
  lines.push(row('liquidity', compactUsd(t.liquidity)));
  lines.push(row('volume 24h', `${compactUsd(t.v24hUSD)}   ${DIM}buy${RESET} ${GREEN}${compactUsd(t.vBuy24hUSD)}${RESET}  ${DIM}sell${RESET} ${RED}${compactUsd(t.vSell24hUSD)}${RESET}`));
  lines.push(row('holders', compactNum(t.holder)));
  lines.push(row('trades 24h', `${compactNum(t.trade24h)}   ${DIM}wallets${RESET} ${compactNum(t.uniqueWallet24h)}`));

  const ext = t.extensions ?? {};
  const links: string[] = [];
  if (ext.website) links.push(`${CYAN}site${RESET}`);
  if (ext.twitter) links.push(`${CYAN}x${RESET}`);
  if (ext.telegram) links.push(`${CYAN}tg${RESET}`);
  if (ext.discord) links.push(`${CYAN}discord${RESET}`);
  if (links.length) lines.push(row('links', links.join(' · ')));
  if (ext.description) {
    const d = String(ext.description).slice(0, 140);
    lines.push(`  ${DIM}${d}${RESET}`);
  }
  lines.push('');
  return lines.join('\n');
}

export function formatTrending(items: TrendingResponseItem[], limit = 15): string {
  const lines: string[] = [];
  lines.push(`\n  ${BOLD}Trending Solana Tokens${RESET}  ${DIM}(via Birdeye)${RESET}`);
  lines.push(`  ${DIM}${'#'.padStart(3)}  ${'token'.padEnd(14)}  ${'price'.padStart(10)}  ${'24h'.padStart(8)}  ${'liq'.padStart(9)}  ${'vol24h'.padStart(9)}${RESET}`);
  for (const t of items.slice(0, limit)) {
    const sym = `$${t.symbol ?? ''}`.padEnd(14).slice(0, 14);
    const change = pct(t.price24hChangePercent).padStart(8 + 9);
    lines.push(
      `  ${YELLOW}${String(t.rank ?? '·').padStart(3)}${RESET}  ${ORANGE}${sym}${RESET}  ${compactUsd(t.price).padStart(10)}  ${change}  ${compactUsd(t.liquidity).padStart(9)}  ${compactUsd(t.volume24hUSD).padStart(9)}`,
    );
  }
  lines.push('');
  return lines.join('\n');
}

export function formatSearch(items: SearchTokenItem[], keyword: string, limit = 10): string {
  const lines: string[] = [];
  lines.push(`\n  ${BOLD}Search:${RESET} ${ORANGE}${keyword}${RESET}  ${DIM}(via Birdeye)${RESET}`);
  if (items.length === 0) {
    lines.push(`  ${DIM}no results${RESET}\n`);
    return lines.join('\n');
  }
  for (const t of items.slice(0, limit)) {
    const head = `${ORANGE}$${t.symbol ?? ''}${RESET} ${DIM}${t.name ?? ''}${RESET}`;
    lines.push(`  ${head}  ${GRAY}${shortAddr(t.address)}${RESET}`);
    lines.push(
      `    ${compactUsd(t.price)}  ${pct(t.price_change_24h_percent)}  ${DIM}liq${RESET} ${compactUsd(t.liquidity)}  ${DIM}vol24h${RESET} ${compactUsd(t.volume_24h_usd)}`,
    );
  }
  lines.push('');
  return lines.join('\n');
}

export interface PortfolioSummary {
  wallet: string;
  totalUsd: number;
  items: WalletPortfolioItem[];
}

export function summarizePortfolio(wallet: string, items: WalletPortfolioItem[]): PortfolioSummary {
  const filtered = items.filter((i) => (i.valueUsd ?? 0) > 0);
  filtered.sort((a, b) => (b.valueUsd ?? 0) - (a.valueUsd ?? 0));
  const totalUsd = filtered.reduce((s, i) => s + (i.valueUsd ?? 0), 0);
  return { wallet, totalUsd, items: filtered };
}

export function formatPortfolio(summary: PortfolioSummary, limit = 20): string {
  const lines: string[] = [];
  lines.push(`\n  ${BOLD}Portfolio${RESET}  ${GRAY}${shortAddr(summary.wallet)}${RESET}`);
  lines.push(row('net worth', `${BOLD}${compactUsd(summary.totalUsd)}${RESET}  ${DIM}${summary.items.length} tokens${RESET}`));
  if (summary.items.length === 0) {
    lines.push(`  ${DIM}no tokens with USD value${RESET}\n`);
    return lines.join('\n');
  }
  lines.push(`  ${DIM}${'token'.padEnd(12)}  ${'amount'.padStart(12)}  ${'price'.padStart(10)}  ${'value'.padStart(11)}${RESET}`);
  for (const i of summary.items.slice(0, limit)) {
    const sym = `$${i.symbol ?? '?'}`.padEnd(12).slice(0, 12);
    lines.push(
      `  ${ORANGE}${sym}${RESET}  ${compactNum(i.uiAmount).padStart(12)}  ${compactUsd(i.priceUsd).padStart(10)}  ${BOLD}${compactUsd(i.valueUsd).padStart(11)}${RESET}`,
    );
  }
  if (summary.items.length > limit) {
    const rest = summary.items.slice(limit).reduce((s, i) => s + (i.valueUsd ?? 0), 0);
    lines.push(`  ${DIM}…${summary.items.length - limit} more  ·  ${compactUsd(rest)}${RESET}`);
  }
  lines.push('');
  return lines.join('\n');
}

export function formatNetworth(summary: PortfolioSummary): string {
  const lines: string[] = [];
  lines.push(`\n  ${BOLD}Net Worth${RESET}  ${GRAY}${shortAddr(summary.wallet)}${RESET}`);
  lines.push(`  ${BOLD}${ORANGE}${compactUsd(summary.totalUsd)}${RESET}  ${DIM}across ${summary.items.length} tokens${RESET}`);
  const top = summary.items.slice(0, 5);
  for (const i of top) {
    const w = summary.totalUsd > 0 ? ((i.valueUsd ?? 0) / summary.totalUsd) * 100 : 0;
    lines.push(`  ${ORANGE}$${(i.symbol ?? '?').padEnd(8)}${RESET} ${compactUsd(i.valueUsd).padStart(10)}  ${DIM}${w.toFixed(1)}%${RESET}`);
  }
  lines.push('');
  return lines.join('\n');
}

export function formatError(prefix: string, message: string): string {
  return `\n  ${RED}error${RESET} ${DIM}${prefix}: ${message}${RESET}\n`;
}

export function formatStockSnapshot(s: PriceSnapshot): string {
  const price = s.price ?? s.day?.close;
  const change = s.changePercent ?? (
    s.previousClose && price ? ((price - s.previousClose) / s.previousClose) * 100 : undefined
  );
  const lines: string[] = [];
  lines.push(`\n  ${BOLD}Market Snapshot${RESET}  ${ORANGE}${s.ticker}${RESET} ${DIM}(Financial Datasets)${RESET}`);
  lines.push(row('price', `${BOLD}${compactUsd(price)}${RESET}  ${pct(change)}`));
  lines.push(row('session', `${DIM}open${RESET} ${compactUsd(s.day?.open)}  ${DIM}high${RESET} ${compactUsd(s.day?.high)}  ${DIM}low${RESET} ${compactUsd(s.day?.low)}`));
  lines.push(row('volume', compactNum(s.day?.volume)));
  lines.push(row('time', `${s.time ?? s.timestamp ?? 'latest'}`));
  lines.push('');
  return lines.join('\n');
}

export function formatHistoricalPrices(ticker: string, prices: HistoricalPrice[], limit = 8): string {
  const lines: string[] = [];
  lines.push(`\n  ${BOLD}${ticker.toUpperCase()} history${RESET} ${DIM}(Financial Datasets)${RESET}`);
  if (prices.length === 0) {
    lines.push(`  ${DIM}no price rows returned${RESET}\n`);
    return lines.join('\n');
  }
  lines.push(`  ${DIM}${'date'.padEnd(12)} ${'open'.padStart(10)} ${'close'.padStart(10)} ${'chg'.padStart(8)} ${'vol'.padStart(10)}${RESET}`);
  for (const p of prices.slice(-limit)) {
    const change = p.open ? ((p.close - p.open) / p.open) * 100 : undefined;
    lines.push(
      `  ${(p.time ?? '').padEnd(12)} ${compactUsd(p.open).padStart(10)} ${compactUsd(p.close).padStart(10)} ${plainPct(change).padStart(8)} ${compactNum(p.volume).padStart(10)}`,
    );
  }
  lines.push('');
  return lines.join('\n');
}

export function formatDFlowMarkets(markets: DFlowMarket[], limit = 8): string {
  const lines: string[] = [];
  lines.push(`\n  ${BOLD}DFlow Prediction Markets${RESET} ${DIM}(active, volume-ranked)${RESET}`);
  if (markets.length === 0) {
    lines.push(`  ${DIM}no active markets returned${RESET}\n`);
    return lines.join('\n');
  }
  lines.push(`  ${DIM}${'ticker'.padEnd(18)} ${'yes'.padStart(11)} ${'no'.padStart(11)} ${'vol'.padStart(10)}  title${RESET}`);
  for (const m of markets.slice(0, limit)) {
    const yes = `${m.yesBid ?? '—'}/${m.yesAsk ?? '—'}`.padStart(11);
    const no = `${m.noBid ?? '—'}/${m.noAsk ?? '—'}`.padStart(11);
    const title = `${m.title ?? m.subtitle ?? ''}`.slice(0, 64);
    lines.push(`  ${ORANGE}${m.ticker.padEnd(18).slice(0, 18)}${RESET} ${yes} ${no} ${compactUsd(m.volume24h ?? m.volume).padStart(10)}  ${title}`);
  }
  lines.push('');
  return lines.join('\n');
}

export function formatDFlowTrades(trades: DFlowTrade[], limit = 8): string {
  const lines: string[] = [];
  lines.push(`\n  ${BOLD}DFlow Recent Trades${RESET}`);
  if (trades.length === 0) {
    lines.push(`  ${DIM}no trades returned${RESET}\n`);
    return lines.join('\n');
  }
  for (const t of trades.slice(0, limit)) {
    const side = t.takerSide ? `${DIM}${t.takerSide}${RESET}` : '';
    const yes = t.yesPriceDollars ? `${GREEN}yes ${t.yesPriceDollars}${RESET}` : '';
    const no = t.noPriceDollars ? `${RED}no ${t.noPriceDollars}${RESET}` : '';
    const when = t.createdTime ? new Date(t.createdTime * 1000).toISOString().slice(11, 19) : '';
    lines.push(`  ${ORANGE}${t.ticker}${RESET} ${side} ${yes} ${no} ${DIM}${compactNum(t.count)} @ ${when}${RESET}`);
  }
  lines.push('');
  return lines.join('\n');
}

export function formatDFlowQuote(q: DFlowOrderQuote, inputDecimals = 9, outputDecimals = 6): string {
  const inAmount = Number(q.inAmount) / 10 ** inputDecimals;
  const outAmount = Number(q.outAmount) / 10 ** outputDecimals;
  const route = (q.routePlan ?? []).map((r) => r.venue).filter(Boolean).join(' -> ') || 'route';
  const lines: string[] = [];
  lines.push(`\n  ${BOLD}DFlow SOL/USDC Quote${RESET}`);
  lines.push(row('input', `${compactNum(inAmount)} SOL`));
  lines.push(row('output', `${BOLD}${compactNum(outAmount)} USDC${RESET}`));
  lines.push(row('impact', `${q.priceImpactPct ?? '—'}${q.priceImpactPct?.includes('%') ? '' : '%'}`));
  lines.push(row('priority', `${compactNum(q.prioritizationFeeLamports)} lamports`));
  lines.push(row('route', `${DIM}${route}${RESET}`));
  lines.push('');
  return lines.join('\n');
}

export function formatMarketPulse(parts: {
  sol?: TokenOverview;
  clawd?: TokenOverview;
  stocks?: PriceSnapshot[];
  dflowMarkets?: DFlowMarket[];
  errors?: string[];
}): string {
  const lines: string[] = [];
  lines.push(`\n  ${BOLD}${ORANGE}OpenClawd Market Pulse${RESET} ${DIM}${new Date().toLocaleTimeString()}${RESET}`);
  if (parts.sol) {
    lines.push(`  ${ORANGE}SOL${RESET} ${BOLD}${compactUsd(parts.sol.price)}${RESET}  1h ${pct(parts.sol.priceChange1hPercent)}  24h ${pct(parts.sol.priceChange24hPercent)}  ${DIM}liq${RESET} ${compactUsd(parts.sol.liquidity)}`);
  }
  if (parts.clawd) {
    lines.push(`  ${ORANGE}$CLAWD${RESET} ${BOLD}${compactUsd(parts.clawd.price)}${RESET}  24h ${pct(parts.clawd.priceChange24hPercent)}  ${DIM}mcap${RESET} ${compactUsd(parts.clawd.marketCap)}  ${DIM}liq${RESET} ${compactUsd(parts.clawd.liquidity)}`);
  }
  for (const s of parts.stocks ?? []) {
    const price = s.price ?? s.day?.close;
    const change = s.changePercent ?? (s.previousClose && price ? ((price - s.previousClose) / s.previousClose) * 100 : undefined);
    lines.push(`  ${CYAN}${s.ticker.padEnd(5)}${RESET} ${BOLD}${compactUsd(price)}${RESET}  ${pct(change)} ${DIM}${s.time ?? s.timestamp ?? ''}${RESET}`);
  }
  for (const m of (parts.dflowMarkets ?? []).slice(0, 3)) {
    lines.push(`  ${YELLOW}${m.ticker}${RESET} ${DIM}yes${RESET} ${m.yesBid ?? '—'}/${m.yesAsk ?? '—'} ${DIM}vol${RESET} ${compactUsd(m.volume24h ?? m.volume)}  ${(m.title ?? '').slice(0, 52)}`);
  }
  for (const e of parts.errors ?? []) lines.push(`  ${RED}warn${RESET} ${DIM}${e}${RESET}`);
  lines.push('');
  return lines.join('\n');
}
