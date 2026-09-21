import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { tenantId } = body

  if (!tenantId) {
    throw createError({ statusCode: 400, statusMessage: 'tenantId wajib dikirim bos!' })
  }

  // Panggil Supabase dengan kekuatan Admin (Bypass RLS)
  const supabaseAdmin = serverSupabaseServiceRole(event)

  // Generate token acak (8 karakter)
  const newToken = Math.random().toString(36).substring(2, 10).toUpperCase() // Misal: 8F7D2K9A

  // Update tabel tenants
  const { error } = await supabaseAdmin
    .from('tenants')
    .update({ store_token: newToken })
    .eq('id', tenantId)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Gagal generate token: ' + error.message })
  }

  return { success: true, store_token: newToken }
})