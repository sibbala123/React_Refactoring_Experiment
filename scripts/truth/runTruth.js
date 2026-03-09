import { spawn, spawnSync } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import { getCliArg, readRoutesConfig } from './helpers.js'
import { runTruthGeneration } from './generateTruth.js'

async function isUrlReachable(url) {
  try {
    const response = await fetch(url, { method: 'GET' })
    return response.ok
  } catch {
    return false
  }
}

async function waitForUrl(url, timeoutMs) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (await isUrlReachable(url)) return true
    await delay(500)
  }
  return false
}

async function run() {
  const outArg = getCliArg('--out')
  const outputDir = outArg || 'truth'
  const { baseUrl } = await readRoutesConfig(process.cwd())
  const alreadyUp = await isUrlReachable(baseUrl)

  if (alreadyUp) {
    console.log(`Using existing dev server: ${baseUrl}`)
    await runTruthGeneration(outputDir)
    return
  }

  const devArgs = ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173', '--strictPort']
  const devProc =
    process.platform === 'win32'
      ? spawn('cmd.exe', ['/d', '/s', '/c', `npm.cmd ${devArgs.join(' ')}`], {
          stdio: 'inherit',
          windowsHide: true,
        })
      : spawn('npm', devArgs, {
          stdio: 'inherit',
          windowsHide: true,
        })

  try {
    const ready = await waitForUrl(baseUrl, 30000)
    if (!ready) {
      throw new Error(`Timed out waiting for ${baseUrl}`)
    }
    await runTruthGeneration(outputDir)
  } finally {
    // On Windows, kill process tree to ensure npm/vite children do not keep shell occupied.
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/PID', String(devProc.pid), '/T', '/F'], { stdio: 'ignore' })
    } else {
      devProc.kill('SIGTERM')
    }
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
