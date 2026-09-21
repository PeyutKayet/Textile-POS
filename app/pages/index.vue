<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 md:py-6 space-y-6 pb-24 md:pb-8">
    
    <!-- Kartu Ringkasan (Summary) -->
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div class="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/5 transition">
        <div class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Transaksi</div>
        <div class="text-2xl font-bold text-gray-900">{{ summary.transactions }} <span class="text-sm font-medium text-gray-400 normal-case">Nota</span></div>
      </div>
      <div class="bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-500/5 transition">
        <div class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Roll Aktif</div>
        <div class="text-2xl font-bold text-gray-900">{{ summary.activeRolls }} <span class="text-sm font-medium text-gray-400 normal-case">Roll</span></div>
      </div>
      <div class="bg-white border border-gray-200 rounded-xl p-5 hover:border-purple-400 hover:shadow-md hover:shadow-purple-500/5 transition col-span-2 md:col-span-1">
        <div class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Total Stok Kain</div>
        <div class="text-2xl font-bold text-gray-900">{{ summary.totalStock }} <span class="text-sm font-medium text-gray-400 normal-case">Yard (Estimasi)</span></div>
      </div>
    </div>

    <!-- Jalan Pintas (Quick Actions) -->
    <div class="grid grid-cols-3 gap-3">
      <NuxtLink to="/pos" class="bg-blue-600 text-white p-3 rounded-xl shadow-sm shadow-blue-600/20 text-center hover:bg-blue-700 transition flex flex-col items-center justify-center gap-1">
        <span class="text-lg">🛒</span>
        <span class="text-xs font-bold">Kasir</span>
      </NuxtLink>
      <NuxtLink to="/barang-masuk" class="bg-emerald-600 text-white p-3 rounded-xl shadow-sm shadow-emerald-600/20 text-center hover:bg-emerald-700 transition flex flex-col items-center justify-center gap-1">
        <span class="text-lg">📦</span>
        <span class="text-xs font-bold">Barang Masuk</span>
      </NuxtLink>
      <NuxtLink to="/bahan" class="bg-white border border-gray-200 text-gray-700 p-3 rounded-xl text-center hover:border-blue-400 hover:text-blue-600 transition flex flex-col items-center justify-center gap-1">
        <span class="text-lg">📚</span>
        <span class="text-xs font-bold">Katalog Stok</span>
      </NuxtLink>
    </div>

    <!-- Tabel Bawah: Transaksi Terakhir & Peringatan Stok -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      
      <!-- 5 Transaksi Terakhir -->
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 class="font-bold text-gray-900 text-sm">5 Transaksi Terakhir</h2>
          <NuxtLink to="/riwayat" class="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition">Lihat Semua</NuxtLink>
        </div>
        <div class="p-3">
          <div v-for="trx in recentTransactions" :key="trx.id" class="flex justify-between items-center p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 rounded-lg transition">
            <div>
              <div class="font-bold text-sm text-gray-900">{{ trx.invoice_number }}</div>
              <div class="text-[11px] text-gray-400 mt-0.5">{{ formatTanggal(trx.created_at) }}</div>
            </div>
            <div class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
              {{ trx.transaction_items.length }} Item
            </div>
          </div>
          <div v-if="recentTransactions.length === 0" class="text-sm text-gray-400 text-center py-8">Belum ada transaksi</div>
        </div>
      </div>

      <!-- Peringatan Stok Tipis -->
      <div class="bg-white border border-red-200 rounded-xl overflow-hidden flex flex-col shadow-sm shadow-red-500/5">
        <div class="flex items-center justify-between px-5 py-4 border-b border-red-100 bg-red-50/50">
          <h2 class="font-bold text-red-700 text-sm flex items-center gap-2">
            <span class="text-lg">⚠️</span> Stok Tipis (< 10)
          </h2>
        </div>
        <div class="p-3">
          <div v-for="roll in lowStockRolls" :key="roll.sku_roll" class="flex justify-between items-center p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 rounded-lg transition">
            <div>
              <div class="font-bold text-sm text-gray-900">{{ roll.fabrics?.name || 'Kain' }}</div>
              <div class="text-[11px] text-gray-400 font-mono mt-0.5">SKU: {{ roll.sku_roll }}</div>
            </div>
            <div class="text-xs font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-md border border-red-200">
              Sisa {{ roll.current_length }}
            </div>
          </div>
          <div v-if="lowStockRolls.length === 0" class="text-sm text-gray-400 text-center py-8 flex flex-col items-center">
            <span class="text-2xl mb-1 opacity-50">👍</span>
            Stok aman semua bos!
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'

definePageMeta({ layout: 'dashboard' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// State buat nampung data dashboard
const summary = ref({ transactions: 0, activeRolls: 0, totalStock: 0 })
const recentTransactions = ref([])
const lowStockRolls = ref([])

const loadDashboardData = async () => {
  // 1. Ambil Total Transaksi
  const { count: txCount } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
  
  summary.value.transactions = txCount || 0

  // 2. Ambil Data Stok Total (Roll yang isinya > 0)
  const { data: rolls } = await supabase
    .from('fabric_rolls')
    .select('current_length, fabrics(base_unit)')
    .gt('current_length', 0)

  if (rolls) {
    summary.value.activeRolls = rolls.length
    
    // Hitung total dengan konversi ke Yard
    const totalInYard = rolls.reduce((sum, r) => {
      let length = Number(r.current_length)
      const unit = r.fabrics?.base_unit || 'Yard'
      
      // Kalau aslinya Meter, konversi ke Yard
      if (unit.toLowerCase() === 'meter') {
        length = length / 0.9144
      }
      
      return sum + length
    }, 0)

    summary.value.totalStock = Number(totalInYard.toFixed(2))
  }

  // 3. Ambil 5 Transaksi Terakhir
  const { data: recentTx } = await supabase
    .from('transactions')
    .select(`
      id, invoice_number, created_at,
      transaction_items ( id )
    `)
    .order('created_at', { ascending: false })
    .limit(5)
    
  if (recentTx) recentTransactions.value = recentTx

  // 4. Ambil 5 Roll dengan Stok Tipis (sisa kurang dari 10 meter)
  const { data: lowStock } = await supabase
    .from('fabric_rolls')
    .select('sku_roll, current_length, fabrics(name)')
    .gt('current_length', 0)
    .lt('current_length', 10)
    .order('current_length', { ascending: true })
    .limit(5)
    
  if (lowStock) lowStockRolls.value = lowStock
}

watchEffect(() => {
  if (user.value) {
    loadDashboardData()
  }
})

const formatTanggal = (isoString) => {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(isoString))
}
</script>