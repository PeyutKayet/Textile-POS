<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
    <div class="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">Daftar Toko Baru</h1>
      
      <form @submit.prevent="handleRegister">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-semibold mb-2" for="storeName">Nama Toko</label>
          <input 
            v-model="form.storeName" 
            type="text" 
            id="storeName" 
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Misal: Textile Jaya"
            required
          >
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-semibold mb-2" for="fullName">Nama Lengkap (Owner/Kasir)</label>
          <input 
            v-model="form.fullName" 
            type="text" 
            id="fullName" 
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Nama kamu"
            required
          >
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-semibold mb-2" for="email">Email</label>
          <input 
            v-model="form.email" 
            type="email" 
            id="email" 
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="nama@toko.com"
            required
          >
        </div>
        
        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-semibold mb-2" for="password">Password</label>
          <input 
            v-model="form.password" 
            type="password" 
            id="password" 
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Minimal 6 karakter"
            required
          >
        </div>
        
        <button 
          type="submit" 
          class="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          :disabled="loading"
        >
          {{ loading ? 'Mendaftarkan...' : 'Daftar Sekarang' }}
        </button>

        <div class="mt-4 text-center text-sm text-gray-600">
          Sudah punya akun? <NuxtLink to="/login" class="text-blue-600 hover:underline">Login di sini</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const supabase = useSupabaseClient()
const loading = ref(false)

const form = ref({
  storeName: '',
  fullName: '',
  email: '',
  password: ''
})

const handleRegister = async () => {
  loading.value = true
  
  // Tahap 1: Daftar user ke Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: form.value.email,
    password: form.value.password,
  })
  
  if (authError) {
    alert('Gagal daftar Auth: ' + authError.message)
    loading.value = false
    return
  }

  if (authData.user) {
    // Generate UUID langsung di frontend biar gak usah manggil .select()
    const newTenantId = crypto.randomUUID()

    // Tahap 2: Insert data Toko ke tabel tenants (Tanpa .select()!)
    const { error: tenantError } = await supabase
      .from('tenants')
      .insert([{ 
        id: newTenantId, 
        name: form.value.storeName 
      }])
      
    if (tenantError) {
      alert('Berhasil daftar, tapi gagal bikin data toko: ' + tenantError.message)
      loading.value = false
      return
    }

    // Tahap 3: Insert data ke tabel profiles sebagai 'owner' pakai UUID yang tadi
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authData.user.id,
        tenant_id: newTenantId,
        full_name: form.value.fullName,
        role: 'owner'
      }])

    if (profileError) {
      alert('Gagal bikin profil: ' + profileError.message)
      loading.value = false
      return
    }

    alert('Toko berhasil didaftarkan! Silakan login.')
    navigateTo('/login') 
  }
  
  loading.value = false
}
</script>