import { neon } from "@neondatabase/serverless"

let client: ReturnType<typeof neon> | null = null

function getClient() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set")
  }

  if (!client) {
    client = neon(databaseUrl)
  }

  return client
}

export const sql = (strings: TemplateStringsArray, ...values: any[]) => {
  const sqlClient = getClient()
  return sqlClient(strings, ...values)
}
