import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'
import {
  FIXED_ENV,
  ensureDir,
  getCliArg,
  installMotionReset,
  outputFileName,
  readRoutesConfig,
  resolveOutputDir,
  runConfiguredSteps,
} from '../truth/helpers.js'
import fs from 'node:fs/promises'

function domFileName(routePath, stateName) {
  return outputFileName(routePath, stateName).replace(/^truth__/, 'dom__').replace(/\.json$/, '.html')
}

export async function runDomCapture(outDirArg = 'dom') {
  const cwd = process.cwd()
  const { baseUrl, routes } = await readRoutesConfig(cwd)
  const outputDir = resolveOutputDir(outDirArg, cwd)
  await ensureDir(outputDir)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: FIXED_ENV.viewport,
    deviceScaleFactor: FIXED_ENV.deviceScaleFactor,
    reducedMotion: 'reduce',
  })
  await installMotionReset(context)

  const generated = []
  try {
    for (const route of routes) {
      const states = Array.isArray(route.states) && route.states.length ? route.states : [{ name: 'default', steps: [] }]
      for (const state of states) {
        const page = await context.newPage()
        await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle' })
        await runConfiguredSteps(page, Array.isArray(state.steps) ? state.steps : [])

        const html = await page.evaluate(() => {
          const root = document.querySelector('#root')
          if (root && root.innerHTML) return root.innerHTML
          return document.documentElement.outerHTML
        })

        const fileName = domFileName(route.path, state.name)
        await fs.writeFile(path.join(outputDir, fileName), html, 'utf8')
        generated.push({ file: fileName, route: route.path, state: state.name, generatedAt: new Date().toISOString() })
        await page.close()
        console.log(`Generated ${fileName}`)
      }
    }
  } finally {
    await context.close()
    await browser.close()
  }

  return generated
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const outArg = getCliArg('--out')
  runDomCapture(outArg || 'dom').catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
