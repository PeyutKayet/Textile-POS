<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
      <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">Login Juragan</h1>
      
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-semibold mb-2" for="email">Email</label>
          <input 
            v-model="email" 
            type="email" 
            id="email" 
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="nama@toko.com"
            required
          >
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-semibold mb-2" for="password">Password</label>
          <input 
            v-model="password" 
            type="password" 
            id="password" 
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="••••••••"
            required
          >
        </div>

        <div class="mb-6 flex items-center gap-2">
          <input 
            type="checkbox" 
            id="remember" 
            v-model="rememberMe"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          >
          <label for="remember" class="text-sm text-gray-600 cursor-pointer">Ingat akun saya</label>
        </div>
        
        <button 
          type="submit" 
          class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          :disabled="loading"
        >
          {{ loading ? 'Memeriksa...' : 'Masuk' }}
        </button>

        <div class="mt-4 text-center text-sm text-gray-600">
          Belum punya akun toko? <NuxtLink to="/register" class="text-blue-600 hover:underline">Daftar di sini</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)

// Cek apakah sebelumnya ada data login yang disimpan saat halaman dimuat
onMounted(() => {
  const savedEmail = localStorage.getItem('pos_email')
  const savedPass = localStorage.getItem('pos_pass')
  
  if (savedEmail && savedPass) {
    email.value = savedEmail
    password.value = atob(savedPass) // Buka kode (decode) password
    rememberMe.value = true
  }
})

const handleLogin = async () => {
  loading.value = true
  
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })
  
  if (error) {
    alert('Gagal login: ' + error.message)
  } else {
    // Simpan atau hapus data dari local storage berdasarkan status checkbox
    if (rememberMe.value) {
      localStorage.setItem('pos_email', email.value)
      localStorage.setItem('pos_pass', btoa(password.value)) // Simpan password dengan kode (encode) ringan
    } else {
      localStorage.removeItem('pos_email')
      localStorage.removeItem('pos_pass')
    }
    
    navigateTo('/') 
  }
  
  loading.value = false
}
</script>