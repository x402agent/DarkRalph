# Steel + OpenAI CUA Ralph Orchestrator

This Node/TypeScript example wires a Ralph orchestrator using OpenAI Responses to Steel's Computer API execution loop.

## What It Demonstrates

- Steel session creation and release
- screenshot -> model decision -> browser action loop
- OpenAI/GPT normalized coordinates (`0..1000`) mapped to Steel pixel coordinates
- actions: move, click, double-click, scroll, type, key, wait, screenshot

## Prerequisites

- Node.js 20+
- Steel API key
- OpenAI API key with access to the configured GPT model

## Setup

```bash
cd examples/steel-openai-ralph-cua
npm install
cp .env.example .env
```

Edit `.env`:

```env
STEEL_API_KEY=your_steel_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
TASK=Go to steel.dev and summarize the latest news
OPENAI_MODEL=gpt-5.5
```

## Run

```bash
npm run dev
```

Expected output:

- Steel session viewer URL
- step-by-step action logs
- final task output
- session release confirmation

## Notes

- The implementation uses the OpenAI `/v1/responses` endpoint and expects a JSON action response each turn.
- If model output format differs, adjust `parseActionFromText()` in `main.ts`.
- Coordinate conversion happens in `normalizedToPixel()`.
