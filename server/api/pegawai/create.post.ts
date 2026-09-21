import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Harus login dulu bos!' })
  }

  // Panggil Supabase dengan kekuatan Admin
  const supabaseAdmin = serverSupabaseServiceRole(event)

  // Cek apakah user yang request ini role-nya admin
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Cuma bos (admin) yang bisa nambah pegawai!' })
  }

  const body = await readBody(event)
  const { fullName, pin, tenantId, storeToken } = body

  if (!fullName || !pin || !tenantId || !storeToken) {
    throw createError({ statusCode: 400, statusMessage: 'Data tidak lengkap bos!' })
  }

  // Bikin email dummy: namatanpaspasi_token@juraganpos.app
  const safeName = fullName.replace(/\s+/g, '').toLowerCase()
  const dummyEmail = `${safeName}_${storeToken.toLowerCase()}@juraganpos.app`

  // 1. Bikin user baru di Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: dummyEmail,
    password: String(pin), // PIN kita jadikan password
    email_confirm: true    // Auto-confirm biar nggak perlu cek email beneran
  })

  if (authError) {
    throw createError({ statusCode: 500, statusMessage: authError.message })
  }

  // 2. Simpan datanya ke tabel profiles pakai ID dari auth tadi
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: authData.user.id,
      tenant_id: tenantId,
      full_name: fullName,
      role: 'kasir', // Kembalikan ke 'kasir' biar lolos constraint database
      pin: String(pin) // Simpan buat dikirim via WA Owner
    })

  if (profileError) {
    // Kalau gagal simpan profile, hapus lagi user-nya biar nggak nyampah
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    throw createError({ statusCode: 500, statusMessage: profileError.message })
  }

  return { success: true, message: 'Akun pegawai berhasil didaftarkan!' }
})