import { apiClient } from '@/lib/apiClient'

const payload = (response) => {
    const data = response.data?.data
    return data && typeof data === 'object' ? data : response.data?.message
}

export async function getVehicles(params = {}) {
    const response = await apiClient.get('/admin/bikes', { params })
    return payload(response)
}

export async function getVehicle(id) {
    const response = await apiClient.get(`/bikes/${id}`)
    return payload(response)
}

export async function getCampuses() {
    const response = await apiClient.get('/campuses/active')
    return payload(response) || []
}
