# SKILL - Frugal AI Reviewer

> **Version:** 1.0  
> **Last updated:** 2026-05-19  
> **Agent targets:** Claude, GitHub Copilot, ChatGPT, Cursor, or any LLM  
> **File name:** `SKILL_review_frugal_ai.md`  
> **Description:** Use when: frugal AI review; sustainable AI; green AI; RGESN algorithmie; AI energy efficiency; LLM cost and token reduction; model inference optimization; ML training sobriety; RAG efficiency; fine-tuning justification; AI carbon measurement.

---

## Purpose

Review AI, ML, LLM, RAG, or agentic features for digital sobriety, resource efficiency, and RGESN
Algorithmie evidence, then produce concrete risks, fixes, and measurement steps.

---

## Trigger

This skill is activated when:

- The user asks whether an AI, ML, LLM, RAG, or agent feature is environmentally efficient
- A code review includes model inference, training, fine-tuning, embeddings, vector search, or GPU usage
- The user asks to reduce tokens, inference cost, model size, latency, retraining, or AI compute
- The user mentions "RGESN Algorithmie", "frugal AI", "green AI", "sustainable AI", "AI sobriety", or "IA frugale"
- A project needs evidence for RGESN criteria related to algorithmic complexity, training, data minimization, or retraining

---

## Source of Truth

The agent **must** consult the following references before producing findings.  
It must **never** invent official criteria, rule IDs, or measurement claims.

| Source | URL |
|---|---|
| RGESN 2024 publication page | https://ecoresponsable.numerique.gouv.fr/publications/referentiel-general-ecoconception/ |
| RGESN 2024 PDF | https://ecoresponsable.numerique.gouv.fr/docs/2024/rgesn-mai2024/referentiel_general_ecoconception_des_services_numeriques_version_2024.pdf |
| Creedengo rules support matrix | https://github.com/green-code-initiative/creedengo-rules-specifications/blob/main/RULES.md |
| Creedengo rule specifications | `https://github.com/green-code-initiative/creedengo-rules-specifications/blob/main/src/main/rules/<RULE_ID>/` |
| Green Software Foundation SCI | https://greensoftware.foundation/standards/sci/ |
| W3C Web Sustainability Guidelines | https://www.w3.org/TR/web-sustainability-guidelines/ |

---

## Instructions

Execute the following steps **in order**. Do not skip any step.

1. **Scope the AI feature**  
   Identify the AI task, user value, model provider or framework, model size when available, inference path,
   training or fine-tuning process, embedding and retrieval flow, data sources, hardware, hosting region,
   request volume, latency target, and quality target. If these are missing, state the assumptions.

2. **Challenge the need for AI**  
   Compare the AI approach against simpler alternatives: rules, search, SQL, deterministic parsing,
   smaller model, retrieval-only flow, cached answer, batch process, or human validation. Do not recommend
   removing AI unless the simpler alternative satisfies the stated user value.

3. **Load RGESN Algorithmie criteria**  
   Consult the official RGESN source and use the current official wording for Algorithmie criteria.
   Also check Backend, Architecture, Frontend, Hosting, and Strategy criteria when the AI feature affects
   data transfer, cache, user control, hosting, or service utility.

4. **Scan the implementation**  
   When code is available, search for:
   - model loading and selection
   - training loops and fine-tuning scripts
   - inference calls
   - prompt construction
   - token limits
   - streaming and batching
   - retries and timeouts
   - caching or memoization
   - embeddings and chunking
   - vector search and reranking
   - data loading and column selection
   - GPU, CPU, TPU, or cloud region configuration
   - telemetry for latency, token use, energy proxy, cost, and quality

5. **Check Creedengo data and AI rules**  
   Consult `RULES.md` and relevant rule specifications before reporting a Creedengo finding.
   Typical families to verify include unnecessary data loading, inefficient data formats, PyTorch inference,
   training data handling, cache without limits, and redundant computation. Report only verified rule IDs.

6. **Assess frugality risks**  
   Evaluate each risk using:
   - `Need` - the feature may not require AI or may require a smaller method
   - `Model` - the selected model is larger or more expensive than required
   - `Data` - training, context, embeddings, or retrieval load unnecessary data
   - `Inference` - calls are redundant, uncached, oversized, or poorly bounded
   - `Training` - training or fine-tuning is unjustified, too frequent, or unmeasured
   - `Operations` - hosting region, hardware, batch strategy, or monitoring is missing

7. **Recommend fixes**  
   For each finding, propose the smallest safe change first. Prefer changes that preserve product quality:
   prompt compaction, output schema, lower token ceiling, response cache, semantic cache, smaller model
   fallback, selective retrieval, data column pruning, batching, `torch.no_grad()`, quantization when suitable,
   stop conditions, retry limits, model reuse, and explicit quality thresholds.

8. **Define measurement plan**  
   Do not estimate carbon impact without data. Instead, propose measurable indicators:
   - requests per functional unit
   - input and output tokens
   - model calls per user journey
   - latency
   - CPU/GPU time
   - memory
   - cache hit rate
   - quality metric
   - SCI functional unit when enough energy and carbon-intensity data are available

