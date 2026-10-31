import { test } from 'node:test'
import assert from 'node:assert'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { parseDocument, isSeq, isMap } from 'yaml'
import * as plugin from '../index.mjs'

test('plugin exports Cordis contract', () => {
  assert.strictEqual(plugin.name, 'mcp-skill-manager')
  assert.deepStrictEqual(plugin.inject, ['connection', 'webServer'])
  assert.strictEqual(typeof plugin.apply, 'function')
  assert.strictEqual(typeof plugin.sortByEnabled, 'function')
  assert.strictEqual(typeof plugin.getAllowedPatchPaths, 'function')
})

test('cordis.patch.yml in repository contains valid patch definition', () => {
  const repoPatchPath = path.join(import.meta.dirname, '..', 'cordis.patch.yml')
  assert.ok(fs.existsSync(repoPatchPath), 'repo cordis.patch.yml should exist')

  const content = fs.readFileSync(repoPatchPath, 'utf8')
  const doc = parseDocument(content)
  assert.ok(isSeq(doc.contents))
})

test('skill directory movement toggles activation cleanly', () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'test-skill-move-'))
  const skillsDir = path.join(tmpRoot, 'skills')
  const disableDir = path.join(tmpRoot, 'skills-disable')
  const skillName = 'demo-skill'

  try {
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
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  }
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

test('sortByEnabled sorts enabled items first while stably preserving relative order', () => {
  assert.deepStrictEqual(plugin.sortByEnabled([]), [])

  const onlyEnabled = [
    { id: '1', enabled: true },
    { id: '2', enabled: true },
  ]
  assert.deepStrictEqual(plugin.sortByEnabled(onlyEnabled), onlyEnabled)

  const onlyDisabled = [
    { id: '1', enabled: false },
    { id: '2', enabled: false },
  ]
  assert.deepStrictEqual(plugin.sortByEnabled(onlyDisabled), onlyDisabled)

  const mixed = [
    { id: 'd1', enabled: false, order: 1 },
    { id: 'e1', enabled: true, order: 2 },
    { id: 'd2', enabled: false, order: 3 },
    { id: 'e2', enabled: true, order: 4 },
    { id: 'e3', enabled: true, order: 5 },
    { id: 'd3', enabled: false, order: 6 },
  ]
  const sorted = plugin.sortByEnabled(mixed)
  assert.deepStrictEqual(
    sorted.map((it) => it.id),
    ['e1', 'e2', 'e3', 'd1', 'd2', 'd3']
  )
  assert.deepStrictEqual(
    sorted.map((it) => it.order),
    [2, 4, 5, 1, 3, 6]
  )
})

test('rpc handler list endpoint returns enabled skills and MCPs ahead of disabled ones', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'test-sort-skill-'))
  const dshHome = path.join(tmpRoot, '.dsh')
  const agentsHome = path.join(tmpRoot, '.agents')
  const projectRoot = path.join(tmpRoot, 'project')
  const previousDshHome = process.env.DSH_HOME
  const previousAgentsHome = process.env.DSH_AGENTS_HOME

  try {
    process.env.DSH_HOME = dshHome
    process.env.DSH_AGENTS_HOME = agentsHome

    // Project skills: one disabled in .dsh, one enabled in .agents
    fs.mkdirSync(path.join(projectRoot, '.dsh', 'skills-disable', 'proj-disabled-1'), { recursive: true })
    fs.writeFileSync(path.join(projectRoot, '.dsh', 'skills-disable', 'proj-disabled-1', 'SKILL.md'), '# D1', 'utf8')
    fs.mkdirSync(path.join(projectRoot, '.agents', 'skills', 'proj-enabled-1'), { recursive: true })
    fs.writeFileSync(path.join(projectRoot, '.agents', 'skills', 'proj-enabled-1', 'SKILL.md'), '# E1', 'utf8')

    // Global skills: one disabled, one enabled
    fs.mkdirSync(path.join(dshHome, 'skills-disable', 'glob-disabled-1'), { recursive: true })
    fs.writeFileSync(path.join(dshHome, 'skills-disable', 'glob-disabled-1', 'SKILL.md'), '# GD1', 'utf8')
    fs.mkdirSync(path.join(agentsHome, 'skills', 'glob-enabled-1'), { recursive: true })
    fs.writeFileSync(path.join(agentsHome, 'skills', 'glob-enabled-1', 'SKILL.md'), '# GE1', 'utf8')

    // Global MCPs in cordis.patch.yml: disabled MCP first, enabled MCP second
    const cordisPatchYaml = `
- insert:
    - id: mcp-disabled
      name: '@deepseek-ai/dsh-mcp-client'
      disabled: true
      config:
        serverName: disabled-server
    - id: mcp-enabled
      name: '@deepseek-ai/dsh-mcp-client'
      config:
        serverName: enabled-server
`
    fs.mkdirSync(dshHome, { recursive: true })
    fs.writeFileSync(path.join(dshHome, 'cordis.patch.yml'), cordisPatchYaml, 'utf8')

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
          return { list: () => [{ path: projectRoot }] }
        }
        return undefined
      },
    }

    plugin.apply(mockCtx)
    assert.ok(typeof rpcHandler === 'function')

    const result = await rpcHandler('list', {})
    assert.strictEqual(result.ok, true)

    // Verify project skills: enabled must be first
    assert.deepStrictEqual(
      result.value.projectSkills.map((s) => ({ filename: s.filename, enabled: s.enabled })),
      [
        { filename: 'proj-enabled-1', enabled: true },
        { filename: 'proj-disabled-1', enabled: false },
      ]
    )

    // Verify global skills: enabled must be first
    assert.deepStrictEqual(
      result.value.globalSkills.map((s) => ({ filename: s.filename, enabled: s.enabled })),
      [
        { filename: 'glob-enabled-1', enabled: true },
        { filename: 'glob-disabled-1', enabled: false },
      ]
    )

    // Verify global MCPs: enabled must be first
    assert.deepStrictEqual(
      result.value.globalMcps.map((m) => ({ serverName: m.serverName, enabled: m.enabled })),
      [
        { serverName: 'enabled-server', enabled: true },
        { serverName: 'disabled-server', enabled: false },
      ]
    )
  } finally {
    if (previousDshHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousDshHome
    if (previousAgentsHome === undefined) delete process.env.DSH_AGENTS_HOME
    else process.env.DSH_AGENTS_HOME = previousAgentsHome
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  }
})

