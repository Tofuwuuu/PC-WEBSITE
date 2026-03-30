export type Product = {
  id: string
  name: string
  category: string
  description: string | null
  url: string | null
  created_at: string
}

export type ProductCreate = {
  name: string
  category?: string
  description?: string
  url?: string
}

export type ProductUpdate = {
  name?: string
  category?: string
  description?: string | null
  url?: string | null
}

