import fs from 'node:fs/promises'
import path from 'node:path'
import { getCliArg, writeJson } from './helpers.js'

const STYLE_FIELDS = ['color', 'backgroundColor', 'fontSize', 'fontWeight', 'borderRadius', 'display', 'visibility']
const BOX_FIELDS = ['x', 'y', 'w', 'h']

function stableTruthFiles(entries) {
  return entries
    .filter((name) => /^truth__.+\.json$/i.test(name))
    .sort((a, b) => a.localeCompare(b))
}

async function readTruthFolder(folder) {
  const names = await fs.readdir(folder)
  const files = stableTruthFiles(names)
  const map = new Map()
  for (const file of files) {
    const raw = await fs.readFile(path.join(folder, file), 'utf8')
    map.set(file, JSON.parse(raw))
  }
  return map
}

function elementsByKey(elements) {
  const map = new Map()
  for (const el of elements) {
    if (!el || typeof el.key !== 'string') continue
    map.set(el.key, el)
  }
  return map
}

function routeStateLabel(route, state) {
  return `${route}#${state}`
}

function createRouteReport(baseDoc, candDoc) {
  const route = candDoc?.route || baseDoc?.route || ''
  const state = candDoc?.state || baseDoc?.state || ''

  const beforeElements = Array.isArray(baseDoc?.elements) ? baseDoc.elements : []
  const afterElements = Array.isArray(candDoc?.elements) ? candDoc.elements : []

  const beforeMap = elementsByKey(beforeElements)
  const afterMap = elementsByKey(afterElements)

  const added = []
  const removed = []
  const geometryChanges = []
  const styleChanges = []
  const orderChanges = []

  for (const key of beforeMap.keys()) {
    if (!afterMap.has(key)) {
      removed.push(key)
    }
  }

  for (const key of afterMap.keys()) {
    if (!beforeMap.has(key)) {
      added.push(key)
    }
  }

  const sharedKeys = [...beforeMap.keys()].filter((k) => afterMap.has(k)).sort((a, b) => a.localeCompare(b))
  for (const key of sharedKeys) {
    const before = beforeMap.get(key)
    const after = afterMap.get(key)

    const dx = Number(((after.box?.x ?? 0) - (before.box?.x ?? 0)).toFixed(2))
    const dy = Number(((after.box?.y ?? 0) - (before.box?.y ?? 0)).toFixed(2))
    const dw = Number(((after.box?.w ?? 0) - (before.box?.w ?? 0)).toFixed(2))
    const dh = Number(((after.box?.h ?? 0) - (before.box?.h ?? 0)).toFixed(2))
    if (Math.abs(dx) > 0 || Math.abs(dy) > 0 || Math.abs(dw) > 0 || Math.abs(dh) > 0) {
      geometryChanges.push({ key, dx, dy, dw, dh })
    }

    const styleFieldChanges = {}
    for (const field of STYLE_FIELDS) {
      const beforeValue = before.style?.[field]
      const afterValue = after.style?.[field]
      if (beforeValue !== afterValue) {
        styleFieldChanges[field] = [beforeValue, afterValue]
      }
    }
    if (Object.keys(styleFieldChanges).length > 0) {
      styleChanges.push({ key, fields: styleFieldChanges })
    }

    if ((before.order ?? 0) !== (after.order ?? 0)) {
      orderChanges.push({ key, before: before.order, after: after.order })
    }
  }

  return {
    route,
    state,
    summary: {
      elementCountBefore: beforeElements.length,
      elementCountAfter: afterElements.length,
      added: added.length,
      removed: removed.length,
      geometryChanges: geometryChanges.length,
      styleChanges: styleChanges.length,
      orderChanges: orderChanges.length,
    },
    details: {
      added,
      removed,
      geometryChanges,
      styleChanges,
      orderChanges,
    },
  }
}

