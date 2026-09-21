<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-4 md:py-6 space-y-6 pb-24 md:pb-8">
    
    <!-- Info Profil -->
    <div class="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 class="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2">
        <span class="text-lg">👤</span> Informasi Profil
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <label class="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Nama Lengkap</label>
          <div class="text-sm font-semibold text-gray-900 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
            {{ profile.full_name || 'Memuat...' }}
          </div>
        </div>
        <div>
          <label class="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Email Login</label>
          <div class="text-sm font-medium text-gray-700 bg-gray-50/70 p-3 rounded-lg border border-gray-100 truncate">
            {{ userEmail }}
          </div>
        </div>
        <div>
          <label class="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Peran (Role)</label>
          <div class="text-sm font-medium text-gray-700 bg-gray-50/70 p-3 rounded-lg border border-gray-100 capitalize">
            {{ profile.role || 'Memuat...' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Ganti Password -->
    <div class="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 class="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2">
        <span class="text-lg">🔒</span> Keamanan Akun
      </h2>
      
      <form @submit.prevent="updatePassword" class="space-y-4">
        <div class="max-w-md">
          <label class="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Password Baru</label>
          <input
            v-model="newPassword"
            type="password"
            placeholder="Minimal 6 karakter"
            class="w-full bg-white border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-sm font-medium transition"
            required
            minlength="6"
          >
        </div>
        <div class="pt-2">
          <button 
            type="submit" 
            :disabled="isLoading"
            class="w-full md:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50 shadow-sm shadow-blue-600/20"
          >
            {{ isLoading ? 'Menyimpan...' : 'Simpan Password Baru' }}
          </button>
        </div>
      </form>
    </div>
    
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'

definePageMeta({
  layout: 'dashboard'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const profile = ref({ full_name: '', role: '' })
const userEmail = ref('Memuat...')
const newPassword = ref('')
const isLoading = ref(false)

watchEffect(async () => {
  const userId = user.value?.id || user.value?.sub
  if (userId) {
    userEmail.value = user.value?.email || 'Email tidak ditemukan'
    
    const { data } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', userId)
      .maybeSingle()
      
    if (data) {
      profile.value = data
    }
  }
})

const updatePassword = async () => {
  if (newPassword.value.length < 6) {
    alert('Password baru minimal 6 karakter bos!')
    return
  }

  isLoading.value = true
  const { error } = await supabase.auth.updateUser({
    password: newPassword.value
  })
  isLoading.value = false

  if (error) {
    alert('Gagal ganti password: ' + error.message)
  } else {
    alert('Mantap! Password berhasil diperbarui.')
    newPassword.value = '' // Kosongin input lagi kalau sukses
  }
}
</script>