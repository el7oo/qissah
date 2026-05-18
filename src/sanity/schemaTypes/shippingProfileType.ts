import { defineField, defineType } from 'sanity';
import { algeriaWilayas } from '../../lib/algeria-wilayas';

export const shippingProfileType = defineType({
  name: 'shippingProfile',
  title: 'Shipping Profile (قوائم التوصيل)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Profile Name (اسم القائمة)',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'e.g. "Standard Delivery", "Heavy Items", "Yalidine Express"',
    }),
    defineField({
      name: 'rates',
      title: 'Wilaya Rates',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'wilayaId', title: 'Wilaya ID', type: 'number', validation: Rule => Rule.required() },
          { name: 'wilayaName', title: 'Wilaya Name', type: 'string', readOnly: true },
          { name: 'homePrice', title: 'Home Delivery Price (DZD)', type: 'number' },
          { name: 'deskPrice', title: 'Desk Delivery Price (DZD)', type: 'number' }
        ],
        preview: {
          select: {
            title: 'wilayaName',
            home: 'homePrice',
            desk: 'deskPrice',
            id: 'wilayaId'
          },
          prepare(selection: any) {
            return {
              title: `${selection.id} - ${selection.title}`,
              subtitle: `Home: ${selection.home || 'N/A'} | Desk: ${selection.desk || 'N/A'}`
            }
          }
        }
      }],
      initialValue: () => {
        return algeriaWilayas.map(w => ({
          _key: Math.random().toString(36).substring(7),
          wilayaId: w.id,
          wilayaName: w.nameAr,
          homePrice: w.homePrice,
          deskPrice: w.deskPrice
        }));
      }
    }),
  ],
})
