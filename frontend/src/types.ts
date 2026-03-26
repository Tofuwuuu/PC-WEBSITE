export type Product = {
  id: string
  name: string
  description: string | null
  url: string | null
  created_at: string
}

export type ProductCreate = {
  name: string
  description?: string
  url?: string
}

export type ProductUpdate = {
  name?: string
  description?: string | null
  url?: string | null
}

