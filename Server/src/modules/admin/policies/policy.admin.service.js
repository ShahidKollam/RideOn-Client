import prisma from '../../../config/prisma.js'

const DEFAULTS = {
  gstEnabled: true,
  gstRate: 18,
  platformFeeEnabled: true,
  platformFee: 20,
  helmetFirstPrice: 0,
  helmetSecondPrice: 0,
  lateHelmetFee: 0,
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
})

export const getPolicies = async () => shape(await getOrCreate())

export const updatePolicies = async (data) => {
  const current = await getOrCreate()
  const updated = await prisma.systemSetting.update({
    where: { id: current.id },
    data: {
      ...(data.gstEnabled !== undefined && { gstEnabled: data.gstEnabled }),
      ...(data.gstRate !== undefined && { gstRate: data.gstRate }),
      ...(data.platformFeeEnabled !== undefined && { platformFeeEnabled: data.platformFeeEnabled }),
      ...(data.platformFee !== undefined && { platformFee: data.platformFee }),
      ...(data.helmetFirstPrice !== undefined && { helmetFirstPrice: data.helmetFirstPrice }),
      ...(data.helmetSecondPrice !== undefined && { helmetSecondPrice: data.helmetSecondPrice }),
      ...(data.lateHelmetFee !== undefined && { lateHelmetFee: data.lateHelmetFee }),
    },
  })
  return shape(updated)
}
