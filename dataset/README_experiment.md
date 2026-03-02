# Running LLM Experiment with Ollama

Use Ollama's OpenAI-compatible endpoint:

```powershell
$env:OPENAI_BASE_URL="http://localhost:11434/v1"
$env:OPENAI_API_KEY="ollama"
$env:OPENAI_MODEL="qwen2.5-coder:7b"
$env:OPENAI_TEMPERATURE="0.2"
$env:OPENAI_MAX_OUTPUT_TOKENS="4000"
```

Run one task:

```powershell
npm run experiment:task
```

Run one task with patch retries:

```powershell
node scripts/experiment/run_openai_experiment.js --task ex04 --patchRetries 2
```

Run one task with patch retries + files fallback:

```powershell
node scripts/experiment/run_openai_experiment.js --task ex04 --patchRetries 2 --fallbackMode files
```

Run three tasks:

```powershell
npm run experiment:run3
```

Run all tasks:

```powershell
npm run experiment:run
```

Equivalent explicit all-tasks form:

```powershell
node scripts/experiment/run_openai_experiment.js --task all --patchRetries 2
```

Notes:
- The model output should be a unified git diff patch.
- If patch format is invalid, task will be recorded as `PATCH_FAILED`.
