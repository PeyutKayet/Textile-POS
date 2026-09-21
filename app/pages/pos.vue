<template>
  <!-- Catatan: judul halaman sudah ditampilkan di header layout, jadi di sini langsung konten -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 md:py-6 pb-24 md:pb-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

      <!-- ============ KIRI (span 2): PENCARIAN & ROLL ============ -->
      <div class="lg:col-span-2 space-y-5 min-w-0">

        <!-- Search Bar (auto-focus, shortcut "/") -->
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
            </svg>
          </div>
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="Cari kain… (ketik nama, atau tekan /)"
            class="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-10 py-3 text-sm md:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition placeholder:text-gray-400"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Hasil pencarian kain -->
        <section v-if="searchQuery">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-xs font-bold uppercase tracking-wider text-gray-400">Hasil Pencarian</h2>
            <span class="text-xs text-gray-400">{{ filteredFabrics.length }} kain</span>
          </div>
          <div v-if="filteredFabrics.length" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              v-for="fabric in filteredFabrics"
              :key="fabric.id"
              @click="pilihKain(fabric)"
              class="group text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/5 transition"
            >
              <div class="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition">{{ fabric.name }}</div>
              <div class="text-xs text-gray-400 mt-1">Satuan dasar: {{ fabric.base_unit }}</div>
            </button>
          </div>
          <div v-else class="bg-white border border-dashed border-gray-200 rounded-xl p-10 text-center">
            <p class="text-sm text-gray-400">Nggak ada kain yang cocok dengan "{{ searchQuery }}"</p>
          </div>
        </section>

        <!-- Kain cepat: terakhir dipilih (muncul pas search kosong & belum pilih kain) -->
        <section v-if="!searchQuery && !selectedFabric && recentFabrics.length">
          <h2 class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Terakhir Dipilih</h2>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="f in recentFabrics"
              :key="f.id"
              @click="pilihKain(f)"
              class="bg-white border border-gray-200 rounded-full px-4 py-2 text-xs font-semibold text-gray-600 hover:border-blue-400 hover:text-blue-600 transition"
            >
              {{ f.name }}
            </button>
          </div>
        </section>

        <!-- Panel roll kain terpilih -->
        <section v-if="selectedFabric" class="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div class="flex items-center justify-between px-4 md:px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <div class="min-w-0">
              <h2 class="font-bold text-gray-900 text-sm md:text-base truncate">{{ selectedFabric.name }}</h2>
              <p class="text-xs text-gray-400 mt-0.5">{{ rolls.length }} roll tersedia · Satuan: {{ selectedFabric.base_unit }}</p>
            </div>
            <button
              @click="resetPilihan"
              class="shrink-0 text-xs font-semibold text-gray-400 hover:text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2 transition"
            >
              ← Ganti Kain
            </button>
          </div>

          <div class="p-3 md:p-4 space-y-2.5">
            <div v-if="loadingRolls" class="py-10 text-center text-sm text-gray-400">Ambil data roll…</div>

            <div v-else-if="rolls.length === 0" class="py-10 text-center">
              <p class="text-sm font-medium text-gray-500">Stok kosong</p>
              <p class="text-xs text-gray-400 mt-1">Semua roll kain ini sudah habis.</p>
            </div>

            <div
              v-for="roll in rolls"
              :key="roll.id"
              class="border rounded-xl p-3.5 md:p-4 transition"
              :class="inCart(roll.id) ? 'bg-blue-50/40 border-blue-200' : 'bg-white border-gray-200 hover:border-gray-300'"
            >
              <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-mono font-bold text-sm text-gray-900">{{ roll.sku_roll }}</span>
                    <span v-if="inCart(roll.id)" class="text-[10px] font-bold text-blue-600 bg-blue-100 rounded-full px-2 py-0.5">DI KERANJANG</span>
                    <span v-if="roll.location" class="text-[10px] font-semibold text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">Rak {{ roll.location }}</span>
                  </div>
                  <p class="text-xs text-gray-400 mt-1">
                    Sisa <span class="font-bold text-emerald-600">{{ fmtNum(roll.current_length) }} {{ selectedFabric.base_unit }}</span>
                  </p>
                </div>

                <!-- Mode eceran: input meter langsung di kartu roll -->
                <div v-if="eceranRollId === roll.id" class="flex items-center gap-2 w-full sm:w-auto">
                  <div class="relative flex-1 sm:w-28">
                    <input
                      v-model.number="eceranQty"
                      type="number" min="0" step="0.1" :max="roll.current_length"
                      @keyup.enter="tambahEceran(roll)"
                      class="w-full border border-blue-300 rounded-lg p-2 pl-3 pr-12 text-sm font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                      placeholder="0"
                    />
                    <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">{{ selectedFabric.base_unit }}</span>
                  </div>
                  <button
                    @click="tambahEceran(roll)"
                    :disabled="!eceranQty || eceranQty <= 0"
                    class="bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Tambah
                  </button>
                  <button @click="eceranRollId = null" class="text-gray-400 hover:text-gray-600 text-lg leading-none px-1">&times;</button>
                </div>

                <div v-else class="flex gap-2 w-full sm:w-auto">
                  <button
                    @click="tambahKeKeranjang(roll, 'utuh')"
                    :disabled="inCart(roll.id)"
                    class="flex-1 sm:flex-none bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Jual Utuh
                  </button>
                  <button
                    @click="bukaEceran(roll)"
                    :disabled="inCart(roll.id)"
                    class="flex-1 sm:flex-none bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-xs font-bold hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Jual Eceran
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Empty state awal -->
        <section v-if="!searchQuery && !selectedFabric && !recentFabrics.length" class="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center">
          <div class="w-12 h-12 mx-auto rounded-xl bg-blue-50 flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
            </svg>
          </div>
          <p class="text-sm font-semibold text-gray-700">Mulai dari pencarian</p>
          <p class="text-xs text-gray-400 mt-1">Ketik nama kain di atas, atau tekan <kbd class="bg-gray-100 border border-gray-200 rounded px-1 font-sans">/</kbd></p>
        </section>
      </div>

      <!-- ============ KANAN: KERANJANG (desktop) ============ -->
      <aside class="hidden lg:block lg:sticky lg:top-4">
        <div class="bg-white border border-gray-200 rounded-xl flex flex-col max-h-[calc(100vh-5rem)] overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 class="font-bold text-gray-900 text-sm">Keranjang</h2>
            <span class="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-[11px] font-bold">{{ cart.length }} item</span>
          </div>

          <div class="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            <div v-if="cart.length === 0" class="py-12 text-center">
              <p class="text-3xl mb-2 opacity-40">🛒</p>
              <p class="text-xs text-gray-400">Keranjang masih kosong</p>
            </div>

            <div v-for="(item, index) in cart" :key="item.rollId" class="border border-gray-100 rounded-xl p-3.5 bg-gray-50/50">
              <div class="flex items-start justify-between gap-2 mb-1">
                <div class="min-w-0">
                  <p class="font-semibold text-sm text-gray-900 truncate">{{ item.fabricName }}</p>
                  <p class="text-[11px] text-gray-400 font-mono mt-0.5">{{ item.rollSku }}</p>
                </div>
                <button @click="hapusDariKeranjang(index)" class="text-gray-300 hover:text-red-500 transition text-lg leading-none" title="Hapus">&times;</button>
              </div>

              <!-- Eceran: stepper qty -->
              <div v-if="!item.isUtuh" class="flex items-center gap-2 mb-2">
                <div class="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <button @click="item.qty = Math.max(0, +(item.qty - 1).toFixed(2))" class="px-2.5 py-1.5 text-gray-500 hover:bg-gray-100 font-bold">−</button>
                  <input
                    v-model.number="item.qty" type="number" min="0" step="0.1" :max="item.maxStock"
                    class="w-16 text-center text-sm font-bold text-gray-900 border-x border-gray-200 py-1.5 focus:outline-none focus:bg-blue-50/50"
                  />
                  <button @click="item.qty = Math.min(item.maxStock, +(item.qty + 1).toFixed(2))" class="px-2.5 py-1.5 text-gray-500 hover:bg-gray-100 font-bold">+</button>
                </div>
                <select v-model="item.sellUnit" class="bg-white border border-gray-200 rounded-lg p-1.5 text-xs font-bold text-gray-600 focus:outline-none">
                  <option value="Meter">Meter</option>
                  <option value="Yard">Yard</option>
                </select>
                <span class="text-[10px] text-gray-400 ml-auto">maks {{ fmtNum(item.maxStock) }}</span>
              </div>
              <div v-else class="mb-2">
                <span class="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1 inline-block">
                  Roll utuh · {{ fmtNum(item.qty) }} {{ item.baseUnit }}
                </span>
              </div>

              <div v-if="!item.isUtuh && item.sellUnit !== item.baseUnit" class="text-[10px] text-amber-600 mb-2">
                ⚠ Dikonversi otomatis ke {{ item.baseUnit }}
              </div>

              <!-- Harga & diskon -->
              <div class="grid grid-cols-2 gap-2">
                <div class="relative">
                  <input v-model.number="item.unitPrice" type="number" min="0" placeholder="Harga / satuan"
                    class="w-full bg-white border border-gray-200 rounded-lg p-2 pl-2.5 pr-7 text-xs font-bold text-gray-800 focus:outline-none focus:border-blue-400" />
                  <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-300">Rp</span>
                </div>
                <div class="relative">
                  <input v-model.number="item.discount" type="number" min="0" placeholder="Diskon"
                    class="w-full bg-white border border-gray-200 rounded-lg p-2 pl-2.5 pr-7 text-xs font-bold text-gray-800 focus:outline-none focus:border-orange-400" />
                  <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-300">Rp</span>
                </div>
              </div>

              <div class="flex justify-between items-center mt-2.5 pt-2 border-t border-gray-100">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Subtotal</span>
                <span class="text-sm font-bold text-gray-900 tabular-nums">{{ rupiah(subtotal(item)) }}</span>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-100 px-5 py-4 space-y-2 bg-gray-50/50">
            <div class="flex justify-between text-xs text-gray-500">
              <span>Total diskon</span>
              <span class="tabular-nums">{{ rupiah(totalDiscount) }}</span>
            </div>
            <div class="flex justify-between items-baseline">
              <span class="text-sm font-bold text-gray-900">Total</span>
              <span class="text-xl font-bold text-gray-900 tabular-nums">{{ rupiah(grandTotal) }}</span>
            </div>
            <button
              @click="prosesTransaksi"
              :disabled="cart.length === 0 || processing"
              class="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm shadow-sm shadow-blue-600/20 mt-1"
            >
              {{ processing ? 'Memproses…' : 'Proses Transaksi' }}
            </button>
          </div>
        </div>
      </aside>
    </div>

    <!-- ============ MOBILE: floating cart button (di atas bottom nav layout) ============ -->
    <button
      @click="mobileCartOpen = true"
      class="lg:hidden fixed bottom-20 right-4 z-30 bg-blue-600 text-white rounded-full pl-4 pr-5 py-3 shadow-lg shadow-blue-600/30 flex items-center gap-2.5 font-bold text-sm"
    >
      <span class="relative">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3c-.6.6-.2 1.7.7 1.7H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span v-if="cart.length" class="absolute -top-1.5 -right-1.5 bg-white text-blue-600 text-[10px] font-bold rounded-full min-w-[18px] min-h-[18px] flex items-center justify-center border border-blue-100">{{ cart.length }}</span>
      </span>
      <span class="tabular-nums">{{ rupiah(grandTotal) }}</span>
    </button>

    <!-- ============ MOBILE: cart slide-over ============ -->
    <Teleport to="body">
      <div v-if="mobileCartOpen" class="lg:hidden fixed inset-0 z-50">
        <div class="absolute inset-0 bg-gray-900/40" @click="mobileCartOpen = false"></div>
        <div class="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
            <h2 class="font-bold text-gray-900">Keranjang <span class="text-gray-400 font-semibold text-sm">({{ cart.length }})</span></h2>
            <button @click="mobileCartOpen = false" class="text-gray-400 hover:text-gray-600 text-2xl leading-none px-1">&times;</button>
          </div>

          <div class="overflow-y-auto px-5 py-4 space-y-3 flex-1">
            <div v-if="cart.length === 0" class="py-10 text-center text-xs text-gray-400">Keranjang kosong</div>

            <div v-for="(item, index) in cart" :key="item.rollId" class="border border-gray-100 rounded-xl p-3 bg-gray-50/50">
              <div class="flex justify-between items-start gap-2">
                <div class="min-w-0">
                  <p class="font-semibold text-sm truncate">{{ item.fabricName }}</p>
                  <p class="text-[11px] text-gray-400 font-mono">{{ item.rollSku }}</p>
                </div>
                <button @click="hapusDariKeranjang(index)" class="text-gray-300 hover:text-red-500 text-lg leading-none">&times;</button>
              </div>

              <div v-if="!item.isUtuh" class="flex items-center gap-2 mt-2.5">
                <div class="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <button @click="item.qty = Math.max(0, +(item.qty - 1).toFixed(2))" class="px-2.5 py-1.5 text-gray-500 hover:bg-gray-100 font-bold">−</button>
                  <input
                    v-model.number="item.qty" type="number" min="0" step="0.1" :max="item.maxStock"
                    class="w-14 text-center text-sm font-bold text-gray-900 border-x border-gray-200 py-1.5 focus:outline-none"
                  />
                  <button @click="item.qty = Math.min(item.maxStock, +(item.qty + 1).toFixed(2))" class="px-2.5 py-1.5 text-gray-500 hover:bg-gray-100 font-bold">+</button>
                </div>
                <select v-model="item.sellUnit" class="bg-white border border-gray-200 rounded-lg p-1.5 text-xs font-bold text-gray-600 focus:outline-none">
                  <option value="Meter">Meter</option>
                  <option value="Yard">Yard</option>
                </select>
              </div>
              <div v-else class="mt-2">
                <span class="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1 inline-block">
                  Roll utuh · {{ fmtNum(item.qty) }} {{ item.baseUnit }}
                </span>
              </div>

              <div v-if="!item.isUtuh && item.sellUnit !== item.baseUnit" class="text-[10px] text-amber-600 mt-1.5">
                ⚠ Dikonversi otomatis ke {{ item.baseUnit }}
              </div>

              <div class="grid grid-cols-2 gap-2 mt-2.5">
                <div class="relative">
                  <input v-model.number="item.unitPrice" type="number" min="0" placeholder="Harga / satuan"
                    class="w-full bg-white border border-gray-200 rounded-lg p-2 pl-2.5 pr-7 text-xs font-bold text-gray-800 focus:outline-none focus:border-blue-400" />
                  <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-300">Rp</span>
                </div>
                <div class="relative">
                  <input v-model.number="item.discount" type="number" min="0" placeholder="Diskon"
                    class="w-full bg-white border border-gray-200 rounded-lg p-2 pl-2.5 pr-7 text-xs font-bold text-gray-800 focus:outline-none focus:border-orange-400" />
                  <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-300">Rp</span>
                </div>
              </div>

              <div class="flex justify-between items-center mt-2.5 pt-2 border-t border-gray-100">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Subtotal</span>
                <span class="text-sm font-bold text-gray-900 tabular-nums">{{ rupiah(subtotal(item)) }}</span>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-100 px-5 py-4 space-y-2 shrink-0" style="padding-bottom: calc(1rem + env(safe-area-inset-bottom))">
            <div class="flex justify-between text-xs text-gray-500">
              <span>Total diskon</span>
              <span class="tabular-nums">{{ rupiah(totalDiscount) }}</span>
            </div>
            <div class="flex justify-between items-baseline">
              <span class="text-sm font-bold">Total</span>
              <span class="text-xl font-bold tabular-nums">{{ rupiah(grandTotal) }}</span>
            </div>
            <button
              @click="prosesTransaksi"
              :disabled="cart.length === 0 || processing"
              class="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm"
            >
              {{ processing ? 'Memproses…' : 'Proses Transaksi' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

definePageMeta({ layout: 'dashboard' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const tenantId = ref(null)

// ── State ─────────────────────────────────────
const fabrics = ref([])
const searchQuery = ref('')
const selectedFabric = ref(null)
const rolls = ref([])
const loadingRolls = ref(false)
const cart = ref([])
const recentFabrics = ref([])      // kain terakhir dipilih (localStorage)
const eceranRollId = ref(null)     // roll yang lagi mode input eceran
const eceranQty = ref(null)
const processing = ref(false)
const mobileCartOpen = ref(false)
const searchInput = ref(null)

const LS_RECENT = 'pos_recent_fabrics'

// ── Helper format ─────────────────────────────
const fmtNum = (n) => Number(n || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 })
const rupiah = (n) => 'Rp ' + Math.max(0, Math.round(n || 0)).toLocaleString('id-ID')

// ── Computed ──────────────────────────────────
const filteredFabrics = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return fabrics.value.filter(f => f.name.toLowerCase().includes(q))
})

const subtotal = (item) => Math.max(0, (item.qty * (item.unitPrice || 0)) - (item.discount || 0))
const totalDiscount = computed(() => cart.value.reduce((s, i) => s + (i.discount || 0), 0))
const grandTotal = computed(() => cart.value.reduce((s, i) => s + subtotal(i), 0))
const inCart = (rollId) => cart.value.some(i => i.rollId === rollId)

// ── Shortcut keyboard: "/" fokus ke search ────
const onKey = (e) => {
  if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
    e.preventDefault()
    searchInput.value?.focus()
  }
}
onMounted(() => {
  try { recentFabrics.value = JSON.parse(localStorage.getItem(LS_RECENT) || '[]') } catch { recentFabrics.value = [] }
  window.addEventListener('keydown', onKey)
  searchInput.value?.focus()
})
onUnmounted(() => window.removeEventListener('keydown', onKey))

