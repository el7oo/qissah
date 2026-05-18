import { type SchemaTypeDefinition } from 'sanity'
import { productType } from './productType'
import { categoryType } from './categoryType'
import { shippingProfileType } from './shippingProfileType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [productType, categoryType, shippingProfileType],
}
