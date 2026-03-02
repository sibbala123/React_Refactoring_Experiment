import fs from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { generatePatch } from './openai_client.js'

const RESULTS_CSV_HEADER =
  'id,smell,attempts_used,patch_mode,patch_status,build_status,diff_status,added,removed,geometryChanges,styleChanges,orderChanges,commit_hash'

function getCliArg(flag, argv = process.argv.slice(2)) {
  const idx = argv.indexOf(flag)
  if (idx === -1) return ''
  return argv[idx + 1] || ''
}

function getNumberSetting(cliValue, envValue, fallback) {
  if (cliValue) {
    const parsed = Number(cliValue)
    if (Number.isFinite(parsed)) return parsed
  }
  if (envValue) {
    const parsed = Number(envValue)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function escapeCsv(value) {
  const text = value == null ? '' : String(value)
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true })
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw)
}

async function readFileSafe(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8')
  } catch {
    return ''
  }
}

function runCommand(command, args, options = {}) {
  const cwd = options.cwd || process.cwd()
  const env = options.env || process.env
  const shell = options.shell ?? false
  const isWinNpm = process.platform === 'win32' && command === 'npm'
  const resolvedCommand = isWinNpm ? 'cmd.exe' : command
  const resolvedArgs = isWinNpm ? ['/d', '/s', '/c', 'npm', ...args] : args
  return new Promise((resolve) => {
    const child = spawn(resolvedCommand, resolvedArgs, { cwd, env, shell })
    let stdout = ''
    let stderr = ''
    let resolved = false
    const done = (payload) => {
      if (resolved) return
      resolved = true
      resolve(payload)
    }
    child.stdout?.on('data', (d) => {
      stdout += String(d)
    })
    child.stderr?.on('data', (d) => {
      stderr += String(d)
    })
    child.on('error', (error) => {
      done({
        code: 1,
        stdout,
        stderr: `${stderr}\n${String(error?.message || error)}`.trim(),
        command: `${resolvedCommand} ${resolvedArgs.join(' ')}`.trim(),
      })
    })
    child.on('close', (code) => {
      done({ code: code ?? 1, stdout, stderr, command: `${resolvedCommand} ${resolvedArgs.join(' ')}`.trim() })
    })
  })
}

function parseCsvLines(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length < 2) return []
  const rows = []
  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i]
    const cells = []
    let current = ''
    let inQuotes = false
    for (let j = 0; j < line.length; j += 1) {
      const ch = line[j]
      if (ch === '"') {
        if (inQuotes && line[j + 1] === '"') {
          current += '"'
          j += 1
        } else {
          inQuotes = !inQuotes
        }
      } else if (ch === ',' && !inQuotes) {
        cells.push(current)
        current = ''
      } else {
        current += ch
      }
    }
    cells.push(current)
    if (cells.length >= 3) {
      rows.push({
        codeSmell: cells[0],
        possibleRefactoring: cells[1],
        definition: cells[2],
      })
    }
  }
  return rows
}

function selectTasks(tasks, { limit, taskId, startAt }) {
  let selected = [...tasks]
  if (taskId && taskId.toLowerCase() !== 'all') {
    selected = selected.filter((t) => t.id === taskId)
  } else if (startAt) {
    const idx = selected.findIndex((t) => t.id === startAt)
    if (idx >= 0) selected = selected.slice(idx)
  }
  if (limit > 0) selected = selected.slice(0, limit)
  return selected
}

function buildAllowedRefactorings(specRows, smell) {
  const rows = specRows.filter((row) => row.codeSmell === smell)
  return rows.map((row) => `- ${row.possibleRefactoring}: ${row.definition}`).join('\n')
}