9. **Self-check before responding** *(mandatory - never skip)*  
   Verify: every RGESN mapping uses official criteria, every Creedengo rule ID exists and applies to the
   language, every recommendation preserves user value, no CO2 claim is made without data, and no security,
   privacy, accessibility, or safety control is weakened.

---

## Fallback Behavior

| Situation | Agent action |
|---|---|
| AI feature scope is unclear | Ask the user: "Which AI feature, model, data flow, and user journey should be reviewed?" |
| Official RGESN or Creedengo sources are unreachable | Inform the user; do not report official criteria or rule IDs from memory |
| No code is available | Produce a design-level frugal AI checklist and evidence request |
| No measurement data exists | Produce a baseline measurement plan instead of carbon or energy claims |
| Simpler alternative is plausible but uncertain | Mark it as a hypothesis and recommend an A/B quality and cost comparison |

---

## Output Format

The agent **must** produce output in exactly this structure:

    # Frugal AI Review

    Feature:
    Scope:
    Model / provider:
    Data sources:
    Sources consulted:

    ## Decision
    Verdict: <Acceptable | Acceptable with changes | High risk | Insufficient evidence>
    Short rationale:

    ## Findings
    | ID | Category | Severity | Evidence | Impact | Recommendation | RGESN mapping | Creedengo mapping |
    |---|---|---|---|---|---|---|---|

    ## Simpler Alternative Check
    Current AI approach:
    Candidate simpler approach:
    Quality risk:
    Recommended experiment:

    ## Measurement Plan
    Functional unit:
    Metrics to capture:
    Baseline command or instrumentation:
    Target:

    ## Evidence Needed
    - <missing evidence>

    ## Self-check
    - Official RGESN criteria used: <yes/no>
    - Creedengo IDs verified: <yes/no/not applicable>
    - No unsupported CO2 claim: <yes/no>
    - User value preserved: <yes/no>

### When no code is available

    # Frugal AI Design Checklist

    Feature:
    Current assumptions:

    Questions to answer:
    - <question>

    Required evidence before implementation:
    - <evidence>

    Minimum frugality controls:
    - <control>

---

## Constraints

The agent **must never**:

- [ ] Claim an AI feature is sustainable, green, or compliant without evidence
- [ ] Invent RGESN Algorithmie wording or Creedengo rule IDs
- [ ] Recommend removing AI without checking whether a simpler solution preserves user value
- [ ] Estimate CO2, water, or energy impact without a documented method and input data
- [ ] Optimize token or energy use by weakening safety, privacy, security, accessibility, or correctness
- [ ] Expose prompts, API keys, personal data, training data, or secrets in the output
- [ ] Report a Creedengo finding without checking the official rule specification
- [ ] Produce output in a format different from the one defined in Output Format

---

## Examples

### Example 1 - PyTorch inference without no_grad

**Input:**

    Review this Python inference endpoint for frugal AI:

    def classify(text):
        logits = model(tokenizer(text, return_tensors="pt").input_ids)
        return logits.argmax().item()

**Expected output:**

    # Frugal AI Review

    Feature: Text classification endpoint
    Scope: Python inference snippet only
    Model / provider: local PyTorch model, size unknown
    Data sources: single text input
    Sources consulted: RGESN Algorithmie, Creedengo rules support matrix

    ## Decision
    Verdict: Acceptable with changes
    Short rationale: inference is synchronous and lacks evidence of disabled gradient tracking,
    token limits, batching, and measurement.

    ## Findings
    | ID | Category | Severity | Evidence | Impact | Recommendation | RGESN mapping | Creedengo mapping |
    |---|---|---|---|---|---|---|---|
    | AI-1 | Inference | Major | `model(...)` is called without visible `torch.no_grad()` | Unnecessary gradient tracking can increase memory and compute during inference | Wrap inference in `with torch.no_grad():` and set model to eval mode | Use official Algorithmie criteria after verification | Verify current PyTorch inference rule in Creedengo before citing its ID |

### Example 2 - No measurement data

**Input:**

    Is our LLM chatbot green?

**Expected output:**

    # Frugal AI Design Checklist

    Feature: LLM chatbot
    Current assumptions: model, traffic, token volume, cache rate, hosting, and quality target not provided

    Questions to answer:
    - Which model and provider are used?
    - What is one functional unit: one message, one resolved conversation, or one user session?
    - What are the average input tokens, output tokens, retries, and calls per session?

    Required evidence before implementation:
    - token logs by route
    - model call count per user journey
    - quality metric and acceptable degradation threshold

    Minimum frugality controls:
    - max input and output tokens
    - retry limits
    - prompt compaction
    - response or semantic cache where safe

---

## Related Skills

| Skill file | Relationship |
|---|---|
| `SKILL_build_rgesn_evidence.md` | Uses Frugal AI Review output as evidence for RGESN Algorithmie criteria |
| `SKILL_green_code_review.md` | Provides language-specific Creedengo findings that may overlap with AI/data efficiency |
| `SKILL_contribute_creedengo_rule.md` | Helps propose new Creedengo rules when recurring AI frugality issues are not covered |

---

## Notes

- Treat AI sustainability as a product, architecture, data, and operations question, not only a code question.
- Prefer measurement and baselines over vague claims.
- A smaller model is not automatically better if it causes repeated retries, lower task completion, or more total calls.

---

## Changelog

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-19 | Initial version |