test('isolated fixture: Profile + Global MCP scan with unique scope identities', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'test-profile-mcp-'))
  const dshHome = path.join(tmpRoot, '.dsh')
  const profileDir = path.join(dshHome, 'profiles', 'web')
  const profilePatchPath = path.join(profileDir, 'cordis.patch.yml')
  const globalPatchPath = path.join(dshHome, 'cordis.patch.yml')

  const previousDshHome = process.env.DSH_HOME

  try {
    process.env.DSH_HOME = dshHome

    fs.mkdirSync(profileDir, { recursive: true })
    fs.writeFileSync(
      profilePatchPath,
      `# Profile level comment
- insert:
    - id: mcp-shared-id
      name: '@deepseek-ai/dsh-mcp-client'
      config:
        serverName: profile-server
        transport: stdio
        command: npx
        args: ['-y', 'profile-mcp']
`,
      'utf8'
    )

    fs.writeFileSync(
      globalPatchPath,
      `# Global level comment
- insert:
    - id: mcp-shared-id
      name: '@deepseek-ai/dsh-mcp-client'
      disabled: true
      config:
        serverName: global-server
        transport: sse
        url: http://localhost:8080/sse
`,
      'utf8'
    )

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
        if (name === 'profileContext') {
          return {
            patchPath: profilePatchPath,
            home: dshHome,
            dir: profileDir,
            name: 'web',
          }
        }
        return undefined
      },
    }

    plugin.apply(mockCtx)
    assert.ok(typeof rpcHandler === 'function')

    const result = await rpcHandler('list', {})
    assert.strictEqual(result.ok, true)

    // Both profile and global MCPs returned with distinct scopes and unique IDs
    assert.strictEqual(result.value.globalMcps.length, 2)

    const profileItem = result.value.globalMcps.find((m) => m.scope === 'profile')
    const globalItem = result.value.globalMcps.find((m) => m.scope === 'global')

    assert.ok(profileItem, 'profile MCP should be present')
    assert.ok(globalItem, 'global MCP should be present')

    assert.strictEqual(profileItem.id, 'profile:mcp-shared-id')
    assert.strictEqual(profileItem.serverName, 'profile-server')
    assert.strictEqual(profileItem.enabled, true)
    assert.strictEqual(profileItem.configPath, profilePatchPath)
    assert.deepStrictEqual(profileItem.args, ['-y', 'profile-mcp'])

    assert.strictEqual(globalItem.id, 'global:mcp-shared-id')
    assert.strictEqual(globalItem.serverName, 'global-server')
    assert.strictEqual(globalItem.enabled, false)
    assert.strictEqual(globalItem.configPath, globalPatchPath)
    assert.strictEqual(globalItem.url, 'http://localhost:8080/sse')
  } finally {
    if (previousDshHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousDshHome
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  }
})

test('isolated fixture: correct switching target for Profile vs Global MCP preserving AST', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'test-toggle-mcp-'))
  const dshHome = path.join(tmpRoot, '.dsh')
  const profileDir = path.join(dshHome, 'profiles', 'web')
  const profilePatchPath = path.join(profileDir, 'cordis.patch.yml')
  const globalPatchPath = path.join(dshHome, 'cordis.patch.yml')

  const previousDshHome = process.env.DSH_HOME

  try {
    process.env.DSH_HOME = dshHome

    fs.mkdirSync(profileDir, { recursive: true })
    fs.writeFileSync(
      profilePatchPath,
      `# Web Profile Patch
- insert:
    - id: mcp-profile-item
      name: '@deepseek-ai/dsh-mcp-client'
      customUnknownField: 'preserve-me'
      config:
        serverName: profile-server
`,
      'utf8'
    )

    fs.writeFileSync(
      globalPatchPath,
      `# Global Patch
- insert:
    - id: mcp-global-item
      name: '@deepseek-ai/dsh-mcp-client'
      disabled: true
      anotherCustomField: 42
      config:
        serverName: global-server
`,
      'utf8'
    )

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
        if (name === 'profileContext') {
          return {
            patchPath: profilePatchPath,
            home: dshHome,
            dir: profileDir,
            name: 'web',
          }
        }
        return undefined
      },
    }

    plugin.apply(mockCtx)

    // 1. Deactivate profile MCP
    const toggleProfileRes = await rpcHandler('toggle-mcp', {
      id: 'profile:mcp-profile-item',
      serverName: 'profile-server',
      enabled: false,
      scope: 'profile',
      configPath: profilePatchPath,
    })
    assert.strictEqual(toggleProfileRes.ok, true)

    // Verify profile patch is modified with disabled: true while retaining unknown field and comment
    const profileContent = fs.readFileSync(profilePatchPath, 'utf8')
    assert.ok(profileContent.includes('disabled: true'))
    assert.ok(profileContent.includes("customUnknownField: 'preserve-me'"))
    assert.ok(profileContent.includes('# Web Profile Patch'))

    // Verify global patch was NOT modified
    const globalContentUnchanged = fs.readFileSync(globalPatchPath, 'utf8')
    assert.ok(globalContentUnchanged.includes('mcp-global-item'))
    assert.ok(globalContentUnchanged.includes('anotherCustomField: 42'))

    // 2. Activate global MCP
    const toggleGlobalRes = await rpcHandler('toggle-mcp', {
      id: 'global:mcp-global-item',
      serverName: 'global-server',
      enabled: true,
      scope: 'global',
      configPath: globalPatchPath,
    })
    assert.strictEqual(toggleGlobalRes.ok, true)

    // Verify global patch has disabled removed while retaining unknown field and comment
    const globalContentAfter = fs.readFileSync(globalPatchPath, 'utf8')
    assert.ok(!globalContentAfter.includes('disabled: true'))
    assert.ok(globalContentAfter.includes('anotherCustomField: 42'))
    assert.ok(globalContentAfter.includes('# Global Patch'))
  } finally {
    if (previousDshHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousDshHome
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  }
})

