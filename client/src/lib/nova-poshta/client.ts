import type { NovaPoshtaCity, NovaPoshtaWarehouse } from '@/types'

const NOVA_POSHTA_API_URL = 'https://api.novaposhta.ua/v2.0/json/'
const API_KEY = process.env.NOVA_POSHTA_API_KEY || ''

// API Response types
interface NovaPoshtaResponse<T> {
  success: boolean
  data: T[]
  errors: string[]
  warnings: string[]
  info: {
    totalCount: number
  }
}

interface NovaPoshtaRequest {
  apiKey: string
  modelName: string
  calledMethod: string
  methodProperties: Record<string, unknown>
}

// Make API request to Nova Poshta
async function makeRequest<T>(
  modelName: string,
  calledMethod: string,
  methodProperties: Record<string, unknown>
): Promise<T[]> {
  const requestBody: NovaPoshtaRequest = {
    apiKey: API_KEY,
    modelName,
    calledMethod,
    methodProperties,
  }

  try {
    const response = await fetch(NOVA_POSHTA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`Nova Poshta API error: ${response.status}`)
    }

    const result: NovaPoshtaResponse<T> = await response.json()

    if (!result.success) {
      console.error('Nova Poshta API errors:', result.errors)
      return []
    }

    return result.data
  } catch (error) {
    console.error('Nova Poshta API request failed:', error)
    return []
  }
}

// Search cities by name
export async function searchCities(query: string): Promise<NovaPoshtaCity[]> {
  if (!query || query.length < 2) return []

  const data = await makeRequest<NovaPoshtaCity>('Address', 'searchSettlements', {
    CityName: query,
    Limit: 20,
    Page: 1,
  })

  // Transform response if needed
  return data.map((city) => ({
    Ref: city.Ref,
    Description: city.Description,
    DescriptionRu: city.DescriptionRu,
    Area: city.Area,
    AreaDescription: city.AreaDescription,
  }))
}

// Get cities (alternative method)
export async function getCities(query?: string): Promise<NovaPoshtaCity[]> {
  const properties: Record<string, unknown> = {
    Page: 1,
    Limit: 50,
  }

  if (query) {
    properties.FindByString = query
  }

  return makeRequest<NovaPoshtaCity>('Address', 'getCities', properties)
}

// Get warehouses by city
export async function getWarehouses(
  cityRef: string,
  warehouseType?: 'Branch' | 'Postomat' | 'Store'
): Promise<NovaPoshtaWarehouse[]> {
  if (!cityRef) return []

  const properties: Record<string, unknown> = {
    CityRef: cityRef,
    Page: 1,
    Limit: 500,
  }

  if (warehouseType) {
    // Filter by warehouse type
    const typeOfWarehouse: Record<string, string> = {
      Branch: '841339c7-591a-42e2-8233-7a0a00f0ed6f', // Відділення
      Postomat: 'f9316480-5f2d-425d-bc2c-ac7cd29decf0', // Поштомат
      Store: '6f8c7162-4b72-4b0a-88e5-906c8e7c9bc6', // Пункт
    }
    properties.TypeOfWarehouseRef = typeOfWarehouse[warehouseType]
  }

  return makeRequest<NovaPoshtaWarehouse>('Address', 'getWarehouses', properties)
}

// Search warehouses by string
export async function searchWarehouses(
  cityRef: string,
  query: string
): Promise<NovaPoshtaWarehouse[]> {
  if (!cityRef) return []

  const properties: Record<string, unknown> = {
    CityRef: cityRef,
    FindByString: query,
    Page: 1,
    Limit: 50,
  }

  return makeRequest<NovaPoshtaWarehouse>('Address', 'getWarehouses', properties)
}

// Get streets by city
export async function getStreets(
  cityRef: string,
  query?: string
): Promise<{ Ref: string; Description: string }[]> {
  if (!cityRef) return []

  const properties: Record<string, unknown> = {
    CityRef: cityRef,
    Page: 1,
    Limit: 50,
  }

  if (query) {
    properties.FindByString = query
  }

  return makeRequest<{ Ref: string; Description: string }>(
    'Address',
    'getStreet',
    properties
  )
}

// Calculate delivery cost
export async function calculateDeliveryCost(
  citySenderRef: string,
  cityRecipientRef: string,
  weight: number,
  cost: number,
  serviceType: 'WarehouseWarehouse' | 'WarehouseDoors' | 'DoorsWarehouse' | 'DoorsDoors' = 'WarehouseWarehouse'
): Promise<{ Cost: number; AssessedCost: number } | null> {
  const properties = {
    CitySender: citySenderRef,
    CityRecipient: cityRecipientRef,
    Weight: weight.toString(),
    ServiceType: serviceType,
    Cost: cost.toString(),
    CargoType: 'Cargo',
    SeatsAmount: '1',
  }

  const data = await makeRequest<{ Cost: number; AssessedCost: number }>(
    'InternetDocument',
    'getDocumentPrice',
    properties
  )

  return data[0] || null
}

// Get estimated delivery date
export async function getDeliveryDate(
  citySenderRef: string,
  cityRecipientRef: string,
  serviceType: 'WarehouseWarehouse' | 'WarehouseDoors' = 'WarehouseWarehouse'
): Promise<string | null> {
  const today = new Date()
  const dateTime = today.toISOString().split('T')[0].replace(/-/g, '.')

  const properties = {
    CitySender: citySenderRef,
    CityRecipient: cityRecipientRef,
    ServiceType: serviceType,
    DateTime: dateTime,
  }

  const data = await makeRequest<{ DeliveryDate: { date: string } }>(
    'InternetDocument',
    'getDocumentDeliveryDate',
    properties
  )

  if (data[0]?.DeliveryDate?.date) {
    return data[0].DeliveryDate.date.split(' ')[0]
  }

  return null
}

// Format warehouse name for display
export function formatWarehouseName(warehouse: NovaPoshtaWarehouse): string {
  return `${warehouse.Description} (${warehouse.Number})`
}

// Get city display name
export function formatCityName(city: NovaPoshtaCity): string {
  if (city.AreaDescription) {
    return `${city.Description}, ${city.AreaDescription}`
  }
  return city.Description
}
