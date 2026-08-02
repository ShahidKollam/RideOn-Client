import { apiClient } from '@/lib/apiClient'

const payload = (response) => {
    const data = response.data?.data
    return data && typeof data === 'object' ? data : response.data?.message
}

export async function getPricingPackages() {
    const response = await apiClient.get('/pricing')
    return payload(response)?.pricings || []
}