// ── Data ──────────────────────────────────────
watchEffect(async () => {
  const userId = user.value?.id || user.value?.sub
  if (userId) {
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', userId).single()
    if (profile) {
      tenantId.value = profile.tenant_id
      loadFabrics()
    }
  }
})

const loadFabrics = async () => {
  const { data } = await supabase.from('fabrics').select('id, name, base_unit').order('name')
  if (data) fabrics.value = data
}

const pilihKain = async (fabric) => {
  selectedFabric.value = fabric
  searchQuery.value = ''
  loadingRolls.value = true
  eceranRollId.value = null
  saveRecent(fabric)

  const { data } = await supabase
    .from('fabric_rolls')
    .select('id, sku_roll, current_length, location')
    .eq('fabric_id', fabric.id)
    .gt('current_length', 0)
    .order('created_at', { ascending: true })
  rolls.value = data || []
  loadingRolls.value = false
}

const saveRecent = (fabric) => {
  recentFabrics.value = [fabric, ...recentFabrics.value.filter(f => f.id !== fabric.id)].slice(0, 6)
  localStorage.setItem(LS_RECENT, JSON.stringify(recentFabrics.value))
}

const resetPilihan = () => {
  selectedFabric.value = null
  rolls.value = []
  eceranRollId.value = null
}

