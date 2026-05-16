import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schema } from './src/sanity/schemaTypes'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim()
if (!projectId) {
  throw new Error(
    '[Sanity Studio] NEXT_PUBLIC_SANITY_PROJECT_ID is required.'
  )
}

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  title: 'Souq Pro Studio',
  schema,
  plugins: [structureTool()],
})
