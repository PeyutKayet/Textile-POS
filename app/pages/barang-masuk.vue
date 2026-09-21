<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4 pb-24 md:pb-8">
    
    <div class="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200">
      
      <!-- Bagian 1: Pilih / Tambah Bahan Induk -->
      <div class="mb-5">
        <div class="flex items-center justify-between mb-2 md:w-1/2">
          <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Pilih Bahan Utama</label>
          <button 
            @click="isAddingNewFabric = !isAddingNewFabric" 
            class="text-[11px] text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md font-bold transition"
          >
            {{ isAddingNewFabric ? 'Batal Tambah' : '+ Bahan Baru' }}
          </button>
        </div>

        <!-- Mode Pilih Bahan Eksisting (Search) -->
        <div v-if="!isAddingNewFabric" class="relative md:w-1/2">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
            </svg>
          </div>
          <input 
            v-model="searchQuery" 
            @focus="showDropdown = true"
            @blur="tutupDropdown"
            type="text" 
            placeholder="Cari atau ketik nama bahan..." 
            class="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition shadow-sm placeholder:text-gray-400"
          >
          
          <!-- Dropdown List Search -->
          <ul v-if="showDropdown && filteredFabrics.length > 0" class="absolute z-10 w-full bg-white border border-gray-200 mt-1.5 rounded-lg shadow-lg shadow-gray-900/10 max-h-48 overflow-y-auto divide-y divide-gray-50">
            <li 
              v-for="fabric in filteredFabrics" 
              :key="fabric.id" 
              @click="pilihBahan(fabric)"
              class="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm font-semibold text-gray-700 hover:text-blue-700 transition"
            >
              {{ fabric.name }}
            </li>
          </ul>
          <div v-if="showDropdown && filteredFabrics.length === 0" class="absolute z-10 w-full bg-white border border-gray-200 mt-1.5 rounded-lg shadow-lg shadow-gray-900/10 p-3 text-center text-xs text-gray-500">
            🔍 Kain tidak ditemukan.
          </div>
        </div>

        <!-- Mode Tambah Bahan Baru Cepat (Sangat Compact) -->
        <div v-else class="bg-gray-50/70 p-3.5 rounded-xl border border-gray-200 md:w-3/4 space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Nama Kain</label>
              <input v-model="newFabricForm.name" type="text" placeholder="ex: Katun Toyobo" class="w-full bg-white border border-gray-200 py-1.5 px-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-sm font-medium transition" required>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Warna</label>
              <input v-model="newFabricForm.color" type="text" placeholder="ex: Merah Maroon" class="w-full bg-white border border-gray-200 py-1.5 px-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-sm font-medium transition" required>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="md:col-span-2">
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Lokasi Rak (Opsional)</label>
              <input v-model="newFabricForm.location" type="text" placeholder="ex: Rak A1" class="w-full bg-white border border-gray-200 py-1.5 px-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-sm font-medium transition">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Satuan Dasar</label>
              <select v-model="newFabricForm.base_unit" class="w-full bg-white border border-gray-200 py-1.5 px-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-sm font-bold text-gray-700 cursor-pointer transition">
                <option value="Meter">Meter</option>
                <option value="Yard">Yard</option>
              </select>
            </div>
          </div>
          
          <div class="pt-1">
            <button @click="simpanBahanBaru" class="w-full md:w-auto bg-gray-900 text-white font-bold px-5 py-2 rounded-md hover:bg-gray-800 transition text-xs shadow-sm">
              Simpan & Pilih Bahan
            </button>
          </div>
        </div>
      </div>

      <hr class="border-gray-100 mb-5">

      <!-- Bagian 2: Input HPP (Compact & Jelas) -->
      <div class="mb-5 flex flex-col md:flex-row md:items-center gap-3 bg-white border border-gray-200 p-3 rounded-xl shadow-sm">
        <div class="shrink-0">
          <label class="block text-xs font-bold text-gray-800">Modal (HPP) per Meter/Yard</label>
          <p class="text-[10px] text-gray-400 mt-0.5">Berlaku untuk semua roll di bawah</p>
        </div>
        <div class="relative flex-1 max-w-xs">
          <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">Rp</span>
          <input 
            v-model="batchHppDisplay" 
            type="text" 
            placeholder="0" 
            class="w-full bg-gray-50 border border-gray-200 py-1.5 pl-8 pr-2.5 rounded-md focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-sm font-bold text-gray-900 transition"
          >
        </div>
      </div>

      <!-- Bagian 3: List Roll Dinamis (Compact) -->
      <div class="mb-3 px-1">
        <h2 class="text-xs font-bold uppercase tracking-wider text-gray-500">Daftar Roll Masuk</h2>
      </div>

      <div class="space-y-2">
        <!-- Loop Baris Roll -->
        <div 
          v-for="(roll, index) in rollList" 
          :key="index" 
          class="relative flex flex-col sm:flex-row sm:items-center gap-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition"
        >
          <!-- Tombol Hapus X -->
          <button 
            v-if="rollList.length > 1" 
            @click="hapusBaris(index)" 
            class="absolute top-1 right-1 text-gray-300 hover:text-red-500 hover:bg-red-50 w-6 h-6 rounded-full flex items-center justify-center transition text-lg leading-none z-10" 
            title="Hapus baris"
          >
            &times;
          </button>

          <div class="flex items-center gap-2.5 w-full pt-1 sm:pt-0">
            <!-- Nomor urut -->
            <div class="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-400 text-[9px] shrink-0">
              {{ index + 1 }}
            </div>
            
            <!-- Input Panjang & Lokasi -->
            <div class="flex-1 grid grid-cols-2 gap-2.5 pr-4 sm:pr-6">
              <div class="relative">
                <input 
                  v-model="roll.initial_length" 
                  ref="qtyInputs"
                  @keyup.enter="simpanBarangMasuk"
                  type="number" 
                  placeholder="Panjang" 
                  class="w-full bg-white border border-gray-200 py-1.5 px-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-sm font-medium" 
                  required
                >
                <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-400">QTY</span>
              </div>
              <div class="relative">
                <input 
                  v-model="roll.location" 
                  @keyup.enter="simpanBarangMasuk"
                  type="text" 
                  placeholder="Lokasi Rak" 
                  class="w-full bg-white border border-gray-200 py-1.5 px-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-sm font-medium"
                >
                <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-400 hidden sm:block">RAK</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Tombol Tambah Baris Cepat -->
      <button 
        @click="tambahBaris" 
        class="w-full mt-2 bg-emerald-50/50 text-emerald-600 border border-emerald-200 border-dashed py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-50 hover:border-emerald-300 transition flex items-center justify-center gap-1.5"
      >
        <span class="text-base leading-none">+</span> Tambah Baris Roll Lagi
      </button>

      <!-- Tombol Eksekusi -->
      <div class="mt-6 pt-4 border-t border-gray-100">
        <button 
          @click="simpanBarangMasuk" 
          class="w-full md:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-bold transition text-sm shadow-sm shadow-blue-600/20"
        >
          Simpan Semua Roll ke Gudang
        </button>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect, computed, nextTick } from 'vue'