// ── Cart ──────────────────────────────────────
const tambahKeKeranjang = (roll, tipe) => {
  if (inCart(roll.id)) return
  const isUtuh = tipe === 'utuh'
  const bUnit = selectedFabric.value.base_unit || 'Meter'
  cart.value.push({
    fabricName: selectedFabric.value.name,
    rollId: roll.id,
    rollSku: roll.sku_roll,
    maxStock: Number(roll.current_length),
    qty: isUtuh ? Number(roll.current_length) : 0,
    isUtuh,
    baseUnit: bUnit,
    sellUnit: bUnit,
    unitPrice: 0,
    discount: 0,
    finalDeduction: 0
  })
  eceranRollId.value = null
}

const bukaEceran = (roll) => {
  eceranRollId.value = roll.id
  eceranQty.value = null
}

const tambahEceran = (roll) => {
  const qty = Number(eceranQty.value)
  if (!qty || qty <= 0) return
  if (qty > Number(roll.current_length)) {
    alert(`Melebihi sisa stok (${roll.current_length} ${selectedFabric.value.base_unit}) bos!`)
    return
  }
  tambahKeKeranjang(roll, 'eceran')
  const item = cart.value.find(i => i.rollId === roll.id)
  if (item) item.qty = qty
  eceranQty.value = null
}

