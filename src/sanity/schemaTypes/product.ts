export const product = {
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [{ type: 'image' }],
    },
    {
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (Rule: any) => Rule.required().min(0),
    },
    {
      name: 'discountPrice',
      title: 'Discount Price',
      type: 'number',
      validation: (Rule: any) => Rule.min(0),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Perfumes', value: 'perfumes' },
          { title: 'Accessories', value: 'accessories' },
          { title: 'Clothing', value: 'clothing' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'brand',
      title: 'Brand',
      type: 'string',
      description: 'The brand or manufacturer of the product',
    },
    {
      name: 'sku',
      title: 'SKU (Stock Keeping Unit)',
      type: 'string',
      validation: (Rule: any) => Rule.required().unique(),
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    },
    {
      name: 'stockStatus',
      title: 'Stock Status',
      type: 'string',
      options: {
        list: [
          { title: 'In Stock', value: 'in_stock' },
          { title: 'Out of Stock', value: 'out_of_stock' },
          { title: 'Pre-order', value: 'preorder' },
        ],
      },
      initialValue: 'in_stock',
    },
    {
      name: 'shippingCost',
      title: 'Shipping Cost',
      type: 'number',
      description: 'Specific delivery price for this product. Leave blank or 0 for free shipping.',
    },
  ],
};