function extractUnifiedDiff(rawText) {
  if (!rawText) return ''
  const normalized = rawText.replace(/\r\n/g, '\n')
  const beginMarker = 'BEGIN_UNIFIED_DIFF'
  const endMarker = 'END_UNIFIED_DIFF'
  const beginIdx = normalized.indexOf(beginMarker)
  const endIdx = normalized.indexOf(endMarker)
  if (beginIdx >= 0 && endIdx > beginIdx) {
    const inside = normalized
      .slice(beginIdx + beginMarker.length, endIdx)
      .trim()
    return extractUnifiedDiff(inside)
  }
  const diffIdx = normalized.indexOf('diff --git ')
  if (diffIdx >= 0) {
    return normalized.slice(diffIdx).trim()
  }
  const lines = normalized.split('\n')
  let start = -1
  for (let i = 0; i < lines.length - 1; i += 1) {
    if (lines[i].startsWith('--- a/') && lines[i + 1].startsWith('+++ b/')) {
      start = i
      break
    }
  }
  if (start >= 0) {
    return lines.slice(start).join('\n').trim()
  }
  return ''
}

function truncateContext(chunks, maxChars = 80000) {
  let total = 0
  const kept = []
  for (const chunk of chunks) {
    if (total >= maxChars) break
    const remaining = maxChars - total
    if (chunk.length <= remaining) {
      kept.push(chunk)
      total += chunk.length
    } else {
      kept.push(`${chunk.slice(0, remaining)}\n\n[TRUNCATED]\n`)
      total += remaining
    }
  }
  return kept.join('\n')
}

async function buildCodeContext(cwd, files) {
  const sections = []
  for (const rel of files) {
    if (!rel) continue
    const abs = path.join(cwd, rel)
    const content = await readFileSafe(abs)
    if (!content) continue
    sections.push(`===== FILE: ${rel} =====\n${content}\n`)
  }
  return truncateContext(sections, 80000)
}

function summarizeDiffReport(diffReport) {
  const totals = {
    added: 0,
    removed: 0,
    geometryChanges: 0,
    styleChanges: 0,
    orderChanges: 0,
  }
  const routes = Array.isArray(diffReport?.routes) ? diffReport.routes : []
  for (const route of routes) {
    totals.added += Number(route?.summary?.added || 0)
    totals.removed += Number(route?.summary?.removed || 0)
    totals.geometryChanges += Number(route?.summary?.geometryChanges || 0)
    totals.styleChanges += Number(route?.summary?.styleChanges || 0)
    totals.orderChanges += Number(route?.summary?.orderChanges || 0)
  }
  return totals
}

function buildStrictRetryPrompt({ taskId, smell, allowedRefactorings, filesList, codeContext }) {
  return [
    `Task: ${taskId}`,
    `Target smell: ${smell}`,
    '',
    'Your last response could not be applied.',
    'Output ONLY a valid unified git diff patch.',
    '',
    'Formatting checklist:',
    '- must start with: diff --git a/... b/...',
    '- include --- a/... and +++ b/...',
    '- include @@ hunks',
    '- no prose, no markdown, no explanation',
    '- use exact file paths from FILES_LIST',
    '- do not include index lines',
    '',
    'Preferred wrapper:',
    'BEGIN_UNIFIED_DIFF',
    '<unified diff here>',
    'END_UNIFIED_DIFF',
    '',
    'Allowed refactorings (choose ONLY from this list):',
    allowedRefactorings || '- (none)',
    '',
    'FILES_LIST:',
    filesList || '- (none)',
    '',
    'CODE_CONTEXT:',
    codeContext || '[No code context found]',
  ].join('\n')
}

function buildFilesFallbackPrompt({ taskId, smell, allowedRefactorings, filesList, codeContext }) {
  return [
    `Task: ${taskId}`,
    `Target smell: ${smell}`,
    '',
    'Output full file replacements ONLY.',
    'No prose, no explanation.',
    'Use this exact format for each file:',
    'FILE: <path>',
    '```<lang>',
    '<full file content>',
    '```',
    '',
    'Only include files from FILES_LIST.',
    '',
    'Allowed refactorings (choose ONLY from this list):',
    allowedRefactorings || '- (none)',
    '',
    'FILES_LIST:',
    filesList || '- (none)',
    '',
    'CODE_CONTEXT:',
    codeContext || '[No code context found]',
  ].join('\n')
}