test('isolated fixture: security - malicious arbitrary configPath rejection', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'test-sec-mcp-'))
  const dshHome = path.join(tmpRoot, '.dsh')
  const profileDir = path.join(dshHome, 'profiles', 'web')
  const profilePatchPath = path.join(profileDir, 'cordis.patch.yml')
  const globalPatchPath = path.join(dshHome, 'cordis.patch.yml')
  const evilFile = path.join(tmpRoot, 'evil-target.yml')

  const previousDshHome = process.env.DSH_HOME

  try {
    process.env.DSH_HOME = dshHome

    fs.mkdirSync(profileDir, { recursive: true })
    fs.writeFileSync(profilePatchPath, '- insert: []\n', 'utf8')
    fs.writeFileSync(globalPatchPath, '- insert: []\n', 'utf8')
    fs.writeFileSync(evilFile, 'sensitive_data: true\n', 'utf8')

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
        if (name === 'profileContext') {
          return {
            patchPath: profilePatchPath,
            home: dshHome,
            dir: profileDir,
            name: 'web',
          }
        }
        return undefined
      },
    }

    plugin.apply(mockCtx)

    // Attempt to toggle using an unallowed path
    const evilRes = await rpcHandler('toggle-mcp', {
      id: 'mcp-evil',
      enabled: false,
      configPath: evilFile,
    })

    assert.strictEqual(evilRes.ok, false)
    assert.ok(
      evilRes.error.message.includes('Forbidden') ||
      evilRes.error.message.includes('not an allowed'),
      'Should reject malicious configPath'
    )

    // Verify evilFile was never touched
    assert.strictEqual(fs.readFileSync(evilFile, 'utf8'), 'sensitive_data: true\n')
  } finally {
    if (previousDshHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousDshHome
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  }
})

test('isolated fixture: no-service fallback when profileContext is absent', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'test-fallback-mcp-'))
  const dshHome = path.join(tmpRoot, '.dsh')
  const globalPatchPath = path.join(dshHome, 'cordis.patch.yml')

  const previousDshHome = process.env.DSH_HOME

  try {
    process.env.DSH_HOME = dshHome

    fs.mkdirSync(dshHome, { recursive: true })
    fs.writeFileSync(
      globalPatchPath,
      `- insert:
    - id: mcp-fallback
      name: '@deepseek-ai/dsh-mcp-client'
      config:
        serverName: fallback-server
`,
      'utf8'
    )

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
        // profileContext is NOT provided
        return undefined
      },
    }

    plugin.apply(mockCtx)

    const listRes = await rpcHandler('list', {})
    assert.strictEqual(listRes.ok, true)
    assert.strictEqual(listRes.value.globalMcps.length, 1)
    assert.strictEqual(listRes.value.globalMcps[0].serverName, 'fallback-server')
    assert.strictEqual(listRes.value.globalMcps[0].scope, 'global')

    const toggleRes = await rpcHandler('toggle-mcp', {
      id: 'global:mcp-fallback',
      enabled: false,
    })
    assert.strictEqual(toggleRes.ok, true)

    const globalContent = fs.readFileSync(globalPatchPath, 'utf8')
    assert.ok(globalContent.includes('disabled: true'))
  } finally {
    if (previousDshHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousDshHome
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  }
})

test('isolated fixture: rejects scope and configPath mismatch to prevent wrong-file modification', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'test-mismatch-mcp-'))
  const dshHome = path.join(tmpRoot, '.dsh')
  const profileDir = path.join(dshHome, 'profiles', 'web')
  const profilePatchPath = path.join(profileDir, 'cordis.patch.yml')
  const globalPatchPath = path.join(dshHome, 'cordis.patch.yml')

  const previousDshHome = process.env.DSH_HOME

  try {
    process.env.DSH_HOME = dshHome

    fs.mkdirSync(profileDir, { recursive: true })
    fs.writeFileSync(profilePatchPath, '- insert: []\n', 'utf8')
    fs.writeFileSync(globalPatchPath, '- insert: []\n', 'utf8')

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
        if (name === 'profileContext') {
          return {
            patchPath: profilePatchPath,
            home: dshHome,
            dir: profileDir,
            name: 'web',
          }
        }
        return undefined
      },
    }

    plugin.apply(mockCtx)

    // Scope 'profile' with globalPatchPath configPath should be rejected
    const mismatchRes1 = await rpcHandler('toggle-mcp', {
      id: 'profile:mcp-test',
      enabled: false,
      scope: 'profile',
      configPath: globalPatchPath,
    })
    assert.strictEqual(mismatchRes1.ok, false)
    assert.ok(mismatchRes1.error.message.includes('does not match configPath'))

    // Scope 'global' with profilePatchPath configPath should be rejected
    const mismatchRes2 = await rpcHandler('toggle-mcp', {
      id: 'global:mcp-test',
      enabled: false,
      scope: 'global',
      configPath: profilePatchPath,
    })
    assert.strictEqual(mismatchRes2.ok, false)
    assert.ok(mismatchRes2.error.message.includes('does not match configPath'))

    // When profileContext is absent, passing scope 'profile' with globalPatchPath must be rejected
    let fallbackRpcHandler = null
    const noProfileCtx = {
      get(name) {
        if (name === 'connection') {
          return {
            rpc: {
              handle(channel, handler) {
                if (channel === '/mcp-skill-manager') fallbackRpcHandler = handler
              },
            },
          }
        }
        return undefined
      },
    }
    plugin.apply(noProfileCtx)

    const globalContentBefore = fs.readFileSync(globalPatchPath, 'utf8')
    const noProfileMismatchRes = await fallbackRpcHandler('toggle-mcp', {
      id: 'profile:mcp-test',
      enabled: false,
      scope: 'profile',
      configPath: globalPatchPath,
    })
    assert.strictEqual(noProfileMismatchRes.ok, false)
    assert.ok(noProfileMismatchRes.error.message.includes('does not match configPath'))
    assert.strictEqual(fs.readFileSync(globalPatchPath, 'utf8'), globalContentBefore)
  } finally {
    if (previousDshHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousDshHome
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  }
})

