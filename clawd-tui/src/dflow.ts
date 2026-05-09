const DEFAULT_QUOTE_BASE = 'https://quote-api.dflow.net';
const DEFAULT_PREDICTION_BASE = 'https://prediction-markets-api.dflow.net';
const DEFAULT_TIMEOUT_MS = 15_000;

export interface DFlowOptions {
  apiKey?: string;
  quoteBaseUrl?: string;
  predictionBaseUrl?: string;
  timeoutMs?: number;
}

export class DFlowError extends Error {
  readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

export interface DFlowOrderQuote {
  contextSlot?: number;
  executionMode?: string;
  inAmount: string;
  inputMint: string;
  minOutAmount?: string;
  outAmount: string;
  outputMint: string;
  priceImpactPct?: string;
  slippageBps?: number | string;
  prioritizationFeeLamports?: number;
  routePlan?: Array<{
    venue?: string;
    inAmount?: string;
    outAmount?: string;
    inputMintDecimals?: number;
    outputMintDecimals?: number;
  }>;
}

export interface DFlowMarket {
  ticker: string;
  title?: string;
  subtitle?: string;
  status?: string;
  volume?: number;
  volume24h?: number;
  liquidity?: number;
  openInterest?: number;
  yesBid?: string;
  yesAsk?: string;
  noBid?: string;
  noAsk?: string;
  closeTime?: number;
  eventTicker?: string;
}

export interface DFlowTrade {
  ticker: string;
  tradeId?: string;
  takerSide?: string;
  yesPriceDollars?: string;
  noPriceDollars?: string;
  count?: number;
  createdTime?: number;
}

export class DFlowClient {
  private readonly apiKey?: string;
  private readonly quoteBaseUrl: string;
  private readonly predictionBaseUrl: string;
  private readonly timeoutMs: number;

  constructor(opts: DFlowOptions = {}) {
    this.apiKey = opts.apiKey || undefined;
    this.quoteBaseUrl = opts.quoteBaseUrl ?? DEFAULT_QUOTE_BASE;
    this.predictionBaseUrl = opts.predictionBaseUrl ?? DEFAULT_PREDICTION_BASE;
    this.timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  private headers(): Record<string, string> {
    return {
      accept: 'application/json',
      ...(this.apiKey ? { 'x-api-key': this.apiKey } : {}),
    };
  }

  private async get<T>(base: string, path: string, params: Record<string, unknown> = {}): Promise<T> {
    const url = new URL(path, base);
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    }
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), this.timeoutMs);
    try {
      const res = await fetch(url.toString(), {
        signal: ctl.signal,
        headers: this.headers(),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new DFlowError(`${res.status} ${res.statusText} ${body.slice(0, 200)}`, res.status);
      }
      return (await res.json()) as T;
    } finally {
      clearTimeout(t);
    }
  }

  venues(): Promise<string[]> {
    return this.get<string[]>(this.quoteBaseUrl, '/venues');
  }

  tokensWithDecimals(): Promise<Array<[string, number]>> {
    return this.get<Array<[string, number]>>(this.quoteBaseUrl, '/tokens-with-decimals');
  }

  orderQuote(params: {
    inputMint: string;
    outputMint: string;
    amount: string | number;
    slippageBps?: string | number;
    userPublicKey?: string;
  }): Promise<DFlowOrderQuote> {
    return this.get<DFlowOrderQuote>(this.quoteBaseUrl, '/order', {
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: params.amount,
      slippageBps: params.slippageBps ?? 'auto',
      userPublicKey: params.userPublicKey,
    });
  }

  async markets(limit = 8, sort: 'volume' | 'volume24h' | 'liquidity' | 'openInterest' | 'startDate' = 'volume24h'): Promise<DFlowMarket[]> {
    const json = await this.get<{ markets?: DFlowMarket[] }>(this.predictionBaseUrl, '/api/v1/markets', {
      limit,
      sort,
      status: 'active',
    });
    return json.markets ?? [];
  }

  async trades(limit = 8): Promise<DFlowTrade[]> {
    const json = await this.get<{ trades?: DFlowTrade[] }>(this.predictionBaseUrl, '/api/v1/trades', { limit });
    return json.trades ?? [];
  }
}

export const SOL_MINT = 'So11111111111111111111111111111111111111112';
export const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
