import { defineField, defineType } from 'sanity'

export const productType = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price (DZD)',
      type: 'number',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'discountPrice',
      title: 'Discount Price (DZD) - Optional',
      type: 'number',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'gallery',
      title: 'Image Gallery',
      type: 'array',
      of: [{ type: 'image' }],
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      weak: true,
    }),
    defineField({
      name: 'stockStatus',
      title: 'Stock Status',
      type: 'string',
      options: {
        list: [
          { title: 'In Stock', value: 'in_stock' },
          { title: 'Out of Stock', value: 'out_of_stock' },
          { title: 'Preorder', value: 'preorder' },
        ]
      },
      initialValue: 'in_stock',
    }),
    defineField({
      name: 'shippingCost',
      title: 'Default Shipping Cost (DZD) - Fallback',
      type: 'number',
      initialValue: 400,
    }),
    defineField({
      name: 'customShipping',
      title: 'Custom Wilaya Shipping Prices (Overrides Default)',
      description: 'Add specific shipping prices for certain Wilayas for this product.',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'wilayaId', title: 'Wilaya Number (1-58)', type: 'number' },
          { name: 'homePrice', title: 'Home Delivery Price', type: 'number' },
          { name: 'deskPrice', title: 'Desk/Office Delivery Price', type: 'number' }
        ],
        preview: {
          select: { title: 'wilayaId', home: 'homePrice', desk: 'deskPrice' },
          prepare(selection: any) {
            return { title: `Wilaya ${selection.title}`, subtitle: `Home: ${selection.home} DZD | Desk: ${selection.desk} DZD` }
          }
        }
      }]
    }),
    defineField({
      name: 'deliveryType',
      title: 'Delivery Type',
      type: 'string',
      options: {
        list: [
          { title: "Home Delivery", value: 'home' },
          { title: "Office/Desk Delivery", value: 'office' },
          { title: "Pickup Point", value: 'pickup' },
        ]
      },
      initialValue: 'home',
    }),
    defineField({
      name: 'geographicCoverage',
      title: 'Geographic Coverage',
      type: 'string',
      initialValue: 'التوصيل متوفر الى 69 ولاية في الجزائر',
      description: 'Highlight the delivery availability for this product.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
      subtitle: 'price',
    },
  },
})