const hapusDariKeranjang = (index) => cart.value.splice(index, 1)

// ── Checkout ──────────────────────────────────
const prosesTransaksi = async () => {
  if (cart.value.length === 0 || processing.value) return
  processing.value = true

  const invoiceNumber = `INV-${Date.now()}`

  const { data: trxData, error: trxError } = await supabase
    .from('transactions')
    .insert([{ tenant_id: tenantId.value, invoice_number: invoiceNumber }])
    .select().single()

  if (trxError) {
    alert('Gagal bikin transaksi: ' + trxError.message)
    processing.value = false
    return
  }

  cart.value.forEach(item => {
    let finalQty = item.qty
    if (item.sellUnit === 'Yard' && item.baseUnit === 'Meter') finalQty = item.qty * 0.9144
    else if (item.sellUnit === 'Meter' && item.baseUnit === 'Yard') finalQty = item.qty / 0.9144
    item.finalDeduction = finalQty
  })

  const itemsPayload = cart.value.map(item => ({
    transaction_id: trxData.id,
    tenant_id: tenantId.value,
    fabric_roll_id: item.rollId,
    length_deducted: item.finalDeduction,
    selling_price: subtotal(item)
  }))

  const { error: itemsError } = await supabase.from('transaction_items').insert(itemsPayload)
  if (itemsError) {
    alert('Gagal simpan detail barang: ' + itemsError.message)
    processing.value = false
    return
  }

  for (const item of cart.value) {
    const sisaBaru = item.maxStock - item.finalDeduction
    const { data: updateData, error: updateError } = await supabase
      .from('fabric_rolls')
      .update({ current_length: sisaBaru })
      .eq('id', item.rollId)
      .select()

    if (updateError) alert(`Gagal potong stok roll ${item.rollSku}: ` + updateError.message)
    else if (!updateData || updateData.length === 0) alert(`Peringatan: stok ${item.rollSku} gagal terpotong (cek RLS)!`)
  }

  processing.value = false
  mobileCartOpen.value = false
  alert(`Transaksi sukses bos! Nota: ${invoiceNumber}`)
  cart.value = []
  resetPilihan()
}
</script>