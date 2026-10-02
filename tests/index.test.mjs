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
