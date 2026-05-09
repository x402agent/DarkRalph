# OpenClawd TUI

[![npm version](https://img.shields.io/npm/v/@openclawdsolana/clawd-tui.svg?color=ff6b35&style=for-the-badge)](https://www.npmjs.com/package/@openclawdsolana/clawd-tui)
[![node](https://img.shields.io/node/v/@openclawdsolana/clawd-tui.svg?style=for-the-badge)](https://nodejs.org/)
[![license](https://img.shields.io/npm/l/@openclawdsolana/clawd-tui.svg?style=for-the-badge)](./LICENSE)

OpenClawd TUI is a Solana-native agent terminal with live market context, wallet and token inspection, DFlow routing intelligence, Financial Datasets equity snapshots, and OpenRouter-powered coding tools.

Contract: `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`

Links: [x.com/clawddevs](https://x.com/clawddevs) · [cloud.solanaclawd.com](https://cloud.solanaclawd.com) · [vault.solanaclawd.com](https://vault.solanaclawd.com) · [solanaos.net](https://solanaos.net) · [github.com/x402agent/solana-clawd](https://github.com/x402agent/solana-clawd) · [github.com/x402agent/solanaos](https://github.com/x402agent/solanaos)

## One-Shot Install

Run without installing:

```bash
npx -y @openclawdsolana/clawd-tui
```

Persistent install:

```bash
npm install -g @openclawdsolana/clawd-tui
clawd
```

Full OpenClawd installer path:

```bash
curl -fsSL https://solanaclawd.com/install | sh
clawd
```

On first run, `clawd` opens OpenRouter OAuth and stores the key at `~/.config/openclawd/openrouter-key` with `0600` permissions. You can also set `OPENROUTER_API_KEY` directly.

## What Is New

The TUI now has a multi-provider live market layer:

| Provider | Env | Commands |
| --- | --- | --- |
| Birdeye | `BIRDEYE_API_KEY` | `/trending`, `/search`, `/wallet`, `/portfolio`, `/networth`, SOL + $CLAWD pulse |
| Financial Datasets | `FINANCIALDATASET_API_KEY` | `/quote`, `/history`, equity leg of `/markets` and `/live` |
| DFlow | `DFLOW_API_KEY` | `/dflow markets`, `/dflow trades`, `/dflow venues`, `/dflow tokens`, `/dflow quote` |
| Helius | `HELIUS_API_KEY`, `HELIUS_RPC_URL` | `/asset`, `/assets`, `/nfts`, `/holders`, `/sigs`, `/balance` |
| Dark DeFi Terminal | `DARK_DEFI_TERMINAL_PATH` | `/dark status`, `/dark docs`, `/dark build`, `/dark run` |

High-signal commands:

```text
/markets [tickers]       SOL, $CLAWD, equities, and DFlow prediction markets
/live [seconds] [ticks]  bounded real-time pulse refresh
/quote <ticker>          real-time stock/ETF snapshot
/history <ticker> [days] historical OHLCV rows
/dflow markets [n]       active DFlow prediction markets
/dflow quote [sol]       SOL -> USDC DFlow routing quote
/dark status             local Dark X402 Terminal readiness
/dark run                launch the nested Dark X402 Terminal
```

Paste any Solana address into the prompt and Clawd auto-detects it. Birdeye and Helius fan out in parallel and print the token, wallet, NFT, or supply context before an LLM step is spent.

## Environment

Create `.env`, `~/.clawd.env`, or `~/.config/openclawd/.env`:

```bash
OPENROUTER_API_KEY=
BIRDEYE_API_KEY=
FINANCIALDATASET_API_KEY=
DFLOW_API_KEY=
HELIUS_API_KEY=
HELIUS_RPC_URL=
DARK_DEFI_TERMINAL_PATH="/Users/8bit/Downloads/clawd-terminal/dark-ralph/dark defi terminal"

# Optional DFlow dev endpoints
# DFLOW_QUOTE_API_URL=https://dev-quote-api.dflow.net
# DFLOW_PREDICTION_API_URL=https://dev-prediction-markets-api.dflow.net
```

No private key is required for read-only market data. Trading or settlement flows should stay behind explicit wallet approval and AP2/x402 gateway policy.

## npm Ecosystem

The TUI is designed to sit with the broader OpenClawd package surface:

| Package | Purpose |
| --- | --- |
| `@openclawdsolana/clawd-tui` | OpenRouter-native terminal with Solana, markets, DFlow, and Helius context |
| `@openclawdsolana/clawd-code-cli` | Solana coding CLI and OpenClawd terminal runtime |
| `@openclawdsolana/clawdrouter` | LLM router with wallet-signed USDC micropayments |
| `@openclawdsolana/agents-x402` | x402 monetization for MCP servers and agent calls |
| `@openclawdsolana/agentwallet` | Encrypted Solana and EVM keypair vault |
| `@openclawdsolana/plugin-sdk` | Plugin SDK with OpenAPI, Zod, and attestation helpers |

Runtime packages used by this TUI are intentionally lean: `@openrouter/agent`, `@openrouter/sdk`, `glob`, `zod`, TypeScript, and native `fetch`.

## Runtime Shell

Read the integration guide for the full Solana Clawd Runtime Shell architecture:

- [Solana Clawd Runtime Shell - Integration Guide](./docs/solana-clawd-runtime-shell-integration.md)
- [Dark DeFi Terminal integration](./docs/dark-defi-terminal-integration.md)
- [One-shot OpenClawd bootstrap](./docs/one-shot-openclawd-bootstrap.md)
- [Solana-aware terminal v0.2](./docs/v0.2-solana-aware-terminal.md)
- [Steel + OpenAI CUA Ralph orchestrator](./docs/steel-openai-cua-ralph.md)

## Develop

```bash
git clone https://github.com/x402agent/solana-clawd.git
cd solana-clawd/clawd-tui
npm install
cp .env.example .env
npm run typecheck
npm start
```

Local OpenClawd workspaces commonly live across:

```text
/Users/8bit/openclawd/clawd-vault-master
/Users/8bit/openclawd/clawd-cloud-os
/Users/8bit/openclawd/clawdhub
/Users/8bit/openclawd/clawdrouter
/Users/8bit/openclawd/CLI
/Users/8bit/openclawd/docs
/Users/8bit/openclawd/llm-wiki-tang
/Users/8bit/openclawd/MCP
/Users/8bit/openclawd/NPM
/Users/8bit/openclawd/openclawd-stack
/Users/8bit/openclawd/OS
/Users/8bit/openclawd/packages
/Users/8bit/openclawd/services
/Users/8bit/openclawd/skills
/Users/8bit/openclawd/scripts
/Users/8bit/openclawd/plugin.delivery
/Users/8bit/openclawd/src
/Users/8bit/openclawd/tailclawd
/Users/8bit/openclawd/telegram
/Users/8bit/openclawd/workers
/Users/8bit/openclawd/x402-openrouter-main
```

## License

MIT. Powered by OpenClawd, Solana, OpenRouter, Birdeye, Helius, Financial Datasets, and DFlow.
