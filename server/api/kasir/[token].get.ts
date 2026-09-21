import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // Ambil token dari URL /api/kasir/[token]
  const token = getRouterParam(event, 'token')

  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Token tidak ditemukan' })
  }

  // Panggil Supabase pakai kekuatan Admin (Tembus RLS)
  const supabaseAdmin = serverSupabaseServiceRole(event)

  // 1. Cek token toko
  const { data: tenant, error: tenantError } = await supabaseAdmin
    .from('tenants')
    .select('id')
    .eq('store_token', token)
    .single()

  if (tenantError || !tenant) {
    throw createError({ statusCode: 404, statusMessage: 'Toko tidak valid atau kadaluarsa' })
  }

  // 2. Ambil daftar nama kasir
  const { data: employees, error: empError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name')
    .eq('tenant_id', tenant.id)
    .eq('role', 'kasir')
    .order('full_name')

  if (empError) {
    throw createError({ statusCode: 500, statusMessage: 'Gagal mengambil data pegawai' })
  }

  return {
    success: true,
    tenantId: tenant.id,
    employees: employees || []
  }
})