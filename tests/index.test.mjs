import { test } from 'node:test'
import assert from 'node:assert'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { parseDocument, isSeq, isMap } from 'yaml'
import * as plugin from '../index.mjs'

test('plugin exports Cordis contract', () => {
  assert.strictEqual(plugin.name, 'mcp-skill-manager')
  assert.deepStrictEqual(plugin.inject, ['connection'])
  assert.strictEqual(typeof plugin.apply, 'function')
})

test('cordis.patch.yml contains MCP definitions', () => {
  const dshHome = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
  const cordisPatchPath = path.join(dshHome, 'cordis.patch.yml')
  assert.ok(fs.existsSync(cordisPatchPath), 'cordis.patch.yml should exist')
  
  const content = fs.readFileSync(cordisPatchPath, 'utf8')
  const doc = parseDocument(content)
  assert.ok(isSeq(doc.contents))
})

test('skill directory movement toggles activation cleanly', () => {
  const tmpRoot = path.join('/tmp', 'test-skill-' + Date.now())
  const skillsDir = path.join(tmpRoot, 'skills')
  const disableDir = path.join(tmpRoot, 'skills-disable')
  const skillName = 'demo-skill'

  fs.mkdirSync(path.join(skillsDir, skillName), { recursive: true })
  fs.writeFileSync(
    path.join(skillsDir, skillName, 'SKILL.md'),
    '---\nname: demo-skill\ndescription: A demo skill\n---\n# Demo',
    'utf8'
  )

  assert.ok(fs.existsSync(path.join(skillsDir, skillName, 'SKILL.md')))

  // Deactivate: move to skills-disable
  fs.mkdirSync(disableDir, { recursive: true })
  fs.renameSync(path.join(skillsDir, skillName), path.join(disableDir, skillName))
  assert.ok(!fs.existsSync(path.join(skillsDir, skillName)))
  assert.ok(fs.existsSync(path.join(disableDir, skillName, 'SKILL.md')))

  // Reactivate: move back to skills
  fs.renameSync(path.join(disableDir, skillName), path.join(skillsDir, skillName))
  assert.ok(fs.existsSync(path.join(skillsDir, skillName, 'SKILL.md')))
  assert.ok(!fs.existsSync(path.join(disableDir, skillName)))

  fs.rmSync(tmpRoot, { recursive: true, force: true })
})

test('does not duplicate project skills when project and global parents match', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'test-home-skill-'))
  const dshHome = path.join(tmpRoot, '.dsh')
  const agentsHome = path.join(tmpRoot, '.agents')
  const previousDshHome = process.env.DSH_HOME
  const previousAgentsHome = process.env.DSH_AGENTS_HOME

  fs.mkdirSync(path.join(dshHome, 'skills', 'home-dsh-skill'), { recursive: true })
  fs.mkdirSync(path.join(agentsHome, 'skills', 'home-agents-skill'), { recursive: true })
  fs.writeFileSync(path.join(dshHome, 'skills', 'home-dsh-skill', 'SKILL.md'), '# DSH', 'utf8')
  fs.writeFileSync(path.join(agentsHome, 'skills', 'home-agents-skill', 'SKILL.md'), '# Agents', 'utf8')
  fs.writeFileSync(path.join(dshHome, 'cordis.patch.yml'), '- insert: []\n', 'utf8')

  process.env.DSH_HOME = dshHome
  process.env.DSH_AGENTS_HOME = agentsHome

  let rpcHandler = null
  const mockCtx = {
    get(name) {
      if (name === 'connection') {
        return {
          rpc: {
            handle(channel, handler) {
              if (channel === '/mcp-skill-manager') rpcHandler = handler
            },
          },
        }
      }
      if (name === 'workspaceRegistry') {
        return { list: () => [{ path: tmpRoot }] }
      }
      return undefined
    },
  }

  try {
    plugin.apply(mockCtx)
    assert.ok(typeof rpcHandler === 'function', 'rpc handler should be registered')

    const result = await rpcHandler('list', { sessionId: 'home-session' })
    assert.strictEqual(result.ok, true)
    assert.deepStrictEqual(result.value.projectSkills, [])
    assert.deepStrictEqual(
      result.value.globalSkills.map((item) => item.filename).sort(),
      ['home-agents-skill', 'home-dsh-skill'],
    )
  } finally {
    if (previousDshHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousDshHome
    if (previousAgentsHome === undefined) delete process.env.DSH_AGENTS_HOME
    else process.env.DSH_AGENTS_HOME = previousAgentsHome
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  }
})

test('rpc handler supports open-folder endpoint', async () => {
  let rpcHandler = null
  const mockCtx = {
    get(name) {
      if (name === 'connection') {
        return {
          rpc: {
            handle(channel, handler) {
              if (channel === '/mcp-skill-manager') {
                rpcHandler = handler
              }
            }
          }
        }
      }
      return undefined
    }
  }

  plugin.apply(mockCtx)
  assert.ok(typeof rpcHandler === 'function', 'rpc handler should be registered')

  // Calling open-folder without path returns bad-request
  const badRes = await rpcHandler('open-folder', {})
  assert.strictEqual(badRes.ok, false)

  // Calling open-folder with tmp path succeeds
  const goodRes = await rpcHandler('open-folder', { path: '/tmp' })
  assert.strictEqual(goodRes.ok, true)
  assert.strictEqual(goodRes.value.opened, true)
})
