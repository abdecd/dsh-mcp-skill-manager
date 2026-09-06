import { copyFile, rm, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const pluginRoot = fileURLToPath(new URL('..', import.meta.url))

function run(command, args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { cwd: pluginRoot, stdio: 'inherit', env: process.env })
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolvePromise()
        return
      }
      reject(new Error(`${command} exited with ${code ?? `signal ${signal}`}`))
    })
  })
}

const dist = join(pluginRoot, 'dist')
const lib = join(pluginRoot, 'lib')
await rm(dist, { recursive: true, force: true })
await rm(lib, { recursive: true, force: true })
await mkdir(lib, { recursive: true })

await run(join(pluginRoot, 'node_modules/.bin/tsc'), ['-p', 'tsconfig.json'])
await run(join(pluginRoot, 'node_modules/.bin/tsdown'), ['--config', 'tsdown.config.ts'])

// Output to lib/ (matching dsh-codex-connect)
await copyFile(join(dist, 'index.js'), join(lib, 'index.js'))
await copyFile(join(dist, 'client.js'), join(lib, 'client.js'))
await copyFile(join(dist, 'client.js.map'), join(lib, 'client.js.map'))

// Also copy to root for legacy fallback
await copyFile(join(dist, 'index.js'), join(pluginRoot, 'index.mjs'))
await copyFile(join(dist, 'client.js'), join(pluginRoot, 'client.js'))
await copyFile(join(dist, 'client.js.map'), join(pluginRoot, 'client.js.map'))

await rm(dist, { recursive: true, force: true })
