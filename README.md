# Stacks Finance

Prototype vault + strategy suite with a React frontend for contract interactions.

## Quick start
- Install dependencies: `npm install`
- Frontend dev server: `cd frontend` then `npm install` and `npm run dev`
- Build frontend: `cd frontend` then `npm run build`

## Networks
Frontend network is controlled by `frontend/.env`:
```
VITE_STACKS_NETWORK=testnet
```
Use `mainnet` for mainnet.

## Contracts
Contract names and paths are in `Clarinet.toml`. Deployment configs live in `settings/`.

Generate deployment plan:
```
clarinet deployments generate --testnet --medium-cost
```
Or:
```
clarinet deployments generate --mainnet --medium-cost
```

## Frontend contract config
Contract addresses and names used by the UI live in:
```
frontend/src/config/contracts.ts
```
Update the `address` and `name` for each contract after every deploy.

## How to use the dApp (drive)
1) Open the frontend and connect a wallet.
2) Go to **Contracts** and choose a module.
3) Fill in parameters and submit transactions.
4) Monitor status in the wallet and explorer.

## How to earn (test flow)
This repo ships a simplified vault flow:
- **Supply STX** via `vault-core` -> `deposit`
- **Withdraw STX** via `vault-core` -> `withdraw`
- **Allocate** to strategies via `vault-core` -> `allocate`

Note: there is no borrowing logic in the current contracts. Borrow/repay UI is only a placeholder until matching functions are implemented in Clarity.

## Safety notes
- These contracts are prototypes for testing. Do not deposit mainnet funds without a full audit.
- Contract names must be <= 40 chars. Use short suffixes when redeploying.

## Troubleshooting
- If you see "use of unresolved contract", update hard-coded contract names or redeploy with the expected names.
- If Clarinet fails to load a plan, delete the stale `deployments/default.*-plan.yaml` and regenerate.

