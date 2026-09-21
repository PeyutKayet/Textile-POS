<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6 pb-28 md:pb-12">
    
    <!-- Top Bar: Pencarian -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div class="relative w-full sm:w-96">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
          </svg>
        </div>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Cari nama kain..." 
          class="w-full bg-white border border-gray-100 rounded-2xl pl-11 pr-4 py-3.5 text-base focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition shadow-[0_4px_20px_rgb(0,0,0,0.03)] placeholder:text-gray-400 font-medium"
        >
      </div>
    </div>

    <!-- List Bahan (Cards di HP, Grid di Desktop) -->
    <div class="bg-transparent md:bg-white md:rounded-3xl md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:border md:border-gray-100 overflow-hidden flex flex-col">
      <!-- Header Desktop (Sembunyi di HP) -->
      <div class="hidden md:grid grid-cols-5 gap-4 px-6 py-5 bg-gray-50/70 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
        <div class="col-span-2">Nama Kain & SKU</div>
        <div>Stok Roll</div>
        <div>Total Ukuran</div>
        <div>Lokasi</div>
      </div>

      <!-- Looping Data -->
      <div class="flex flex-col gap-4 md:gap-0 md:divide-y md:divide-gray-100">
        <div v-for="item in filteredFabrics" :key="item.id" class="bg-white rounded-3xl md:rounded-none shadow-sm md:shadow-none border border-gray-100 md:border-0 p-5 md:px-6 md:py-5 flex flex-col md:grid md:grid-cols-5 md:items-center gap-4 hover:bg-blue-50/30 transition">
          
          <!-- Baris 1 HP / Kolom 1-2 Desktop: Nama Kain & SKU -->
          <div class="md:col-span-2 min-w-0">
            <div class="font-extrabold text-lg text-gray-900 truncate">{{ item.name }}</div>
            <div class="text-xs text-gray-400 font-mono mt-1">SKU: {{ item.sku || '-' }}</div>
          </div>

          <!-- Baris 2 HP / Kolom 3-5 Desktop: Detail Stok & Lokasi -->
          <div class="flex flex-wrap items-center gap-2 md:contents mt-1 md:mt-0">
            
            <!-- Stok Roll -->
            <div class="md:w-full">
              <span class="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100 shadow-sm">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                {{ item.totalRolls }} Roll
              </span>
            </div>
            
            <!-- Total Ukuran -->
            <div class="md:w-full">
              <span class="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100 shadow-sm">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                {{ item.totalStock }} {{ item.base_unit || 'm/yd' }}
              </span>
            </div>
            
            <!-- Lokasi -->
            <div class="md:w-full">
              <span class="inline-flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200 shadow-sm whitespace-nowrap">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
                {{ item.location || 'Belum set' }}
              </span>
            </div>

          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredFabrics.length === 0" class="p-16 text-center flex flex-col items-center justify-center bg-white rounded-3xl shadow-sm border border-gray-100 md:shadow-none md:border-0 md:rounded-none">
          <span class="text-5xl mb-4 opacity-30">🔍</span>
          <p class="text-base font-bold text-gray-700">Kain tidak ditemukan</p>
          <p class="text-sm text-gray-400 mt-1">Coba gunakan kata kunci lain</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect, computed, watch } from 'vue'

// Nempel ke layout dashboard
definePageMeta({
  layout: 'dashboard'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const fabrics = ref([])
const tenantId = ref(null)
const searchQuery = ref('')
const searchTimeout = ref(null)

// Filter pencarian (langsung mem-bypass data dari Supabase)
const filteredFabrics = computed(() => fabrics.value)

watch(searchQuery, (newVal) => {
  const q = newVal.trim()
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
  
  searchTimeout.value = setTimeout(async () => {
    let query = supabase.from('v_fabric_stocks').select('*').limit(20)
    
    if (q) {
      query = query.ilike('name', `%${q}%`)
    }
    
    const { data, error } = await query
    
    if (data) {
      fabrics.value = data.map(fabric => ({
        ...fabric,
        totalRolls: fabric.total_rolls,
        totalStock: fabric.total_stock
      }))
    } else if (error) {
      console.error('Gagal cari data stok:', error.message)
    }
  }, 300)
})

// Tarik tenant_id user yang lagi login
watchEffect(async () => {
  const userId = user.value?.id || user.value?.sub
  if (userId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', userId)
      .maybeSingle()

    if (profile) {
      tenantId.value = profile.tenant_id
      loadFabrics()
    }
  }
})

// Fungsi tarik data kain menggunakan Database View
const loadFabrics = async () => {
  const { data, error } = await supabase
    .from('v_fabric_stocks')
    .select('*')
    .limit(20)
  
  if (data) {
    fabrics.value = data.map(fabric => ({
      ...fabric,
      totalRolls: fabric.total_rolls,
      totalStock: fabric.total_stock
    }))
  } else if (error) {
    console.error('Gagal tarik data stok awal:', error.message)
  }
}
</script>