function printRouteSummary(report) {
  const label = routeStateLabel(report.route, report.state)
  console.log(`[${label}]`)
  console.log(`  elements: ${report.summary.elementCountBefore} -> ${report.summary.elementCountAfter}`)
  console.log(`  added: ${report.summary.added}`)
  console.log(`  removed: ${report.summary.removed}`)
  console.log(`  geometryChanges: ${report.summary.geometryChanges}`)
  console.log(`  styleChanges: ${report.summary.styleChanges}`)
  console.log(`  orderChanges: ${report.summary.orderChanges}`)
}

function shouldFail(report) {
  return (
    report.summary.added > 0 ||
    report.summary.removed > 0 ||
    report.summary.geometryChanges > 0 ||
    report.summary.styleChanges > 0
  )
}

async function run() {
  const cwd = process.cwd()
  const baseArg = getCliArg('--base') || 'truth_baseline'
  const candArg = getCliArg('--cand') || 'truth_candidate'
  const reportArg = getCliArg('--report') || 'truth_diff_report.json'
  const baselineDir = path.isAbsolute(baseArg) ? baseArg : path.join(cwd, baseArg)
  const candidateDir = path.isAbsolute(candArg) ? candArg : path.join(cwd, candArg)
  const reportPath = path.isAbsolute(reportArg) ? reportArg : path.join(cwd, reportArg)

  const [baseMap, candMap] = await Promise.all([readTruthFolder(baselineDir), readTruthFolder(candidateDir)])
  const baseFiles = [...baseMap.keys()]
  const candFiles = [...candMap.keys()]

  const reports = []

  for (const file of baseFiles) {
    if (!candMap.has(file)) {
      const baseDoc = baseMap.get(file)
      reports.push({
        route: baseDoc?.route || file,
        state: baseDoc?.state || 'unknown',
        summary: {
          elementCountBefore: Array.isArray(baseDoc?.elements) ? baseDoc.elements.length : 0,
          elementCountAfter: 0,
          added: 0,
          removed: Array.isArray(baseDoc?.elements) ? baseDoc.elements.length : 0,
          geometryChanges: 0,
          styleChanges: 0,
          orderChanges: 0,
        },
        details: {
          added: [],
          removed: Array.isArray(baseDoc?.elements) ? baseDoc.elements.map((el) => el.key).filter(Boolean) : [],
          geometryChanges: [],
          styleChanges: [],
          orderChanges: [],
        },
      })
    }
  }

  for (const file of candFiles) {
    if (!baseMap.has(file)) {
      const candDoc = candMap.get(file)
      reports.push({
        route: candDoc?.route || file,
        state: candDoc?.state || 'unknown',
        summary: {
          elementCountBefore: 0,
          elementCountAfter: Array.isArray(candDoc?.elements) ? candDoc.elements.length : 0,
          added: Array.isArray(candDoc?.elements) ? candDoc.elements.length : 0,
          removed: 0,
          geometryChanges: 0,
          styleChanges: 0,
          orderChanges: 0,
        },
        details: {
          added: Array.isArray(candDoc?.elements) ? candDoc.elements.map((el) => el.key).filter(Boolean) : [],
          removed: [],
          geometryChanges: [],
          styleChanges: [],
          orderChanges: [],
        },
      })
    }
  }

  const sharedFiles = baseFiles.filter((file) => candMap.has(file)).sort((a, b) => a.localeCompare(b))
  for (const file of sharedFiles) {
    const baseDoc = baseMap.get(file)
    const candDoc = candMap.get(file)
    reports.push(createRouteReport(baseDoc, candDoc))
  }

  reports.sort((a, b) => routeStateLabel(a.route, a.state).localeCompare(routeStateLabel(b.route, b.state)))
  for (const report of reports) {
    printRouteSummary(report)
  }

  const output = {
    generatedAt: new Date().toISOString(),
    routes: reports,
  }
  await writeJson(reportPath, output)

  const hasFailure = reports.some((report) => shouldFail(report))
  if (hasFailure) {
    process.exit(1)
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
