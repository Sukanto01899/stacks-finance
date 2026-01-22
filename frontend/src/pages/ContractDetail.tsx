import { useMemo, useState } from "react";
import { openContractCall } from "@stacks/connect";
import { PostConditionMode, type PostCondition } from "@stacks/transactions";
import { Link, useParams } from "react-router-dom";
import { contractMap } from "../config/contracts";
import type { ContractAction } from "../config/contracts";
import { toClarityValue } from "../lib/clarity";
import { networkLabel, STACKS_NETWORK, stacksNetwork } from "../lib/stacks";
import { getUserAddress } from "../lib/wallet";

type ActionState = Record<string, Record<string, string>>;
type ActionStatus = Record<string, string | null>;

function ContractDetailPage() {
  const { contractId } = useParams();
  const contract = contractId ? contractMap[contractId] : undefined;
  const [formState, setFormState] = useState<ActionState>({});
  const [actionStatus, setActionStatus] = useState<ActionStatus>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});

  const appDetails = useMemo(
    () => ({
      name: "Stacks Finance",
      icon: "https://stacks.co/favicon.ico",
    }),
    [],
  );

  const updateField = (actionId: string, key: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [actionId]: {
        ...prev[actionId],
        [key]: value,
      },
    }));
  };

  const handleSubmit = (action: ContractAction) => {
    if (!contract) {
      return;
    }
    if (!contract.address) {
      setActionStatus((prev) => ({
        ...prev,
        [action.id]: "Set the contract address in config before sending.",
      }));
      return;
    }
    setSubmitting((prev) => ({ ...prev, [action.id]: true }));
    setActionStatus((prev) => ({ ...prev, [action.id]: null }));
    try {
      const values = formState[action.id] ?? {};
      const functionArgs = action.params.map((param) =>
        toClarityValue(param.type, values[param.key] ?? ""),
      );
      const postConditions: PostCondition[] = (action.postConditions ?? []).map(
        (preset) => {
        const rawAmount = values[preset.amountParam];
        if (!rawAmount) {
          throw new Error(
            `Enter a value for ${preset.amountParam} to build post-conditions.`,
          );
        }
        if (!/^\d+$/.test(rawAmount)) {
          throw new Error("Post-condition amounts must be uint values.");
        }
        const address =
          preset.principal === "origin"
            ? "origin"
            : `${contract.address}.${contract.name}`;
        return {
          type: "stx-postcondition",
          address,
          condition: preset.direction === "sent" ? "lte" : "gte",
          amount: rawAmount,
        } as PostCondition;
      },
      );
      if (action.postConditions?.length) {
        const originAddress = getUserAddress(STACKS_NETWORK);
        if (!originAddress) {
          throw new Error("Connect a wallet before sending this transaction.");
        }
      }
      openContractCall({
        appDetails,
        contractAddress: contract.address,
        contractName: contract.name,
        functionName: action.functionName,
        functionArgs,
        network: stacksNetwork,
        postConditionMode: PostConditionMode.Deny,
        postConditions,
        onFinish: (data) => {
          setSubmitting((prev) => ({ ...prev, [action.id]: false }));
          setActionStatus((prev) => ({
            ...prev,
            [action.id]: data?.txId
              ? `Submitted: ${data.txId}`
              : "Transaction submitted.",
          }));
        },
        onCancel: () => {
          setSubmitting((prev) => ({ ...prev, [action.id]: false }));
          setActionStatus((prev) => ({
            ...prev,
            [action.id]: "Transaction cancelled.",
          }));
        },
      });
    } catch (error: any) {
      setSubmitting((prev) => ({ ...prev, [action.id]: false }));
      setActionStatus((prev) => ({
        ...prev,
        [action.id]: error?.message ?? "Unable to prepare transaction.",
      }));
    }
  };

  if (!contract) {
    return (
      <section className="stack">
        <div className="panel">
          <h2>Contract not found</h2>
          <p>The selected contract is not configured yet.</p>
          <Link className="ghost-button" to="/contracts">
            Back to contracts
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="stack">
      <div className="section-header">
        <div>
          <p className="eyebrow">Contract detail</p>
          <h2>{contract.label}</h2>
          <p className="lede">{contract.description}</p>
        </div>
        <div className="meta-stack">
          <div>
            <p className="meta-label">Network</p>
            <p className="meta-value">{networkLabel}</p>
          </div>
          <div>
            <p className="meta-label">Address</p>
            <p className="meta-value">
              {contract.address ? contract.address : "Set in config"}
            </p>
          </div>
          <Link className="ghost-button" to="/contracts">
            Back to contracts
          </Link>
        </div>
      </div>

      <div className="action-grid">
        {contract.actions.map((action) => {
          const values = formState[action.id] ?? {};
          const status = actionStatus[action.id];
          return (
            <article key={action.id} className="panel action-card">
              <div className="action-header">
                <div>
                  <h3>{action.label}</h3>
                  <p className="lede">{action.description}</p>
                </div>
                <span className="badge">{action.functionName}</span>
              </div>
              <div className="form-grid">
                {action.params.map((param) => (
                  <label key={param.key} className="form-field">
                    <span>{param.label}</span>
                    <input
                      className="input"
                      type="text"
                      placeholder={param.placeholder}
                      value={values[param.key] ?? ""}
                      onChange={(event) =>
                        updateField(action.id, param.key, event.target.value)
                      }
                    />
                  </label>
                ))}
              </div>
              <div className="action-footer">
                <button
                  className="cta-button"
                  type="button"
                  onClick={() => handleSubmit(action)}
                  disabled={submitting[action.id]}
                >
                  {submitting[action.id] ? "Submitting..." : "Send transaction"}
                </button>
                {status ? <span className="status">{status}</span> : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default ContractDetailPage;