test('isolated fixture: legacy toggle-mcp payload without scope or configPath searches candidate patches', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'test-legacy-mcp-'))
  const dshHome = path.join(tmpRoot, '.dsh')
  const profileDir = path.join(dshHome, 'profiles', 'web')
  const profilePatchPath = path.join(profileDir, 'cordis.patch.yml')
  const globalPatchPath = path.join(dshHome, 'cordis.patch.yml')

  const previousDshHome = process.env.DSH_HOME

  try {
    process.env.DSH_HOME = dshHome

    fs.mkdirSync(profileDir, { recursive: true })
    fs.writeFileSync(profilePatchPath, '- insert: []\n', 'utf8')
    fs.writeFileSync(
      globalPatchPath,
      `- insert:
    - id: mcp-legacy-server
      name: '@deepseek-ai/dsh-mcp-client'
      config:
        serverName: legacy-server
`,
      'utf8'
    )

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
        if (name === 'profileContext') {
          return {
            patchPath: profilePatchPath,
            home: dshHome,
            dir: profileDir,
            name: 'web',
          }
        }
        return undefined
      },
    }

    plugin.apply(mockCtx)

    // Legacy call without scope and without configPath
    const legacyRes = await rpcHandler('toggle-mcp', {
      id: 'mcp-legacy-server',
      enabled: false,
    })
    assert.strictEqual(legacyRes.ok, true)

    const globalContent = fs.readFileSync(globalPatchPath, 'utf8')
    assert.ok(globalContent.includes('disabled: true'))
  } finally {
    if (previousDshHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousDshHome
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  }
})

test('project-level MCP: scan and parse from .dsh/mcp.json with sorted status', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'test-project-mcp-scan-'))
  const dshHome = path.join(tmpRoot, 'global-dsh')
  const projectRoot = path.join(tmpRoot, 'my-project')
  const projectDsh = path.join(projectRoot, '.dsh')
  const previousDshHome = process.env.DSH_HOME

  try {
    process.env.DSH_HOME = dshHome
    fs.mkdirSync(projectDsh, { recursive: true })
    fs.mkdirSync(dshHome, { recursive: true })
    fs.writeFileSync(path.join(dshHome, 'cordis.patch.yml'), '- insert: []\n', 'utf8')

    // Write .dsh/mcp.json with one disabled and one enabled
    const mcpJson = {
      mcpServers: {
        'disabled-tool': {
          command: 'node',
          args: ['./scripts/disabled.js'],
          disabled: true,
        },
        'active-tool': {
          command: 'node',
          args: ['./scripts/active.js'],
          transport: 'stdio',
        },
      },
    }
    fs.writeFileSync(path.join(projectDsh, 'mcp.json'), JSON.stringify(mcpJson, null, 2), 'utf8')

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
          return { list: () => [{ path: projectRoot }] }
        }
        return undefined
      },
    }

    plugin.apply(mockCtx)
    assert.ok(typeof rpcHandler === 'function')

    const res = await rpcHandler('list', {})
    assert.strictEqual(res.ok, true)
    assert.strictEqual(res.value.projectRoot, projectRoot)
    assert.strictEqual(res.value.projectMcps.length, 2)

    // Enabled item must be sorted first
    assert.strictEqual(res.value.projectMcps[0].serverName, 'active-tool')
    assert.strictEqual(res.value.projectMcps[0].enabled, true)
    assert.strictEqual(res.value.projectMcps[0].scope, 'project')
    assert.strictEqual(res.value.projectMcps[0].configPath, path.join(projectDsh, 'mcp.json'))

    assert.strictEqual(res.value.projectMcps[1].serverName, 'disabled-tool')
    assert.strictEqual(res.value.projectMcps[1].enabled, false)
    assert.strictEqual(res.value.projectMcps[1].scope, 'project')
  } finally {
    if (previousDshHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousDshHome
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  }
})

