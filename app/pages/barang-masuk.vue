<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-28 md:pb-12">
    
    <!-- Bagian 1: Pilih / Tambah Bahan Induk -->
    <div class="bg-white p-5 md:p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span>
          Pilih Bahan Utama
        </h2>
        <button 
          @click="isAddingNewFabric = !isAddingNewFabric" 
          class="text-xs text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 px-4 py-2 rounded-xl font-bold transition shadow-sm"
        >
          {{ isAddingNewFabric ? 'Batal Tambah' : '+ Bahan Baru' }}
        </button>
      </div>

      <!-- Mode Pilih Bahan Eksisting (Search) -->
      <div v-if="!isAddingNewFabric" class="relative">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
          </svg>
        </div>
        <input 
          v-model="searchQuery" 
          @focus="showDropdown = true"
          @blur="tutupDropdown"
          type="text" 
          placeholder="Cari atau ketik nama bahan..." 
          class="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 text-base focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition shadow-inner placeholder:text-gray-400 font-medium"
        >
        
        <!-- Dropdown List Search -->
        <ul v-if="showDropdown && filteredFabrics.length > 0" class="absolute z-10 w-full bg-white border border-gray-100 mt-2 rounded-2xl shadow-xl max-h-56 overflow-y-auto divide-y divide-gray-50">
          <li 
            v-for="fabric in filteredFabrics" 
            :key="fabric.id" 
            @click="pilihBahan(fabric)"
            class="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm font-semibold text-gray-700 hover:text-blue-700 transition"
          >
            {{ fabric.name }}
          </li>
        </ul>
        <div v-if="showDropdown && filteredFabrics.length === 0" class="absolute z-10 w-full bg-white border border-gray-100 mt-2 rounded-2xl shadow-xl p-4 text-center text-sm text-gray-500 font-medium">
          🔍 Kain tidak ditemukan.
        </div>
      </div>

      <!-- Mode Tambah Bahan Baru Cepat -->
      <div v-else class="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Nama Kain</label>
            <input v-model="newFabricForm.name" type="text" placeholder="ex: Katun Toyobo" class="w-full bg-white border border-gray-200 py-3 px-4 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 text-sm font-bold transition shadow-sm" required>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Warna</label>
            <input v-model="newFabricForm.color" type="text" placeholder="ex: Merah Maroon" class="w-full bg-white border border-gray-200 py-3 px-4 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 text-sm font-bold transition shadow-sm" required>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="md:col-span-2">
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Lokasi Rak (Opsional)</label>
            <input v-model="newFabricForm.location" type="text" placeholder="ex: Rak A1" class="w-full bg-white border border-gray-200 py-3 px-4 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 text-sm font-bold transition shadow-sm">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Satuan Dasar</label>
            <select v-model="newFabricForm.base_unit" class="w-full bg-white border border-gray-200 py-3 px-4 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 text-sm font-bold text-gray-700 cursor-pointer transition shadow-sm">
              <option value="Meter">Meter</option>
              <option value="Yard">Yard</option>
            </select>
          </div>
        </div>
        
        <div class="pt-2">
          <button @click="simpanBahanBaru" class="w-full md:w-auto bg-gray-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-gray-800 transition text-sm shadow-md">
            Simpan & Pilih Bahan
          </button>
        </div>
      </div>
    </div>

    <!-- Bagian 2: Input HPP -->
    <div class="bg-white p-5 md:p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="shrink-0 flex items-center gap-3">
        <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</span>
        <div>
          <label class="block text-sm font-bold text-gray-800 uppercase tracking-wide">Modal (HPP) per Satuan</label>
          <p class="text-[11px] text-gray-400 mt-0.5 font-medium">Akan diterapkan ke semua roll di bawah</p>
        </div>
      </div>
      <div class="relative flex-1 max-w-sm w-full">
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">Rp</span>
        <input 
          v-model="batchHppDisplay" 
          type="text" 
          placeholder="0" 
          class="w-full bg-gray-50 border border-gray-200 py-3 pl-10 pr-4 rounded-2xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 text-lg font-bold text-gray-900 transition shadow-inner"
        >
      </div>
    </div>

    <!-- Bagian 3: List Roll Dinamis -->
    <div class="bg-white p-5 md:p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
      <div class="flex items-center gap-3 mb-5">
        <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">3</span>
        <h2 class="text-sm font-bold uppercase tracking-wide text-gray-800">Daftar Roll Masuk</h2>
      </div>

      <div class="space-y-4">
        <!-- Loop Baris Roll -->
        <div 
          v-for="(roll, index) in rollList" 
          :key="index" 
          class="group relative flex flex-col sm:flex-row gap-4 bg-gray-50/70 p-4 sm:p-5 rounded-2xl border border-gray-100 hover:border-blue-100 transition shadow-sm"
        >
          <!-- Nomor urut -->
          <div class="hidden sm:flex w-8 h-8 rounded-full bg-white border border-gray-200 items-center justify-center font-bold text-gray-400 text-xs shrink-0 shadow-sm">
            {{ index + 1 }}
          </div>
          
          <!-- Input Panjang & Lokasi -->
          <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block sm:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">Panjang Roll {{ index + 1 }}</label>
              <div class="relative">
                <input 
                  v-model="roll.initial_length" 
                  ref="qtyInputs"
                  @keyup.enter="simpanBarangMasuk"
                  type="number" 
                  placeholder="Panjang (Qty)" 
                  class="w-full bg-white border border-gray-200 py-3 px-4 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 text-base font-bold text-gray-900 shadow-sm transition" 
                  required
                >
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">QTY</span>
              </div>
            </div>
            <div>
              <label class="block sm:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">Lokasi Rak</label>
              <div class="relative">
                <input 
                  v-model="roll.location" 
                  @keyup.enter="simpanBarangMasuk"
                  type="text" 
                  placeholder="Lokasi Rak" 
                  class="w-full bg-white border border-gray-200 py-3 px-4 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 text-base font-bold text-gray-900 shadow-sm transition"
                >
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase hidden sm:block">RAK</span>
              </div>
            </div>
          </div>

          <!-- Tombol Hapus Baris -->
          <button 
            v-if="rollList.length > 1" 
            @click="hapusBaris(index)" 
            class="sm:shrink-0 w-full sm:w-auto bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 px-4 py-3 rounded-xl flex items-center justify-center transition font-bold text-sm gap-2" 
            title="Hapus baris"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            <span class="sm:hidden">Hapus Roll Ini</span>
          </button>
        </div>
      </div>
      
      <!-- Tombol Tambah Baris Cepat -->
      <button 
        @click="tambahBaris" 
        class="w-full mt-4 bg-emerald-50/80 text-emerald-600 border-2 border-emerald-200 border-dashed py-4 rounded-2xl text-sm font-bold hover:bg-emerald-100 hover:border-emerald-300 transition flex items-center justify-center gap-2"
      >
        <span class="text-xl leading-none">+</span> Tambah Baris Roll Lagi
      </button>
    </div>
    
    <!-- Tombol Eksekusi -->
    <div class="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-gray-100 p-4 z-40 md:static md:bg-transparent md:border-0 md:p-0">
      <div class="max-w-4xl mx-auto flex justify-end">
        <button 
          @click="simpanBarangMasuk" 
          class="w-full md:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl hover:bg-blue-700 font-bold transition text-base shadow-[0_8px_30px_rgba(37,99,235,0.3)]"
        >
          Simpan Semua Roll ke Gudang
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, watchEffect, computed, nextTick, watch } from 'vue'

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
const searchTimeout = ref(null)
const showDropdown = ref(false)

// Fungsi untuk menutup dropdown dengan delay biar klik di list gak ke-cancel
const tutupDropdown = () => {
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

const filteredFabrics = computed(() => fabrics.value)

watch(searchQuery, (newVal) => {
  const q = newVal.trim()
  if (!q) {
    fabrics.value = []
    return
  }
  
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(async () => {
    const { data } = await supabase
      .from('fabrics')
      .select('id, name, sku')
      .ilike('name', `%${q}%`)
      .limit(20)
    
    if (data) fabrics.value = data
  }, 300)
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

// Ambil tenant_id
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
    }
  }
})

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