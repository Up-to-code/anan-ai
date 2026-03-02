# team_finance

## Purpose
Mortgage calculations, financing comparison, and bank product information.

## Agents
| Agent | Description |
|-------|------------|
| `anan_finance` | Calculates mortgages, installments, affordability |
| `anan_banks` | Retrieves bank products, checks eligibility, compares offerings |

## Role Access
Available to: **User**, **Admin** (limited for Broker)

## How to Edit
- To update financial formulas → edit tools in `anan_finance/tools/`
- To add new bank products → update `anan_banks/tools/`
- Settings use low temperature (0.1) for precision