function parseFileReplacementBlocks(text) {
  if (!text) return []
  const normalized = text.replace(/\r\n/g, '\n')
  const re = /FILE:\s*([^\n]+)\n```[^\n]*\n([\s\S]*?)\n```/g
  const blocks = []
  let match
  while ((match = re.exec(normalized)) !== null) {
    blocks.push({
      file: (match[1] || '').trim(),
      content: match[2] || '',
    })
  }
  return blocks
}

function buildTaskDescription(task) {
  const routes = Array.isArray(task?.routes) ? task.routes.join(', ') : ''
  const states = Array.isArray(task?.states) ? task.states.join(', ') : ''
  return [
    `Refactor task ${task.id} for smell "${task.smell}".`,
    routes ? `Relevant routes: ${routes}.` : '',
    states ? `Relevant states: ${states}.` : '',
    'Preserve user-visible behavior while reducing the smell.',
  ]
    .filter(Boolean)
    .join(' ')
}

function isSafeRelativeFile(repoRoot, relPath, allowedSet) {
  if (!relPath) return false
  if (path.isAbsolute(relPath)) return false
  const normalized = relPath.replace(/\\/g, '/')
  if (normalized.startsWith('../') || normalized.includes('/../')) return false
  const abs = path.resolve(repoRoot, normalized)
  const root = path.resolve(repoRoot)
  if (!abs.startsWith(root)) return false
  if (allowedSet.has(normalized)) return true
  return false
}

async function appendFile(filePath, text) {
  await fs.appendFile(filePath, text, 'utf8')
}

function shortError(stderr, stdout) {
  const text = `${stderr || ''}\n${stdout || ''}`.trim()
  if (!text) return ''
  return text.slice(-1200)
}

async function logCommand(logPath, result) {
  const body = [
    `\n$ ${result.command}`,
    `exit=${result.code}`,
    result.stdout ? `stdout:\n${result.stdout.slice(-3000)}` : '',
    result.stderr ? `stderr:\n${result.stderr.slice(-3000)}` : '',
    '',
  ]
    .filter(Boolean)
    .join('\n')
  await appendFile(logPath, body)
}

