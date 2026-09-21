<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 md:py-6 space-y-5 pb-24 md:pb-8">
    
    <!-- List Transaksi (Proportional Layout) -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <!-- Header Desktop -->
      <div class="hidden md:grid grid-cols-4 gap-4 px-5 py-4 bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
        <div class="col-span-1">Transaksi</div>
        <div class="col-span-2">Rincian Item (Menyamping)</div>
        <div class="col-span-1 text-right">Total Keseluruhan</div>
      </div>

      <!-- Loop Data -->
      <div class="divide-y divide-gray-100">
        <div v-for="trx in riwayat" :key="trx.id" class="p-4 md:px-5 md:py-4 flex flex-col md:grid md:grid-cols-4 md:items-center gap-3 md:gap-4 hover:bg-gray-50/80 transition">
          
          <!-- Kolom 1: Nota & Waktu (Tumpuk biar hemat spasi) -->
          <div class="flex justify-between items-start md:block">
            <div>
              <div class="inline-flex items-center justify-center bg-blue-50/50 text-blue-700 px-2.5 py-1 rounded-md text-sm font-bold border border-blue-100 mb-1">
                {{ trx.invoice_number }}
              </div>
              <div class="text-xs text-gray-500 font-medium">{{ formatTanggal(trx.created_at) }}</div>
            </div>
            
            <!-- Di HP: Total QTY pindah ke kanan atas biar ringkas -->
            <div class="md:hidden">
              <span class="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-100">
                {{ hitungTotalQty(trx.transaction_items) }} Qty
              </span>
            </div>
          </div>

          <!-- Kolom 2 & 3: Detail Item (Chip Model - Nyamping - Lebih Tebal & Proper) -->
          <div class="md:col-span-2 border-t border-gray-100 pt-3 md:border-0 md:pt-0 w-full min-w-0">
            <div class="flex flex-wrap gap-2">
              <div 
                v-for="item in trx.transaction_items" 
                :key="item.id" 
                class="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs shadow-sm hover:border-blue-300 transition"
              >
                <span class="font-bold text-gray-800">{{ item.fabric_rolls?.fabrics?.name || 'Kain' }}</span>
                <span class="text-[11px] text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">{{ formatSku(item.fabric_rolls?.sku_roll) }}</span>
                <span class="font-bold text-emerald-700 text-sm">{{ formatQty(item.length_deducted) }}</span>
              </div>
            </div>
          </div>

          <!-- Kolom 4: Total QTY (Khusus Desktop) -->
          <div class="hidden md:block text-right">
            <span class="inline-flex items-center justify-center bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold border border-emerald-200">
              {{ hitungTotalQty(trx.transaction_items) }} Total Qty
            </span>
          </div>

        </div>

        <!-- Empty State -->
        <div v-if="riwayat.length === 0" class="p-12 text-center flex flex-col items-center justify-center">
          <span class="text-3xl mb-3 opacity-40">🧾</span>
          <p class="text-sm font-semibold text-gray-700">Belum ada transaksi</p>
          <p class="text-xs text-gray-400 mt-1">Data riwayat kasir akan muncul di sini.</p>
        </div>
      </div>
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
const riwayat = ref([])

// Tarik data transaksi + relasi detail itemnya
watchEffect(async () => {
  const userId = user.value?.id || user.value?.sub
  
  if (userId) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id, 
        invoice_number, 
        created_at, 
        transaction_items (
          id,
          length_deducted,
          fabric_rolls (
            sku_roll,
            fabrics ( name )
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (data) {
      riwayat.value = data
    } else if (error) {
      console.error('Gagal ambil riwayat:', error.message)
    }
  }
})

// Fungsi rapiin format tanggal & jam
const formatTanggal = (isoString) => {
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('id-ID', { 
    dateStyle: 'medium', 
    timeStyle: 'short' 
  }).format(date)
}

// Format QTY: Maksimal 1 angka di belakang koma (hapus .0 kalau bulat)
const formatQty = (num) => {
  if (!num) return '0'
  return Number(num).toFixed(1).replace(/\.0$/, '')
}

// Format SKU: Ambil 8 karakter terakhir aja biar nggak menuhin layar
const formatSku = (sku) => {
  if (!sku) return '-'
  return sku.length > 10 ? '...' + sku.slice(-8) : sku
}

// Hitung total QTY dalam 1 transaksi
const hitungTotalQty = (items) => {
  if (!items || items.length === 0) return '0'
  const total = items.reduce((sum, item) => sum + Number(item.length_deducted || 0), 0)
  return formatQty(total)
}
</script>