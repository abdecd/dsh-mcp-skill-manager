import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { McpSkillButton } from './McpSkillButton.tsx'

export const inject = ['slots', 'connection']

export function apply(ctx: Context): void {
  ctx.slots.register(
    {
      name: 'conversation.input.right',
      id: 'mcp-skill-manager-button',
      order: 0,
      inject: (sessionId: string) => {
        const conn = (ctx as any).connection ?? ctx.get('connection')
        return {
          sessionId,
          rpc: conn?.rpc,
        }
      },
    },
    McpSkillButton,
  )
}
