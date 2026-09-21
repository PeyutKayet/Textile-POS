<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 md:py-6 space-y-5 pb-24 md:pb-8">
    
    <!-- Top Bar: Pencarian -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div class="relative w-full sm:w-80">
        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
          </svg>
        </div>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Cari nama kain..." 
          class="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition shadow-sm placeholder:text-gray-400"
        >
      </div>
    </div>

    <!-- List Bahan (Mode Card di HP, Mode Grid di Desktop) -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <!-- Header Desktop (Sembunyi di HP) -->
      <div class="hidden md:grid grid-cols-5 gap-4 px-5 py-4 bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
        <div class="col-span-2">Nama Kain & SKU</div>
        <div>Stok Roll</div>
        <div>Total Ukuran</div>
        <div>Lokasi</div>
      </div>

      <!-- Looping Data -->
      <div class="divide-y divide-gray-100">
        <div v-for="item in filteredFabrics" :key="item.id" class="p-4 md:px-5 md:py-4 flex flex-col md:grid md:grid-cols-5 md:items-center gap-3 hover:bg-gray-50/50 transition">
          
          <!-- Baris 1 HP / Kolom 1-2 Desktop: Nama Kain & SKU -->
          <div class="md:col-span-2 min-w-0">
            <div class="font-bold text-sm text-gray-900 truncate">{{ item.name }}</div>
            <div class="text-[11px] text-gray-400 font-mono mt-0.5">SKU: {{ item.sku || '-' }}</div>
          </div>

          <!-- Baris 2 HP / Kolom 3-5 Desktop: Detail Stok & Lokasi -->
          <div class="flex justify-between items-center md:contents mt-1 md:mt-0">
            
            <!-- Stok Roll -->
            <div>
              <span class="inline-flex items-center justify-center bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-blue-100">
                {{ item.totalRolls }} Roll
              </span>
            </div>
            
            <!-- Total Ukuran -->
            <div class="flex items-center gap-1.5">
              <span class="md:hidden text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total</span>
              <div class="text-sm font-bold text-emerald-600">
                {{ item.totalStock }} <span class="text-[10px] font-semibold text-emerald-600/70 uppercase">{{ item.base_unit || 'm/yd' }}</span>
              </div>
            </div>
            
            <!-- Lokasi -->
            <div>
              <span class="inline-flex items-center justify-center bg-gray-50 text-gray-600 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-gray-200 whitespace-nowrap">
                {{ item.location || 'Belum set' }}
              </span>
            </div>

          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredFabrics.length === 0" class="p-12 text-center flex flex-col items-center justify-center">
          <span class="text-3xl mb-3 opacity-40">🔍</span>
          <p class="text-sm font-semibold text-gray-700">Kain tidak ditemukan</p>
          <p class="text-xs text-gray-400 mt-1">Coba gunakan kata kunci lain</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect, computed } from 'vue'

// Nempel ke layout dashboard
definePageMeta({
  layout: 'dashboard'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const fabrics = ref([])
const tenantId = ref(null)
const searchQuery = ref('')

// Filter pencarian
const filteredFabrics = computed(() => {
  if (!searchQuery.value) return fabrics.value
  return fabrics.value.filter(f => f.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

// Tarik tenant_id user yang lagi login
watchEffect(async () => {
  const userId = user.value?.id || user.value?.sub
  if (userId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', userId)
      .maybeSingle() // Ganti ke maybeSingle biar aplikasi gak macet/error 406

    if (profile) {
      tenantId.value = profile.tenant_id
      loadFabrics()
    }
  }
})

// Fungsi tarik data kain + relasi ke fabric_rolls buat hitung total stok
const loadFabrics = async () => {
  const { data, error } = await supabase
    .from('fabrics')
    .select('*, fabric_rolls(id, current_length)')
    .order('created_at', { ascending: false })
  
  if (data) {
    // Hitung manual total roll dan total stok per bahan
    fabrics.value = data.map(fabric => {
      const rolls = fabric.fabric_rolls || []
      const totalRolls = rolls.length
      const totalStock = Number(rolls.reduce((sum, r) => sum + Number(r.current_length), 0).toFixed(2))
      
      return {
        ...fabric,
        totalRolls,
        totalStock
      }
    })
  } else if (error) {
    console.error('Gagal tarik data stok:', error.message)
  }
}
</script>