# Solana Clawd Runtime Shell - Integration Guide

> Integration of NVIDIA OpenShell, nemoClawd, solana-clawd, ClawdRouter, and an agentic wallet for a unified Solana AI agent runtime.

## Architecture Overview

```text
SOLANA CLAWD RUNTIME SHELL
  OpenShell Sandbox
    Privy wallet auth
    nemoClawd CLI + xAI
    solana-clawd runtime + MCP server + OODA trading engine
    agentwallet-vault with AES-256 encrypted key storage

  MCP Tools
    Solana market data: solana_price, solana_trending, solana_wallet_pnl
    Helius: helius_account_info, helius_balance, helius_transactions
    Pump.fun: pump_token_scan, pump_buy_quote, pump_sell_quote
    Memory: memory_recall, memory_write
    Agent fleet: agent_spawn, agent_list, agent_stop

  Policy Engine
    Network: Solana RPC, Helius, Jupiter, Pump.fun, xAI, OpenRouter
    Filesystem: ~/.clawd, ~/.nemoclaw, ~/.config/clawd
    Process: solana-clawd, nemoclaw, npm, node
```

## Quick Start

```bash
npm i -g solana-clawd
npm install -g @mawdbotsonsolana/nemoclaw
npm install -g @openclawdsolana/clawd-tui
agentwallet serve --port 9099
clawd
```

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Yes | OpenRouter model access for the TUI agent loop |
| `HELIUS_API_KEY` | Yes | Helius RPC/DAS API key |
| `HELIUS_RPC_URL` | Optional | Helius mainnet RPC endpoint override |
| `BIRDEYE_API_KEY` | Yes | Solana token, wallet, and market data |
| `FINANCIALDATASET_API_KEY` | Optional | Equity and ETF snapshots/history |
| `DFLOW_API_KEY` | Optional | DFlow quote and prediction-market API access |
| `XAI_API_KEY` | Optional | Grok integration for nemoClawd/solana-clawd |
| `SOLANA_PRIVATE_KEY` | Optional | Trading key, never needed for read-only TUI commands |
| `PRIVY_APP_ID` | Optional | Privy app ID for wallet auth |

## OpenClawd x ClawdRouter Integration

A user logs into `solanaclawd.com` with Privy. The frontend calls `POST /v1/launch` with `monetize: true`. The orchestrator spawns an E2B sandbox from the Clawd template, registers the agent on-chain in `clawd-vault`, pins the manifest to IPFS, and mints an AP2 intent mandate signed by the orchestrator. The sandbox receives `CLAWD_MANDATE_JWT`, `CLAWD_OWNER_WALLET`, and `CLAWD_ROUTER_ORIGIN`.

Outbound sandbox payments use AP2. x402 and MPP remain available to browser/client flows where a user actively signs. Agents use AP2 because Privy-managed wallet secrets are not exposed inside the sandbox.

## Payment Environment Additions

```bash
ORCHESTRATOR_KEEPER_KEY=<base58 Solana secret>
CLAWD_VAULT_PROGRAM=<program id from anchor build>
CLAWD_REGISTRY_SEED=clawd-registry-v1
PINATA_JWT=<jwt>
GATEWAY_ORIGIN=https://solanaclawd.com
HELIUS_RPC=https://mainnet.helius-rpc.com/?api-key=...
USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

AP2_VERIFIER_JWK={"kty":"EC","crv":"P-256","x":"...","y":"..."}
CLAWD_ROUTER_ORIGIN=https://solanaclawd.com
```

## OODA Trading Loop

```text
OBSERVE  -> SOL price, trending, priority fees, memory KNOWN
ORIENT   -> score candidates by trend, momentum, liquidity, participation
DECIDE   -> confidence >= 60, then choose size band
ACT      -> trade execution gated by explicit approval
LEARN    -> write INFERRED signals, promote durable lessons to LEARNED
```

## DFlow Role

DFlow adds a production-grade Solana execution and prediction-market data layer:

- `GET /order` for SOL/USDC and other route-aware quotes
- `GET /tokens-with-decimals` and `GET /venues` for supported routing context
- `GET /api/v1/markets` and `GET /api/v1/trades` for live prediction-market intelligence
- `x-api-key` authentication via `DFLOW_API_KEY`

The TUI currently uses DFlow read-only endpoints for market pulse and quote previews. Transaction creation/signing should remain behind wallet approval and router policy.

## Security

1. Sandbox operations run under OpenShell/E2B policy.
2. Wallet material stays in Privy or encrypted agentwallet vaults.
3. Trades require explicit approval by default.
4. Provider keys are loaded from env and never printed.
5. `ORCHESTRATOR_KEEPER_KEY` pays fees only; it is not the user fund signer.
6. `AP2_VERIFIER_JWK` is public verifier material, not a secret.

## End-to-End Smoke Test

```bash
clawd
/markets
/dflow markets 5
/dflow quote 1
/quote NVDA
/trending 10
```

For monetized agents, verify launch, x402 inbound calls, AP2 outbound calls, earnings, and sweep flows against the ClawdRouter deployment before broad release.
