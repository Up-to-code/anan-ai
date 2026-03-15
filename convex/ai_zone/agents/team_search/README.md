# team_search

## Purpose
Handles all property search and web data retrieval tasks.

## Agents
| Agent | Description |
|-------|------------|
| `anan_search` | Searches properties by area, price, type, amenities |
| `anan_web` | Scrapes web for market data, news, external info |

## Role Access
Available to: **User**, **Broker**, **Admin**

## How to Edit
- To change search behavior → edit `convex/ai_zone/agents/anan/orchestrationConfig.ts`
- To add a new search tool → create file in `anan_search/tools/`, import in config
- To add a new web scraper → create file in `anan_web/tools/`, import in config
