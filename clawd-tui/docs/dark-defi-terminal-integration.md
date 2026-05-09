# Dark DeFi Terminal Integration

This bridge lets OpenClawd TUI discover and launch the local Dark X402 Terminal checkout without vendoring the whole nested repository into the npm package.

Default local path:

```text
/Users/8bit/Downloads/clawd-terminal/dark-ralph/dark defi terminal
```

Override with:

```bash
DARK_DEFI_TERMINAL_PATH="/path/to/dark defi terminal"
```

## Why It Is Bridged, Not Copied

The Dark DeFi tree includes its own repo, dependencies, terminal runtime, protocol SDK, TradingView examples, and credential-looking local files. OpenClawd TUI treats it as a sibling runtime:

- safe metadata is read from package files
- `.env`, Google OAuth client JSON, and x402 credential JSON are never read or printed
- launch/build happens inside `dark defi terminal/terminal`
- the published TUI package stays small and dependency-light

## Commands

```text
/dark status   show local integration readiness
/dark docs     print useful Dark DeFi doc paths
/dark path     print the configured root path
/dark build    run npm run build in dark defi terminal/terminal
/dark run      run npm start in dark defi terminal/terminal
```

`/dark run` starts the nested interactive Dark X402 Terminal. Exit that process to return to the Clawd prompt.

## Imported Capabilities

The first integration pass maps the Dark runtime into Clawd as an operator-controlled sub-terminal:

| Dark DeFi area | Local path | Integration state |
| --- | --- | --- |
| X402 terminal UI | `terminal/` | launch/build bridge |
| Protocol SDK | `Protocol/` | discovered and documented |
| TypeScript SDK | `sdk/typescript/` | discovered and documented |
| TradingView examples | `tradingview-example-js-api*` | reference only |
| Docs | `docs/`, `QUICKSTART.md`, `DARK_X402_TERMINAL.md` | doc bridge |

## Security Notes

- Do not commit `.env`.
- Do not commit `client_secret_*.json`.
- Do not commit `x402-*.json`.
- Do not copy hardcoded API keys from example websocket/dashboard files into the TUI.
- Wallet creation, mnemonic import, swaps, shielding, and private transfers remain inside the Dark X402 Terminal where the user explicitly launches the runtime.

## Next Integration Steps

1. Extract a read-only Dark Protocol adapter for status, network, and program metadata.
2. Replace hardcoded example websocket credentials with env-only config in the Dark runtime.
3. Add an optional `@openclawdsolana/dark-defi-adapter` package once the bridge stabilizes.
4. Wire Dark swap quotes into the existing `/markets` pulse as read-only previews.
5. Gate all wallet/signing actions behind explicit approval and AP2/x402 policy.