async function runTask(task, ctx) {
  const {
    cwd,
    specRows,
    promptTemplate,
    resultsCsvPath,
    runResults,
  } = ctx
  const taskDir = path.join(cwd, 'dataset', task.id)
  await ensureDir(taskDir)
  const logPath = path.join(taskDir, 'run.log')
  await fs.writeFile(logPath, `Task ${task.id}\n`, 'utf8')

  let patchStatus = 'NOT_RUN'
  let buildStatus = 'NOT_RUN'
  let diffStatus = 'NOT_RUN'
  let attemptsUsed = 0
  let patchMode = 'none'
  let commitHash = ''
  let counts = { added: '', removed: '', geometryChanges: '', styleChanges: '', orderChanges: '' }

  const beforeDir = path.join(taskDir, 'before')
  const afterDir = path.join(taskDir, 'after')
  const reportPath = path.join(taskDir, 'truth_diff_report.json')
  const outputPath = path.join(taskDir, 'openai_output.txt')
  const patchPath = path.join(taskDir, 'refactor.patch')

  const recordAndReturn = async (errorLabel = '') => {
    const row = [
      task.id,
      task.smell,
      attemptsUsed,
      patchMode,
      patchStatus,
      buildStatus,
      diffStatus,
      counts.added,
      counts.removed,
      counts.geometryChanges,
      counts.styleChanges,
      counts.orderChanges,
      commitHash,
    ]
      .map(escapeCsv)
      .join(',')
    await appendFile(resultsCsvPath, `${row}\n`)

    runResults.push({
      id: task.id,
      smell: task.smell,
      attempts_used: attemptsUsed,
      patch_mode: patchMode,
      before_branch: task.before_branch,
      after_branch: task.after_branch,
      patch_status: patchStatus,
      build_status: buildStatus,
      diff_status: diffStatus,
      counts,
      commit_hash: commitHash,
      error: errorLabel,
      log: path.relative(cwd, logPath),
      artifacts: {
        before: path.relative(cwd, beforeDir),
        after: path.relative(cwd, afterDir),
        report: path.relative(cwd, reportPath),
      },
    })
  }

  const checkoutBefore = await runCommand('git', ['checkout', task.before_branch], { cwd })
  await logCommand(logPath, checkoutBefore)
  if (checkoutBefore.code !== 0) {
    patchStatus = 'CHECKOUT_BEFORE_FAILED'
    buildStatus = 'SKIPPED'
    diffStatus = 'SKIPPED'
    await recordAndReturn(shortError(checkoutBefore.stderr, checkoutBefore.stdout))
    return
  }

  const captureBefore = await runCommand('npm', ['run', 'capture:one', '--', '--out', beforeDir], { cwd })
  await logCommand(logPath, captureBefore)
  if (captureBefore.code !== 0) {
    patchStatus = 'BASELINE_CAPTURE_FAILED'
    buildStatus = 'SKIPPED'
    diffStatus = 'SKIPPED'
    await recordAndReturn(shortError(captureBefore.stderr, captureBefore.stdout))
    return
  }

  let filesResult = await runCommand('git', ['diff', '--name-only', 'main...HEAD'], { cwd })
  await logCommand(logPath, filesResult)
  let files = filesResult.stdout.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
  if (filesResult.code !== 0 || files.length === 0) {
    filesResult = await runCommand('git', ['diff', '--name-only', 'master...HEAD'], { cwd })
    await logCommand(logPath, filesResult)
    files = filesResult.stdout.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
  }
  if (files.length === 0) {
    filesResult = await runCommand('git', ['diff', '--name-only', 'HEAD~1..HEAD'], { cwd })
    await logCommand(logPath, filesResult)
    files = filesResult.stdout.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
  }

  const codeContext = await buildCodeContext(cwd, files)
  const allowedRefactorings = buildAllowedRefactorings(specRows, task.smell)
  const filesListText = files.length ? files.map((f) => `- ${f}`).join('\n') : '- (none)'
  const promptText = promptTemplate
    .replaceAll('{{TASK_ID}}', task.id)
    .replaceAll('{{SMELL}}', task.smell)
    .replaceAll('{{TASK_DESCRIPTION}}', buildTaskDescription(task))
    .replaceAll('{{ALLOWED_REFACTORINGS}}', allowedRefactorings || '- (none)')
    .replaceAll('{{FILES_LIST}}', filesListText)
    .replaceAll('{{CODE_CONTEXT}}', codeContext || '[No code context found]')

  const checkoutAfter = await runCommand('git', ['checkout', task.after_branch], { cwd })
  await logCommand(logPath, checkoutAfter)
  if (checkoutAfter.code !== 0) {
    patchStatus = 'CHECKOUT_AFTER_FAILED'
    buildStatus = 'SKIPPED'
    diffStatus = 'SKIPPED'
    await recordAndReturn(shortError(checkoutAfter.stderr, checkoutAfter.stdout))
    return
  }

  const patchRetries = Math.max(0, Math.floor(ctx.patchRetries))
  const fallbackMode = ctx.fallbackMode
  const maxAttempts = 1 + patchRetries
  let patchApplied = false
  let patchError = ''

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    attemptsUsed = attempt
    const retryPrompt =
      attempt === 1
        ? promptText
        : buildStrictRetryPrompt({
            taskId: task.id,
            smell: task.smell,
            allowedRefactorings,
            filesList: filesListText,
            codeContext,
          })
    let modelOutput = ''
    try {
      modelOutput = await generatePatch(retryPrompt)
    } catch (error) {
      patchError = String(error?.message || error)
      await fs.writeFile(path.join(taskDir, `openai_output_attempt${attempt}.txt`), patchError, 'utf8')
      continue
    }

    await fs.writeFile(path.join(taskDir, `openai_output_attempt${attempt}.txt`), modelOutput || '', 'utf8')
    if (attempt === 1) {
      await fs.writeFile(outputPath, modelOutput || '', 'utf8')
    }

    const patchText = extractUnifiedDiff(modelOutput)
    await fs.writeFile(path.join(taskDir, `refactor_attempt${attempt}.patch`), patchText || '', 'utf8')
    if (attempt === 1) {
      await fs.writeFile(patchPath, patchText || '', 'utf8')
    }
    if (!patchText) {
      patchError = 'No valid unified diff found in model output'
      continue
    }

    const applyPatch = await runCommand('git', ['apply', path.join(taskDir, `refactor_attempt${attempt}.patch`), '--whitespace=nowarn'], { cwd })
    await logCommand(logPath, applyPatch)
    if (applyPatch.code === 0) {
      patchApplied = true
      patchMode = 'diff'
      break
    }
    patchError = shortError(applyPatch.stderr, applyPatch.stdout)
  }

  if (!patchApplied && fallbackMode === 'files') {
    attemptsUsed += 1
    const fallbackPrompt = buildFilesFallbackPrompt({
      taskId: task.id,
      smell: task.smell,
      allowedRefactorings,
      filesList: filesListText,
      codeContext,
    })
    try {
      const fallbackOutput = await generatePatch(fallbackPrompt)
      await fs.writeFile(path.join(taskDir, `openai_output_attempt${attemptsUsed}.txt`), fallbackOutput || '', 'utf8')
      const blocks = parseFileReplacementBlocks(fallbackOutput)
      const allowedSet = new Set(files.map((f) => f.replace(/\\/g, '/')))
      let writeCount = 0
      for (const block of blocks) {
        const rel = block.file.replace(/\\/g, '/')
        if (!isSafeRelativeFile(cwd, rel, allowedSet)) continue
        await fs.writeFile(path.join(cwd, rel), block.content, 'utf8')
        writeCount += 1
      }
      if (writeCount > 0) {
        patchApplied = true
        patchMode = 'files'
      } else {
        patchError = 'Files fallback produced no safe writable file blocks'
      }
    } catch (error) {
      patchError = String(error?.message || error)
    }
  }

  if (!patchApplied) {
    patchMode = patchMode === 'files' ? 'files' : 'none'
    patchStatus = 'PATCH_FAILED'
    buildStatus = 'SKIPPED'
    diffStatus = 'SKIPPED'
    await recordAndReturn(patchError)
    return
  }
  patchStatus = 'OK'

  const build = await runCommand('npm', ['run', 'build'], { cwd })
  await logCommand(logPath, build)
  if (build.code !== 0) {
    buildStatus = 'BUILD_FAILED'
    diffStatus = 'SKIPPED'
    await recordAndReturn(shortError(build.stderr, build.stdout))
    return
  }
  buildStatus = 'OK'

  const captureAfter = await runCommand('npm', ['run', 'capture:one', '--', '--out', afterDir], { cwd })
  await logCommand(logPath, captureAfter)
  if (captureAfter.code !== 0) {
    diffStatus = 'DIFF_FAIL'
    await recordAndReturn(shortError(captureAfter.stderr, captureAfter.stdout))
    return
  }

  const diff = await runCommand(
    'node',
    [
      'scripts/truth/difftruth.js',
      '--base',
      path.join(beforeDir, 'truth'),
      '--cand',
      path.join(afterDir, 'truth'),
      '--report',
      reportPath,
    ],
    { cwd },
  )
  await logCommand(logPath, diff)
  diffStatus = diff.code === 0 ? 'PASS' : 'FAIL'

  const report = await readJson(reportPath).catch(() => null)
  if (report) {
    const totals = summarizeDiffReport(report)
    counts = {
      added: totals.added,
      removed: totals.removed,
      geometryChanges: totals.geometryChanges,
      styleChanges: totals.styleChanges,
      orderChanges: totals.orderChanges,
    }
  }

  const gitAdd = await runCommand('git', ['add', '-A'], { cwd })
  await logCommand(logPath, gitAdd)
  const commit = await runCommand('git', ['commit', '-m', `OpenAI refactor: ${task.id} (${task.smell})`], { cwd })
  await logCommand(logPath, commit)
  if (commit.code === 0) {
    const rev = await runCommand('git', ['rev-parse', 'HEAD'], { cwd })
    await logCommand(logPath, rev)
    commitHash = rev.code === 0 ? rev.stdout.trim() : ''
  } else {
    commitHash = 'NO_CHANGES'
  }

  await recordAndReturn(diffStatus === 'FAIL' ? shortError(diff.stderr, diff.stdout) : '')
}

