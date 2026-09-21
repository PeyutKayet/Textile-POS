<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 md:py-6 space-y-5 pb-24 md:pb-8">
    
    <!-- Top Section: Info Link & Tambah Pegawai -->
    <div class="flex flex-col md:flex-row md:items-stretch justify-between gap-4">
      
      <!-- Link Login Pegawai -->
      <div class="flex-1 bg-blue-50/50 p-4 md:p-5 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shadow-blue-500/5">
        <div class="min-w-0">
          <h2 class="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-1">Link Akses Pegawai (Lihat Stok)</h2>
          <p class="text-blue-600 text-sm font-mono font-bold truncate">{{ loginUrl }}</p>
        </div>
        <button @click="copyLink" class="shrink-0 bg-white border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-50 transition shadow-sm">
          Copy Link
        </button>
      </div>

      <!-- Tombol Tambah (Desktop nyamping, Mobile di bawah) -->
      <button @click="tambahPegawai" class="shrink-0 bg-gray-900 text-white px-6 py-4 rounded-xl text-sm font-bold hover:bg-gray-800 transition shadow-sm flex items-center justify-center gap-2">
        <span class="text-lg leading-none">+</span> Tambah Pegawai
      </button>

    </div>

    <!-- List Pegawai -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <!-- Header Desktop -->
      <div class="hidden md:grid grid-cols-3 gap-4 px-5 py-4 bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
        <div>Nama Lengkap</div>
        <div>PIN Akses</div>
        <div class="text-right">Aksi</div>
      </div>

      <!-- Loop Data -->
      <div class="divide-y divide-gray-100">
        <div v-for="emp in employees" :key="emp.id" class="p-4 md:px-5 md:py-4 flex flex-col md:grid md:grid-cols-3 md:items-center gap-3 md:gap-4 hover:bg-gray-50/80 transition">
          
          <!-- Nama -->
          <div>
            <div class="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Pegawai</div>
            <div class="font-bold text-sm text-gray-900">{{ emp.full_name }}</div>
          </div>

          <!-- PIN -->
          <div>
            <div class="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">PIN Akses</div>
            <div class="inline-flex items-center justify-center bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-mono font-bold border border-gray-200">
              {{ emp.pin || 'Belum diset' }}
            </div>
          </div>

          <!-- Aksi -->
          <div class="mt-2 md:mt-0 md:text-right">
            <button @click="shareWa(emp)" class="w-full md:w-auto bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-100 transition shadow-sm flex items-center justify-center md:inline-flex gap-1.5">
              📱 Share WA
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="employees.length === 0" class="p-12 text-center flex flex-col items-center justify-center">
          <span class="text-3xl mb-3 opacity-40">👥</span>
          <p class="text-sm font-semibold text-gray-700">Belum ada pegawai</p>
          <p class="text-xs text-gray-400 mt-1">Klik tombol "+ Tambah Pegawai" untuk membuat akun akses stok.</p>
        </div>
      </div>
    </div>

    <!-- Modal Tambah Pegawai -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
      <div class="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 class="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
          <span class="text-xl">👤</span> Tambah Akun Pegawai
        </h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
            <input v-model="formEmp.fullName" type="text" placeholder="Contoh: Budi Santoso" class="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-sm font-medium transition">
          </div>
          <div>
            <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">PIN Login (Angka)</label>
            <input v-model="formEmp.pin" type="number" placeholder="Contoh: 123456" class="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-sm font-mono font-medium transition">
          </div>
        </div>
        
        <div class="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button @click="showModal = false" class="w-full sm:w-auto px-5 py-2.5 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm font-bold">Batal</button>
          <button @click="simpanPegawai" :disabled="isSubmitting" class="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 text-sm font-bold shadow-sm shadow-blue-600/20">
            {{ isSubmitting ? 'Menyimpan...' : 'Simpan Pegawai' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, watchEffect, computed } from 'vue'

definePageMeta({
  layout: 'dashboard'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const tenantInfo = ref(null)
const employees = ref([])
const tenantId = ref(null)

// Bikin URL dinamis sesuai domain saat ini
const loginUrl = computed(() => {
  if (!tenantInfo.value?.store_token) return 'Menyiapkan link...'
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  return `${baseUrl}/kasir/${tenantInfo.value.store_token}`
})

// Load data & generate token otomatis kalau belum ada
watchEffect(async () => {
  const userId = user.value?.id || user.value?.sub
  if (userId) {
    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', userId).maybeSingle()

    if (profile) {
      // Ubah logika: Pastikan cuma 'owner' yang bisa buka halaman manajemen ini
      if (profile.role !== 'owner') {
        alert('HALO BOS! Halaman ini khusus Owner. Silakan LOGOUT dulu!')
        return 
      }

      tenantId.value = profile.tenant_id
      
      const { data: tenant } = await supabase.from('tenants').select('store_token').eq('id', profile.tenant_id).maybeSingle()
      
      if (tenant) {
        // Kalau toko belum punya token rahasia, bikinin otomatis lewat API (tembus RLS)
        if (!tenant.store_token) {
          try {
            const res = await $fetch('/api/tenant/generate-token', {
              method: 'POST',
              body: { tenantId: profile.tenant_id }
            })
            tenantInfo.value = { ...tenant, store_token: res.store_token }
          } catch (err) {
            console.error('Gagal generate token otomatis:', err)
          }
        } else {
          tenantInfo.value = tenant
        }
      }
      
      loadEmployees(profile.tenant_id)
    }
  }
})

const loadEmployees = async (tId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, pin')
    .eq('tenant_id', tId)
    .eq('role', 'kasir') // Tarik role kasir lagi // SEKARANG KITA CARI ROLE 'pegawai'
  
  // Tambahin console.log buat intip balasan Supabase
  console.log('DEBUG PEGAWAI:', { data, error })
  
  if (data) employees.value = data
}

// State Modal & Form
const showModal = ref(false)
const isSubmitting = ref(false)
const formEmp = ref({ fullName: '', pin: '' })

const tambahPegawai = () => {
  formEmp.value = { fullName: '', pin: '' } // Reset form
  showModal.value = true
}

const simpanPegawai = async () => {
  if (!formEmp.value.fullName || !formEmp.value.pin) {
    alert('Nama dan PIN wajib diisi bos!')
    return
  }

  isSubmitting.value = true
  try {
    const result = await $fetch('/api/pegawai/create', {
      method: 'POST',
      body: {
        fullName: formEmp.value.fullName,
        pin: formEmp.value.pin,
        tenantId: tenantId.value,
        storeToken: tenantInfo.value?.store_token || ''
      }
    })
    
    alert('Mantap! ' + result.message)
    showModal.value = false
    loadEmployees(tenantId.value) // Refresh tabel otomatis
  } catch (error) {
    alert('Gagal simpan: ' + error.statusMessage)
  } finally {
    isSubmitting.value = false
  }
}

const shareWa = (emp) => {
  if (!emp.pin) {
    alert('PIN pegawai ini belum diset!')
    return
  }
  const text = `Assalamualaikum ${emp.full_name} 👋\n\nBerikut akses untuk melihat katalog stok toko:\n\nLink:\n${loginUrl.value}\n\nPIN:\n${emp.pin}`
  const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
  window.open(waUrl, '_blank')
}

const copyLink = () => {
  navigator.clipboard.writeText(loginUrl.value)
  alert('Link login berhasil di-copy bos!')
}
</script>