definePageMeta({
  layout: 'dashboard'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const fabrics = ref([])
const tenantId = ref(null)
const selectedFabric = ref('')

// State untuk fitur Search Bahan
const searchQuery = ref('')
const showDropdown = ref(false)

// Fungsi untuk menutup dropdown dengan delay biar klik di list gak ke-cancel
const tutupDropdown = () => {
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

const filteredFabrics = computed(() => {
  if (!searchQuery.value) return fabrics.value
  return fabrics.value.filter(f => f.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const pilihBahan = (fabric) => {
  selectedFabric.value = fabric.id
  searchQuery.value = fabric.name
  showDropdown.value = false
}

// State untuk fitur Tambah Bahan Baru All-in-One
const isAddingNewFabric = ref(false)
const newFabricForm = ref({ name: '', color: '', location: '', base_unit: 'Yard' })

// State untuk HPP Batch & form dinamis roll masuk
const batchHpp = ref('')
const batchHppDisplay = computed({
  get: () => batchHpp.value ? batchHpp.value.toLocaleString('id-ID') : '',
  set: (val) => {
    // Hapus semua karakter selain angka biar aman
    const raw = String(val).replace(/\D/g, '')
    batchHpp.value = raw ? Number(raw) : ''
  }
})
const rollList = ref([
  { initial_length: '', location: '' }
])

// Ambil tenant_id lalu muat daftar master bahan
watchEffect(async () => {
  const userId = user.value?.id || user.value?.sub
  if (userId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', userId)
      .single()

    if (profile) {
      tenantId.value = profile.tenant_id
      loadFabrics()
    }
  }
})

// Fungsi muat master bahan dari database
const loadFabrics = async () => {
  const { data } = await supabase
    .from('fabrics')
    .select('id, name, sku')
  
  if (data) fabrics.value = data
}

// Fungsi simpan bahan baru langsung dari form Inbound
const simpanBahanBaru = async () => {
  if (!newFabricForm.value.name || !newFabricForm.value.color) {
    alert('Nama kain dan Warna wajib diisi bos!')
    return
  }

  const combinedName = `${newFabricForm.value.name} - ${newFabricForm.value.color}`
  const autoSku = `SKU-${Date.now()}`

  const { data, error } = await supabase
    .from('fabrics')
    .insert([{
      tenant_id: tenantId.value,
      name: combinedName,
      sku: autoSku,
      location: newFabricForm.value.location,
      base_unit: newFabricForm.value.base_unit // Kirim satuan pilihan ke Supabase
    }])
    .select()

  if (error) {
    alert('Gagal simpan master bahan: ' + error.message)
  } else if (data && data.length > 0) {
    const newFabric = data[0]
    fabrics.value.unshift(newFabric) 
    selectedFabric.value = newFabric.id 
    searchQuery.value = newFabric.name 
    isAddingNewFabric.value = false
    // Reset form dan balikin satuan default ke Yard
    newFabricForm.value = { name: '', color: '', location: '', base_unit: 'Yard' }
  }
}

// Refs untuk nangkep element input QTY biar bisa auto-focus
const qtyInputs = ref([])

// Fungsi tambah & hapus baris UI roll
const tambahBaris = async () => {
  rollList.value.push({ initial_length: '', location: '' })
  
  // Tunggu UI selesai gambar baris baru, lalu auto-focus ke inputnya
  await nextTick()
  const lastInput = qtyInputs.value[qtyInputs.value.length - 1]
  if (lastInput) lastInput.focus()
}
const hapusBaris = (index) => {
  rollList.value.splice(index, 1)
}

// Fungsi tembak ke database (Bulk Insert Roll)
const simpanBarangMasuk = async () => {
  if (!selectedFabric.value) {
    alert('Pilih bahan utamanya dulu bos!')
    return
  }

  const adaYangKosong = rollList.value.some(r => !r.initial_length)
  if (adaYangKosong) {
    alert('Panjang (Meter/Yard) di setiap baris wajib diisi!')
    return
  }

  let finalHpp = batchHpp.value || 0
  if (finalHpp <= 0) {
    const yakin = confirm('Eh, HPP (Harga Modal) belum diisi nih. Yakin mau simpan tanpa HPP? Nanti sistem nggak bisa ngitung profit pas barang ini laku lho. Lanjut aja?')
    if (!yakin) return // Kalau batal (Cancel), proses berhenti di sini
  }

  const payload = rollList.value.map((roll, index) => {
    const autoSkuRoll = `ROL-${Date.now()}-${index}`
    
    return {
      tenant_id: tenantId.value,
      fabric_id: selectedFabric.value,
      sku_roll: autoSkuRoll,
      initial_length: roll.initial_length,
      current_length: roll.initial_length,
      location: roll.location,
      hpp: finalHpp // Ambil dari inputan atau 0 jika kosong
    }
  })

  const { error } = await supabase
    .from('fabric_rolls')
    .insert(payload)

  if (error) {
    alert('Gagal simpan: ' + error.message)
  } else {
    alert(`Mantap! Berhasil masukin ${payload.length} roll ke gudang.`)
    selectedFabric.value = ''
    searchQuery.value = ''
    batchHpp.value = '' // Reset HPP
    rollList.value = [{ initial_length: '', location: '' }]
  }
}
</script>