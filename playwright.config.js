export default {
  // Run CI on a consistent OS/image to keep font rendering deterministic.
  use: {
    browserName: 'chromium',
    headless: true,
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  },
}
