import { type SchemaTypeDefinition } from 'sanity'
import { productType } from './productType'
import { categoryType } from './categoryType'
import { heroType } from './heroType'
import { shippingProfileType } from './shippingProfileType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [productType, categoryType, heroType, shippingProfileType],
}
