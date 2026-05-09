const BASE = 'https://api.financialdatasets.ai';
const DEFAULT_TIMEOUT_MS = 15_000;

export interface FinancialDatasetsOptions {
  apiKey: string;
  timeoutMs?: number;
}

export class FinancialDatasetsError extends Error {
  readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

export interface PriceSnapshot {
  ticker: string;
  price?: number;
  time?: string;
  timestamp?: string;
  day?: {
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
  };
  previousClose?: number;
  change?: number;
  changePercent?: number;
}

export interface HistoricalPrice {
  ticker?: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  time: string;
}

export class FinancialDatasetsClient {
  private readonly apiKey: string;
  private readonly timeoutMs: number;

  constructor(opts: FinancialDatasetsOptions) {
    if (!opts.apiKey) throw new FinancialDatasetsError('FINANCIALDATASET_API_KEY is not set');
    this.apiKey = opts.apiKey;
    this.timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  private async get<T>(path: string, params: Record<string, unknown> = {}): Promise<T> {
    const url = new URL(path, BASE);
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    }
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), this.timeoutMs);
    try {
      const res = await fetch(url.toString(), {
        signal: ctl.signal,
        headers: {
          accept: 'application/json',
          'X-API-KEY': this.apiKey,
        },
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new FinancialDatasetsError(`${res.status} ${res.statusText} ${body.slice(0, 200)}`, res.status);
      }
      return (await res.json()) as T;
    } finally {
      clearTimeout(t);
    }
  }

  async snapshot(ticker: string): Promise<PriceSnapshot> {
    const json = await this.get<{ snapshot?: PriceSnapshot } | PriceSnapshot>('/prices/snapshot', {
      ticker: ticker.toUpperCase(),
    });
    return 'snapshot' in json && json.snapshot ? json.snapshot : (json as PriceSnapshot);
  }

  async historical(
    ticker: string,
    startDate: string,
    endDate: string,
    interval: 'day' | 'week' | 'month' | 'year' = 'day',
  ): Promise<HistoricalPrice[]> {
    const json = await this.get<{ prices?: HistoricalPrice[] }>('/prices', {
      ticker: ticker.toUpperCase(),
      interval,
      start_date: startDate,
      end_date: endDate,
    });
    return json.prices ?? [];
  }
}
