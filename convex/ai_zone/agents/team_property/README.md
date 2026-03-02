# team_property

## Purpose
Property matching, comparison, analysis, and personalized recommendations.

## Agents
| Agent | Description |
|-------|------------|
| `anan_property` | Matches properties to criteria, compares options side-by-side |
| `anan_recommender` | Generates personalized suggestions using user knowledge base |

## Role Access
Available to: **User**, **Broker**, **RED**, **Admin**

## How to Edit
- To change matching logic → edit `anan_property/config.ts` instructions
- To change recommendation criteria → edit `anan_recommender/config.ts`
- To add new property analysis tools → create in `anan_property/tools/`