async function run() {
  const cwd = process.cwd()
  const limitRaw = getCliArg('--limit')
  const limit = limitRaw ? Number(limitRaw) : 0
  const taskId = getCliArg('--task')
  const startAt = getCliArg('--startAt')
  const patchRetries = getNumberSetting(getCliArg('--patchRetries'), process.env.PATCH_RETRIES, 2)
  const fallbackModeRaw = (getCliArg('--fallbackMode') || process.env.PATCH_FALLBACK_MODE || 'none').toLowerCase()
  const fallbackMode = fallbackModeRaw === 'files' ? 'files' : 'none'

  const manifest = await readJson(path.join(cwd, 'dataset', 'manifest.json'))
  const tasks = Array.isArray(manifest?.tasks) ? manifest.tasks : []
  const selected = selectTasks(tasks, { limit: Number.isFinite(limit) ? limit : 0, taskId, startAt })
  if (selected.length === 0) {
    console.log('No tasks selected.')
    return
  }

  const specCsv = await fs.readFile(path.join(cwd, 'dataset', 'refactoring_spec_v1.csv'), 'utf8')
  const specRows = parseCsvLines(specCsv)
  const promptTemplate = await fs.readFile(path.join(cwd, 'dataset', 'llm_refactor_prompt_template.md'), 'utf8')

  const resultsCsvPath = path.join(cwd, 'dataset', 'results.csv')
  const resultsJsonPath = path.join(cwd, 'dataset', 'results.json')
  await fs.writeFile(resultsCsvPath, `${RESULTS_CSV_HEADER}\n`, 'utf8')
  const runResults = []

  for (const task of selected) {
    try {
      await runTask(task, { cwd, specRows, promptTemplate, resultsCsvPath, runResults, patchRetries, fallbackMode })
    } catch (error) {
      runResults.push({
        id: task.id,
        smell: task.smell,
        attempts_used: 0,
        patch_mode: 'none',
        before_branch: task.before_branch,
        after_branch: task.after_branch,
        patch_status: 'RUNNER_EXCEPTION',
        build_status: 'SKIPPED',
        diff_status: 'SKIPPED',
        counts: { added: '', removed: '', geometryChanges: '', styleChanges: '', orderChanges: '' },
        commit_hash: '',
        error: String(error?.message || error),
      })
      const row = [
        task.id,
        task.smell,
        0,
        'none',
        'RUNNER_EXCEPTION',
        'SKIPPED',
        'SKIPPED',
        '',
        '',
        '',
        '',
        '',
        '',
      ]
        .map(escapeCsv)
        .join(',')
      await appendFile(resultsCsvPath, `${row}\n`)
    }
  }

  await fs.writeFile(
    resultsJsonPath,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), tasks: runResults }, null, 2)}\n`,
    'utf8',
  )
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
