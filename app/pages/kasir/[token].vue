<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
      <div class="text-center mb-6">
        <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
          📦
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Akses Pegawai</h1>
        <p class="text-gray-500 text-sm mt-1">Pilih nama dan masukkan PIN untuk cek stok</p>
      </div>

      <div v-if="isLoadingData" class="text-center py-8 text-gray-500 text-sm font-medium">
        ⏳ Memuat data toko...
      </div>

      <div v-else-if="!tenantValid" class="text-center py-8 text-red-500 font-bold bg-red-50 rounded-xl border border-red-100">
        ⚠️ Link toko tidak valid atau kadaluarsa!
      </div>

      <div v-else class="space-y-5">
        <!-- Error Message -->
        <div v-if="errorMsg" class="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-200 text-center">
          {{ errorMsg }}
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Nama Pegawai</label>
          <select v-model="selectedEmpId" class="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-sm font-semibold text-gray-800 transition cursor-pointer">
            <option value="" disabled>-- Pilih Nama Kamu --</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">
              {{ emp.full_name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">PIN Rahasia</label>
          <input 
            v-model="pin" 
            @keyup.enter="loginPegawai"
            type="password" 
            placeholder="••••••" 
            class="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-center tracking-[0.75em] font-bold text-xl text-gray-900 transition"
          >
        </div>

        <button 
          @click="loginPegawai" 
          :disabled="isSubmitting || !selectedEmpId || !pin" 
          class="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 shadow-sm shadow-blue-600/20 mt-2"
        >
          {{ isSubmitting ? 'Mencocokkan...' : 'Masuk ke Katalog Stok' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Kita pakai layout kosong biar nggak ada sidebar/navbar dashboard Owner
definePageMeta({
  layout: false
})

const route = useRoute()
const supabase = useSupabaseClient()
const token = route.params.token // Ambil token dari URL

const isLoadingData = ref(true)
const tenantValid = ref(false)
const employees = ref([])

const selectedEmpId = ref('')
const pin = ref('')
const isSubmitting = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  try {
    // Tembak API jalur belakang biar tembus RLS
    const res = await $fetch(`/api/kasir/${token}`)
    
    if (res.success) {
      tenantValid.value = true
      employees.value = res.employees
    }
  } catch (error) {
    // Kalau API ngasih error (misal 404 Token tidak valid)
    tenantValid.value = false
  } finally {
    isLoadingData.value = false
  }
})

const loginPegawai = async () => {
  errorMsg.value = ''
  isSubmitting.value = true

  // Cari nama asli pegawai buat ngerakit email dummy
  const emp = employees.value.find(e => e.id === selectedEmpId.value)
  if (!emp) return
  
  const safeName = emp.full_name.replace(/\s+/g, '').toLowerCase()
  const dummyEmail = `${safeName}_${token.toLowerCase()}@juraganpos.app`

  // Login ke Supabase pakai dummy email & PIN
  const { error } = await supabase.auth.signInWithPassword({
    email: dummyEmail,
    password: pin.value
  })

  if (error) {
    errorMsg.value = 'PIN salah, coba lagi bos!'
    isSubmitting.value = false
  } else {
    // PENTING: Pakai window.location.href agar halaman ter-refresh penuh.
    // Ini memastikan server membaca cookie baru dengan sempurna agar tidak ditendang ke /login.
    window.location.href = '/bahan'
  }
}
</script>