test('project-level MCP: toggle state writes disabled property and dynamic Cordis mount/unmount', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'test-project-mcp-toggle-'))
  const dshHome = path.join(tmpRoot, 'global-dsh')
  const projectRoot = path.join(tmpRoot, 'my-project')
  const projectDsh = path.join(projectRoot, '.dsh')
  const mcpJsonPath = path.join(projectDsh, 'mcp.json')
  const previousDshHome = process.env.DSH_HOME

  try {
    process.env.DSH_HOME = dshHome
    fs.mkdirSync(projectDsh, { recursive: true })
    fs.mkdirSync(dshHome, { recursive: true })
    fs.writeFileSync(path.join(dshHome, 'cordis.patch.yml'), '- insert: []\n', 'utf8')

    fs.writeFileSync(
      mcpJsonPath,
      JSON.stringify(
        {
          mcpServers: {
            'hot-tool': {
              command: 'node',
              args: ['./hot.js'],
            },
          },
        },
        null,
        2
      ),
      'utf8'
    )

    const mountedConfigs = []
    const disposedForks = []
    let rpcHandler = null

    const fakePlugin = { name: '@deepseek-ai/dsh-mcp-client' }
    const mockCtx = {
      root: {
        registry: {
          get(name) {
            if (name === '@deepseek-ai/dsh-mcp-client') return fakePlugin
            return undefined
          },
        },
      },
      plugin(pluginTarget, config) {
        mountedConfigs.push(config)
        const fork = {
          config,
          dispose() {
            disposedForks.push(config)
          },
        }
        return fork
      },
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
          return { list: () => [{ path: projectRoot }] }
        }
        return undefined
      },
    }

    plugin.apply(mockCtx)

    // Initial list triggers mount of enabled hot-tool
    const listRes = await rpcHandler('list', {})
    assert.strictEqual(listRes.ok, true)
    assert.strictEqual(mountedConfigs.length, 1)
    assert.ok(mountedConfigs[0].serverName.startsWith('hot-tool-'))
    assert.strictEqual(disposedForks.length, 0)

    // 1. Toggle to disabled: true
    const toggleOffRes = await rpcHandler('toggle-mcp', {
      id: 'project:hot-tool',
      serverName: 'hot-tool',
      enabled: false,
      scope: 'project',
      configPath: mcpJsonPath,
    })
    assert.strictEqual(toggleOffRes.ok, true)

    // Verify .dsh/mcp.json has disabled: true
    const jsonAfterOff = JSON.parse(fs.readFileSync(mcpJsonPath, 'utf8'))
    assert.strictEqual(jsonAfterOff.mcpServers['hot-tool'].disabled, true)

    // Verify Cordis unmount was called
    assert.strictEqual(disposedForks.length, 1)
    assert.ok(disposedForks[0].serverName.startsWith('hot-tool-'))

    // 2. Toggle back to enabled: true
    const toggleOnRes = await rpcHandler('toggle-mcp', {
      id: 'project:hot-tool',
      serverName: 'hot-tool',
      enabled: true,
      scope: 'project',
      configPath: mcpJsonPath,
    })
    assert.strictEqual(toggleOnRes.ok, true)

    // Verify .dsh/mcp.json no longer has disabled
    const jsonAfterOn = JSON.parse(fs.readFileSync(mcpJsonPath, 'utf8'))
    assert.strictEqual(jsonAfterOn.mcpServers['hot-tool'].disabled, undefined)

    // Verify Cordis mount was called again
    assert.strictEqual(mountedConfigs.length, 2)
  } finally {
    if (previousDshHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousDshHome
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  }
})

test('project-level MCP: security - rejects external malicious configPath', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'test-project-mcp-sec-'))
  const projectRoot = path.join(tmpRoot, 'safe-project')
  const externalDir = path.join(tmpRoot, 'external-dir')
  const dshHome = path.join(tmpRoot, 'dsh-home')

  try {
    fs.mkdirSync(projectRoot, { recursive: true })
    fs.mkdirSync(externalDir, { recursive: true })
    fs.mkdirSync(dshHome, { recursive: true })
    fs.writeFileSync(path.join(dshHome, 'cordis.patch.yml'), '- insert: []\n', 'utf8')

    const evilJsonPath = path.join(externalDir, 'evil.json')
    fs.writeFileSync(evilJsonPath, JSON.stringify({ mcpServers: { evil: { command: 'sh' } } }), 'utf8')

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
          return { list: () => [{ path: projectRoot }] }
        }
        return undefined
      },
    }

    plugin.apply(mockCtx)

    const attackRes = await rpcHandler('toggle-mcp', {
      id: 'project:evil',
      serverName: 'evil',
      enabled: false,
      scope: 'project',
      configPath: evilJsonPath,
    })

    assert.strictEqual(attackRes.ok, false)
    assert.ok(attackRes.error.message.includes('Forbidden') || attackRes.error.message.includes('Invalid request'))
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  }
})

test('project-level MCP: supports root mcp.json fallback and open-folder target', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'test-project-mcp-root-'))
  const projectRoot = path.join(tmpRoot, 'my-root-project')
  const rootMcpJsonPath = path.join(projectRoot, 'mcp.json')
  const dshHome = path.join(tmpRoot, 'global-dsh')
  const previousDshHome = process.env.DSH_HOME

  try {
    process.env.DSH_HOME = dshHome
    fs.mkdirSync(projectRoot, { recursive: true })
    fs.mkdirSync(dshHome, { recursive: true })
    fs.writeFileSync(path.join(dshHome, 'cordis.patch.yml'), '- insert: []\n', 'utf8')

    fs.writeFileSync(
      rootMcpJsonPath,
      JSON.stringify({
        mcpServers: {
          'root-mcp-server': {
            command: 'python3',
            args: ['./server.py'],
          },
        },
      }),
      'utf8'
    )

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
          return { list: () => [{ path: projectRoot }] }
        }
        return undefined
      },
    }

    plugin.apply(mockCtx)
    const res = await rpcHandler('list', {})
    assert.strictEqual(res.ok, true)
    assert.strictEqual(res.value.projectMcps.length, 1)
    assert.strictEqual(res.value.projectMcps[0].serverName, 'root-mcp-server')
    assert.strictEqual(res.value.projectMcps[0].configPath, rootMcpJsonPath)

    // Open folder with configPath succeeds
    const openRes = await rpcHandler('open-folder', { path: res.value.projectMcps[0].configPath })
    assert.strictEqual(openRes.ok, true)
    assert.strictEqual(openRes.value.opened, true)
  } finally {
    if (previousDshHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousDshHome
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  }
})

