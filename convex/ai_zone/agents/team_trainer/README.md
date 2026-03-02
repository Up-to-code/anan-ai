# team_trainer

## Purpose
Self-improvement through conversation analysis and training data extraction.

## Agents
| Agent | Description |
|-------|------------|
| `anan_trainer` | Extracts learnable facts → pushes to recommendation RAG |

## Role Access
Available to: **Admin** only (runs automatically in background)

## How It Works
1. After each conversation, `anan_trainer` analyzes the exchange
2. Extracts useful facts (market data, area info, user patterns)
3. Pushes to `rag_recommendation` namespace (status: pending)
4. Admin reviews in dashboard → approves/rejects
5. Approved entries move to `rag_production` (active training data)

## How to Edit
- To change what gets extracted → edit `anan_trainer/config.ts` instructions
- To change extraction quality → adjust temperature or model
