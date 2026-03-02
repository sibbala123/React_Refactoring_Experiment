import fs from 'node:fs/promises'
import path from 'node:path'

export const TRUTH_VERSION = 'page-truth-v1'
export const FIXED_ENV = {
  browser: 'chromium',
  viewport: { width: 1280, height: 720 },
  deviceScaleFactor: 1,
}
export const MOTION_RESET_CSS = `
*,
*::before,
*::after {
  animation: none !important;
  transition: none !important;
  scroll-behavior: auto !important;
}
`

export async function readRoutesConfig(cwd = process.cwd()) {
  const configPath = path.join(cwd, 'truth.routes.json')
  const raw = await fs.readFile(configPath, 'utf8')
  const parsed = JSON.parse(raw)
  if (!parsed.baseUrl || !Array.isArray(parsed.routes)) {
    throw new Error('truth.routes.json must include baseUrl and routes[]')
  }
  return parsed
}

export function sanitizeRoutePath(routePath) {
  if (routePath === '/') return 'home'
  const cleaned = routePath.replace(/^\//, '').replace(/[^\w-]+/g, '-')
  return cleaned || 'route'
}

export function outputFileName(routePath, stateName) {
  return `truth__${sanitizeRoutePath(routePath)}__${stateName}.json`
}

export async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true })
}

export async function writeJson(filePath, data) {
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

export function getCliArg(flag, argv = process.argv.slice(2)) {
  const index = argv.lastIndexOf(flag)
  if (index === -1) return ''
  return argv[index + 1] || ''
}

export function resolveOutputDir(outArg, cwd = process.cwd()) {
  const dir = outArg && outArg.trim() ? outArg.trim() : 'truth'
  return path.isAbsolute(dir) ? dir : path.join(cwd, dir)
}

function normalizeStep(step) {
  if (!step || typeof step !== 'object') {
    throw new Error(`Invalid step: ${JSON.stringify(step)}`)
  }
  if (step.type) return step
  for (const type of ['clickByRole', 'typeByPlaceholder', 'selectByLabelOrRole', 'waitForText']) {
    if (step[type]) {
      return { type, ...step[type] }
    }
  }
  throw new Error(`Unsupported step shape: ${JSON.stringify(step)}`)
}

export async function runConfiguredStep(page, rawStep) {
  const step = normalizeStep(rawStep)
  if (step.type === 'clickByRole') {
    await page.getByRole(step.role, { name: step.name }).first().click()
    return
  }
  if (step.type === 'typeByPlaceholder') {
    await page.getByPlaceholder(step.placeholder).first().fill(step.text ?? '')
    return
  }
  if (step.type === 'selectByLabelOrRole') {
    if (step.role) {
      await page.getByRole(step.role, { name: step.name }).first().selectOption(step.value)
      return
    }
    await page.getByLabel(step.name).first().selectOption(step.value)
    return
  }
  if (step.type === 'waitForText') {
    await page.getByText(step.text).first().waitFor({ state: 'visible' })
    return
  }
  throw new Error(`Unsupported step type: ${step.type}`)
}

export async function runConfiguredSteps(page, steps = []) {
  for (const step of steps) {
    await runConfiguredStep(page, step)
  }
}

export async function installMotionReset(context) {
  await context.addInitScript(
    (cssText) => {
      const install = () => {
        if (document.getElementById('__capture_motion_reset__')) return
        const style = document.createElement('style')
        style.id = '__capture_motion_reset__'
        style.textContent = cssText
        ;(document.head || document.documentElement).appendChild(style)
      }
      install()
      document.addEventListener('DOMContentLoaded', install)
    },
    MOTION_RESET_CSS,
  )
}
