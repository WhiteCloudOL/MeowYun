export interface FocusSession {
  version: 1
  id: string
  phase: 'focus' | 'break'
  status: 'idle' | 'running' | 'paused' | 'complete'
  minutes: number
  remaining: number
  deadline: number
}
export function freshFocus(minutes = 25, phase: FocusSession['phase'] = 'focus'): FocusSession {
  return {
    version: 1,
    id: crypto.randomUUID(),
    phase,
    status: 'idle',
    minutes,
    remaining: minutes * 60000,
    deadline: 0,
  }
}
export function remainingFocus(session: FocusSession, now: number): number {
  // 系统时钟被调回过去时也不能让剩余时间和进度超过本段总时长。
  return Math.max(
    0,
    Math.min(
      session.minutes * 60000,
      session.status === 'running' ? session.deadline - now : session.remaining,
    ),
  )
}
export function validateFocus(value: unknown): FocusSession {
  if (!value || typeof value !== 'object') throw Error('计时记录格式不正确')
  const s = value as Record<string, unknown>
  if (
    s.version !== 1 ||
    typeof s.id !== 'string' ||
    !/^[a-zA-Z0-9_-]{1,100}$/.test(s.id) ||
    !['focus', 'break'].includes(String(s.phase)) ||
    !['idle', 'running', 'paused', 'complete'].includes(String(s.status))
  )
    throw Error('计时记录无法识别')
  for (const key of ['minutes', 'remaining', 'deadline'])
    if (typeof s[key] !== 'number' || !Number.isFinite(s[key])) throw Error('计时数值不正确')
  const minutes = s.minutes as number,
    remaining = s.remaining as number,
    deadline = s.deadline as number
  if (
    !Number.isInteger(minutes) ||
    minutes < 1 ||
    minutes > 180 ||
    remaining < 0 ||
    remaining > minutes * 60000 ||
    deadline < 0 ||
    deadline > 8640000000000000
  )
    throw Error('计时数值超出范围')
  return {
    version: 1,
    id: s.id,
    phase: s.phase as FocusSession['phase'],
    status: s.status as FocusSession['status'],
    minutes,
    remaining,
    deadline,
  }
}