test('agents convention: scans project-level .agents/mcp.json and global-level ~/.agents/mcp.json', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'test-agents-convention-'))
  const dshHome = path.join(tmpRoot, 'user-dsh')
  const agentsHome = path.join(tmpRoot, 'user-agents')
  const projectRoot = path.join(tmpRoot, 'my-agents-project')
  const projectAgentsDir = path.join(projectRoot, '.agents')

  const previousDshHome = process.env.DSH_HOME
  const previousAgentsHome = process.env.DSH_AGENTS_HOME

  try {
    process.env.DSH_HOME = dshHome
    process.env.DSH_AGENTS_HOME = agentsHome

    fs.mkdirSync(dshHome, { recursive: true })
    fs.writeFileSync(path.join(dshHome, 'cordis.patch.yml'), '- insert: []\n', 'utf8')

    // 1. Create global ~/.agents/mcp.json
    fs.mkdirSync(agentsHome, { recursive: true })
    const globalAgentsMcpJson = {
      mcpServers: {
        'global-agent-tool': {
          command: 'npx',
          args: ['-y', 'global-agent-tool'],
          disabled: false,
        },
      },
    }
    fs.writeFileSync(path.join(agentsHome, 'mcp.json'), JSON.stringify(globalAgentsMcpJson, null, 2), 'utf8')

    // 2. Create project-level .agents/mcp.json
    fs.mkdirSync(projectAgentsDir, { recursive: true })
    const projectAgentsMcpJson = {
      mcpServers: {
        'project-agent-tool': {
          command: 'python',
          args: ['./tools/run.py'],
          disabled: true,
        },
      },
    }
    fs.writeFileSync(path.join(projectAgentsDir, 'mcp.json'), JSON.stringify(projectAgentsMcpJson, null, 2), 'utf8')

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
          return { list: () => [{ path: projectRoot }] }
        }
        return undefined
      },
    }

    plugin.apply(mockCtx)
    const res = await rpcHandler('list', {})
    assert.strictEqual(res.ok, true)

    // Check project MCP from .agents/mcp.json
    assert.strictEqual(res.value.projectMcps.length, 1)
    const projItem = res.value.projectMcps[0]
    assert.strictEqual(projItem.serverName, 'project-agent-tool')
    assert.strictEqual(projItem.enabled, false)
    assert.strictEqual(projItem.scope, 'project')
    assert.strictEqual(projItem.configPath, path.join(projectAgentsDir, 'mcp.json'))

    // Check global MCP from ~/.agents/mcp.json
    const globItem = res.value.globalMcps.find((m) => m.serverName === 'global-agent-tool')
    assert.ok(globItem, 'global-agent-tool should be found in globalMcps')
    assert.strictEqual(globItem.enabled, true)
    assert.strictEqual(globItem.scope, 'global')
    assert.strictEqual(globItem.configPath, path.join(agentsHome, 'mcp.json'))

    // 3. Toggle global MCP in ~/.agents/mcp.json
    const toggleGlobalRes = await rpcHandler('toggle-mcp', {
      id: globItem.id,
      serverName: globItem.serverName,
      enabled: false,
      scope: 'global',
      configPath: globItem.configPath,
    })
    assert.strictEqual(toggleGlobalRes.ok, true)
    const updatedGlobalJson = JSON.parse(fs.readFileSync(path.join(agentsHome, 'mcp.json'), 'utf8'))
    assert.strictEqual(updatedGlobalJson.mcpServers['global-agent-tool'].disabled, true)

    // 4. Toggle project MCP in .agents/mcp.json
    const toggleProjRes = await rpcHandler('toggle-mcp', {
      id: projItem.id,
      serverName: projItem.serverName,
      enabled: true,
      scope: 'project',
      configPath: projItem.configPath,
    })
    assert.strictEqual(toggleProjRes.ok, true)
    const updatedProjJson = JSON.parse(fs.readFileSync(path.join(projectAgentsDir, 'mcp.json'), 'utf8'))
    assert.strictEqual(updatedProjJson.mcpServers['project-agent-tool'].disabled, undefined)
  } finally {
    if (previousDshHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousDshHome
    if (previousAgentsHome === undefined) delete process.env.DSH_AGENTS_HOME
    else process.env.DSH_AGENTS_HOME = previousAgentsHome
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  }
})

test('runtime: resolveMcpClientPlugin safely resolves real or mocked mcp client without uninjected error', async () => {
  const dummyCtx = { root: {} }
  const pluginMod = await plugin.resolveMcpClientPlugin(dummyCtx)
  assert.ok(pluginMod, 'Should resolve mcp client module')
  assert.ok(typeof pluginMod.apply === 'function' || typeof pluginMod === 'function')
})

