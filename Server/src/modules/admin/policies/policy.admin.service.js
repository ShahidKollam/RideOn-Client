import prisma from '../../../config/prisma.js'

const DEFAULT_CANCELLATION_POLICY = {
  enabled: true,
  rules: [
    { hours: 72, percent: 25 },
    { hours: 48, percent: 50 },
    { hours: 24, percent: 75 },
    { hours: 0, percent: 100 },
  ],
}

const DEFAULTS = {
  gstEnabled: true,
  gstRate: 18,
  platformFeeEnabled: true,
  platformFee: 20,
  helmetFirstPrice: 0,
  helmetSecondPrice: 0,
  lateHelmetFee: 0,
  bookingBufferMinutes: 15,
  disruptionPenalty: 150,
  cancellationPolicy: DEFAULT_CANCELLATION_POLICY,
}

const normalizeCancellationPolicy = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_CANCELLATION_POLICY }
  }

  const enabled = raw.enabled !== false
  let rules = Array.isArray(raw.rules) ? raw.rules : DEFAULT_CANCELLATION_POLICY.rules

  rules = rules
    .map((r) => ({
      hours: Number(r.hours),
      percent: Number(r.percent),
    }))
    .filter(
      (r) =>
        Number.isFinite(r.hours) &&
        Number.isFinite(r.percent) &&
        r.percent >= 0 &&
        r.percent <= 100
    )
    .sort((a, b) => b.hours - a.hours)

  if (rules.length === 0) {
    rules = [...DEFAULT_CANCELLATION_POLICY.rules]
  }

  return { enabled, rules }
}

const getOrCreate = async () => {
  let settings = await prisma.systemSetting.findFirst()
  if (!settings) {
    settings = await prisma.systemSetting.create({ data: DEFAULTS })
  }
  return settings
}

const shape = (s) => ({
  gstEnabled: s.gstEnabled,
  gstRate: s.gstRate,
  platformFeeEnabled: s.platformFeeEnabled,
  platformFee: s.platformFee,
  helmetFirstPrice: s.helmetFirstPrice,
  helmetSecondPrice: s.helmetSecondPrice,
  lateHelmetFee: s.lateHelmetFee,
  bookingBufferMinutes: s.bookingBufferMinutes ?? DEFAULTS.bookingBufferMinutes,
  disruptionPenalty: s.disruptionPenalty ?? DEFAULTS.disruptionPenalty,
  cancellationPolicy: normalizeCancellationPolicy(
    s.cancellationPolicy ?? DEFAULT_CANCELLATION_POLICY
  ),
})

export const getPolicies = async () => shape(await getOrCreate())

export const updatePolicies = async (data) => {
  const current = await getOrCreate()
  const updated = await prisma.systemSetting.update({
    where: { id: current.id },
    data: {
      ...(data.gstEnabled !== undefined && { gstEnabled: data.gstEnabled }),
      ...(data.gstRate !== undefined && { gstRate: data.gstRate }),
      ...(data.platformFeeEnabled !== undefined && {
        platformFeeEnabled: data.platformFeeEnabled,
      }),
      ...(data.platformFee !== undefined && { platformFee: data.platformFee }),
      ...(data.helmetFirstPrice !== undefined && {
        helmetFirstPrice: data.helmetFirstPrice,
      }),
      ...(data.helmetSecondPrice !== undefined && {
        helmetSecondPrice: data.helmetSecondPrice,
      }),
      ...(data.lateHelmetFee !== undefined && { lateHelmetFee: data.lateHelmetFee }),
      ...(data.bookingBufferMinutes !== undefined && {
        bookingBufferMinutes: data.bookingBufferMinutes,
      }),
      ...(data.disruptionPenalty !== undefined && {
        disruptionPenalty: data.disruptionPenalty,
      }),
      ...(data.cancellationPolicy !== undefined && {
        cancellationPolicy: normalizeCancellationPolicy(data.cancellationPolicy),
      }),
    },
  })
  return shape(updated)
}