test('multi-project concurrency: projects run their MCPs independently without killing each other', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'test-proj-switch-'))
  const projA = path.join(tmpRoot, 'project-a')
  const projB = path.join(tmpRoot, 'project-b')
  const projEmpty = path.join(tmpRoot, 'project-empty')
  const dshHome = path.join(tmpRoot, 'global-dsh')

  const previousDshHome = process.env.DSH_HOME

  try {
    process.env.DSH_HOME = dshHome
    fs.mkdirSync(path.join(projA, '.agents'), { recursive: true })
    fs.mkdirSync(path.join(projB, '.agents'), { recursive: true })
    fs.mkdirSync(projEmpty, { recursive: true })
    fs.mkdirSync(dshHome, { recursive: true })
    fs.writeFileSync(path.join(dshHome, 'cordis.patch.yml'), '- insert: []\n', 'utf8')

    // Project A has tool-a enabled
    fs.writeFileSync(
      path.join(projA, '.agents', 'mcp.json'),
      JSON.stringify({ mcpServers: { 'tool-a': { command: 'node', args: ['./a.js'] } } }),
      'utf8'
    )

    // Project B has tool-b enabled
    fs.writeFileSync(
      path.join(projB, '.agents', 'mcp.json'),
      JSON.stringify({ mcpServers: { 'tool-b': { command: 'node', args: ['./b.js'] } } }),
      'utf8'
    )

    const mounted = []
    const disposed = []

    const fakePlugin = { name: '@deepseek-ai/dsh-mcp-client' }

    let rpcHandler = null
    const mockCtx = {
      root: {
        registry: {
          get(name) {
            if (name === '@deepseek-ai/dsh-mcp-client') return fakePlugin
            return undefined
          },
        },
      },
      plugin(pluginTarget, config) {
        mounted.push({ server: config.serverName, cwd: config.cwd })
        return {
          config,
          dispose() {
            disposed.push({ server: config.serverName, cwd: config.cwd })
          },
        }
      },
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
          return {
            list: () => [
              { path: projA, sessionIds: ['session-a'] },
              { path: projB, sessionIds: ['session-b'] },
              { path: projEmpty, sessionIds: ['session-empty'] },
            ],
          }
        }
        return undefined
      },
    }

    plugin.apply(mockCtx)

    // 1. Visit Project A session: mounts tool-a only
    const resA = await rpcHandler('list', { sessionId: 'session-a' })
    assert.strictEqual(resA.ok, true)
    assert.strictEqual(resA.value.projectRoot, projA)
    assert.strictEqual(resA.value.projectMcps.length, 1)
    assert.strictEqual(resA.value.projectMcps[0].serverName, 'tool-a')
    assert.strictEqual(mounted.length, 1)
    assert.ok(mounted[0].server.startsWith('tool-a-'))
    assert.strictEqual(disposed.length, 0)

    // 2. Visit Project B session: mounts tool-b; MUST NOT dispose tool-a from Project A!
    const resB = await rpcHandler('list', { sessionId: 'session-b' })
    assert.strictEqual(resB.ok, true)
    assert.strictEqual(resB.value.projectRoot, projB)
    assert.strictEqual(resB.value.projectMcps.length, 1)
    assert.strictEqual(resB.value.projectMcps[0].serverName, 'tool-b')
    // Both tool-a and tool-b remain active concurrently
    assert.strictEqual(mounted.length, 2)
    assert.ok(mounted[1].server.startsWith('tool-b-'))
    assert.strictEqual(disposed.length, 0, 'Project A tools should NOT be killed when viewing Project B')

    // 3. Visit Empty Project session: projectMcps is strictly empty, does not show tool-a or tool-b
    const resEmpty = await rpcHandler('list', { sessionId: 'session-empty' })
    assert.strictEqual(resEmpty.ok, true)
    assert.strictEqual(resEmpty.value.projectRoot, projEmpty)
    assert.deepStrictEqual(resEmpty.value.projectMcps, [], 'Empty project should have zero project MCPs')
    assert.strictEqual(disposed.length, 0, 'No tools killed by merely opening empty project')

    // 4. Toggle tool-a in Project A to disabled: only tool-a in Project A is disposed
    const toggleA = await rpcHandler('toggle-mcp', {
      id: 'project:tool-a',
      serverName: 'tool-a',
      enabled: false,
      scope: 'project',
      sessionId: 'session-a',
      configPath: path.join(projA, '.agents', 'mcp.json'),
    })
    assert.strictEqual(toggleA.ok, true)
    assert.strictEqual(disposed.length, 1)
    assert.ok(disposed[0].server.startsWith('tool-a-'))
  } finally {
    if (previousDshHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousDshHome
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  }
})

test('hash naming: appends project path hash to serverName to prevent collision between identical MCP names in different projects', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'test-hash-naming-'))
  const projA = path.join(tmpRoot, 'project-a')
  const projB = path.join(tmpRoot, 'project-b')
  const dshHome = path.join(tmpRoot, 'global-dsh')

  const previousDshHome = process.env.DSH_HOME

  try {
    process.env.DSH_HOME = dshHome
    fs.mkdirSync(path.join(projA, '.agents'), { recursive: true })
    fs.mkdirSync(path.join(projB, '.agents'), { recursive: true })
    fs.mkdirSync(dshHome, { recursive: true })
    fs.writeFileSync(path.join(dshHome, 'cordis.patch.yml'), '- insert: []\n', 'utf8')

    // Both projects configure an identical serverName: "kwin-mcp"
    fs.writeFileSync(
      path.join(projA, '.agents', 'mcp.json'),
      JSON.stringify({ mcpServers: { 'kwin-mcp': { command: 'uvx', args: ['kwin-mcp'] } } }),
      'utf8'
    )
    fs.writeFileSync(
      path.join(projB, '.agents', 'mcp.json'),
      JSON.stringify({ mcpServers: { 'kwin-mcp': { command: 'uvx', args: ['kwin-mcp'] } } }),
      'utf8'
    )

    const mounted = []
    const fakePlugin = { name: '@deepseek-ai/dsh-mcp-client' }

    let rpcHandler = null
    const mockCtx = {
      root: {
        registry: {
          get(name) {
            if (name === '@deepseek-ai/dsh-mcp-client') return fakePlugin
            return undefined
          },
        },
      },
      plugin(pluginTarget, config) {
        mounted.push({ serverName: config.serverName, cwd: config.cwd })
        return { config, dispose() {} }
      },
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
          return {
            list: () => [
              { path: projA, sessionIds: ['session-a'] },
              { path: projB, sessionIds: ['session-b'] },
            ],
          }
        }
        return undefined
      },
    }

    plugin.apply(mockCtx)

    // Mount Project A
    await rpcHandler('list', { sessionId: 'session-a' })
    assert.strictEqual(mounted.length, 1)

    // Mount Project B (same serverName)
    await rpcHandler('list', { sessionId: 'session-b' })
    assert.strictEqual(mounted.length, 2)

    // Both must be mounted, but with distinct scoped hash suffixes
    assert.ok(mounted[0].serverName.startsWith('kwin-mcp-'))
    assert.ok(mounted[1].serverName.startsWith('kwin-mcp-'))
    assert.notStrictEqual(mounted[0].serverName, mounted[1].serverName, 'Server names must be distinct!')

    // Both names must satisfy DSH length and pattern constraints
    const dshPattern = /^[A-Za-z0-9_-]{1,32}$/
    assert.ok(dshPattern.test(mounted[0].serverName))
    assert.ok(dshPattern.test(mounted[1].serverName))
    assert.ok(mounted[0].serverName.length <= 32)
    assert.ok(mounted[1].serverName.length <= 32)
  } finally {
    if (previousDshHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousDshHome
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  }
})

test('global MCP: turning off a global MCP immediately disposes its running fiber in Cordis', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'test-global-dispose-'))
  const dshHome = path.join(tmpRoot, 'global-dsh')
  const globalPatchPath = path.join(dshHome, 'cordis.patch.yml')

  const previousDshHome = process.env.DSH_HOME

  try {
    process.env.DSH_HOME = dshHome
    fs.mkdirSync(dshHome, { recursive: true })
    fs.writeFileSync(
      globalPatchPath,
      `- insert:
    - id: mcp-global-test
      name: '@deepseek-ai/dsh-mcp-client'
      config:
        serverName: global-live-tool
`,
      'utf8'
    )

    let disposedCalled = false
    const mockGlobalFiber = {
      config: { serverName: 'global-live-tool' },
      dispose() {
        disposedCalled = true
      },
    }

    const mockMcpClientRuntime = {
      name: '@deepseek-ai/dsh-mcp-client',
      fibers: [mockGlobalFiber],
    }

    let rpcHandler = null
    const mockCtx = {
      root: {
        registry: {
          values() {
            return [mockMcpClientRuntime]
          },
        },
      },
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
        return undefined
      },
    }

    plugin.apply(mockCtx)

    // Toggle global MCP to disabled: false
    const toggleRes = await rpcHandler('toggle-mcp', {
      id: 'global:mcp-global-test',
      serverName: 'global-live-tool',
      enabled: false,
      scope: 'global',
      configPath: globalPatchPath,
    })

    assert.strictEqual(toggleRes.ok, true)
    // Verify file written
    const content = fs.readFileSync(globalPatchPath, 'utf8')
    assert.ok(content.includes('disabled: true'))

    // Verify active global fiber was immediately disposed!
    assert.strictEqual(disposedCalled, true, 'Global fiber must be disposed when toggled off!')
  } finally {
    if (previousDshHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousDshHome
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  }
})


test('session-level tool isolation: LLM assembly strictly filters out project MCP tools belonging to other projects', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'test-tool-filter-'))
  const projA = path.join(tmpRoot, 'project-a')
  const projB = path.join(tmpRoot, 'project-b')
  const projEmpty = path.join(tmpRoot, 'project-empty')

  fs.mkdirSync(projA, { recursive: true })
  fs.mkdirSync(projB, { recursive: true })
  fs.mkdirSync(projEmpty, { recursive: true })

  const hashA = plugin.getProjectHash(projA)
  const hashB = plugin.getProjectHash(projB)

  let assembleHandler = null
  const mockCtx = {
    on(eventName, handler) {
      if (eventName === 'system-prompt/assemble') assembleHandler = handler
    },
    get(name) {
      if (name === 'connection') return { rpc: { handle() {} } }
      return undefined
    },
  }

  plugin.apply(mockCtx)
  assert.ok(typeof assembleHandler === 'function')

  const candidateTools = [
    { name: 'global_bash', description: 'built-in' },
    { name: `mcp__kwin-mcp-${hashA}__screenshot`, description: 'Proj A Tool' },
    { name: `mcp__postgres-${hashB}__query`, description: 'Proj B Tool' },
  ]

  // 1. In Project A session: only global and Project A tools survive
  const contextA = { agent: { session: { header: { cwd: projA } } } }
  const resA = await assembleHandler({}, contextA, () => Promise.resolve({ tools: [...candidateTools] }))
  assert.deepStrictEqual(
    resA.tools.map((t) => t.name),
    ['global_bash', `mcp__kwin-mcp-${hashA}__screenshot`],
    'Project A session must NOT see Project B tools!'
  )

  // 2. In Project B session: only global and Project B tools survive
  const contextB = { agent: { session: { header: { cwd: projB } } } }
  const resB = await assembleHandler({}, contextB, () => Promise.resolve({ tools: [...candidateTools] }))
  assert.deepStrictEqual(
    resB.tools.map((t) => t.name),
    ['global_bash', `mcp__postgres-${hashB}__query`],
    'Project B session must NOT see Project A tools!'
  )

  // 3. In Empty Project session: all project tools are filtered out!
  const contextEmpty = { agent: { session: { header: { cwd: projEmpty } } } }
  const resEmpty = await assembleHandler({}, contextEmpty, () => Promise.resolve({ tools: [...candidateTools] }))
  assert.deepStrictEqual(
    resEmpty.tools.map((t) => t.name),
    ['global_bash'],
    'Empty project must NOT see any other project tools!'
  )

  fs.rmSync(tmpRoot, { recursive: true, force: true })
})
