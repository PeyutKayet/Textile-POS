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
              class="border rounded-2xl p-4 transition shadow-sm hover:shadow-md"
              :class="inCart(roll.id) ? 'bg-blue-50/40 border-blue-200' : 'bg-white border-gray-100 hover:border-gray-300'"
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

                <!-- Mode eceran: input meter langsung di kartu roll (Diperbesar untuk touch) -->
                <div v-if="eceranRollId === roll.id" class="flex flex-col w-full sm:w-auto mt-3 pt-3 border-t border-gray-100">
                  <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Input Potongan Eceran</p>
                  <div class="flex items-center gap-2 w-full">
                    <div class="relative flex-1 sm:w-32">
                      <input
                        v-model.number="eceranQty"
                        type="number" min="0" step="0.1" :max="roll.current_length"
                        @keyup.enter="tambahEceran(roll)"
                        class="w-full border-2 border-blue-200 rounded-xl p-3 pl-4 pr-12 text-lg font-bold text-blue-700 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 bg-blue-50/30"
                        placeholder="0"
                      />
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-400">{{ selectedFabric.base_unit }}</span>
                    </div>
                    <button
                      @click="tambahEceran(roll)"
                      :disabled="!eceranQty || eceranQty <= 0"
                      class="bg-blue-600 text-white text-sm font-bold px-5 py-3.5 rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm shadow-blue-600/30"
                    >
                      Tambah
                    </button>
                    <button @click="eceranRollId = null" class="bg-gray-50 border border-gray-200 text-gray-400 hover:text-gray-600 p-3.5 rounded-xl transition">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
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

    <!-- ============ MOBILE: cart full-screen modal ============ -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition transform duration-300 ease-out"
        enter-from-class="translate-y-full opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition transform duration-200 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-full opacity-0"
      >
        <div v-if="mobileCartOpen" class="lg:hidden fixed inset-0 z-[60] bg-gray-50 flex flex-col">
          <div class="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100 shrink-0 shadow-sm">
            <h2 class="font-bold text-gray-900 text-lg">Keranjang <span class="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-sm ml-1">({{ cart.length }})</span></h2>
            <button @click="mobileCartOpen = false" class="bg-gray-100 text-gray-500 hover:text-gray-700 p-2 rounded-full transition">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div class="overflow-y-auto px-4 py-5 space-y-4 flex-1">
            <div v-if="cart.length === 0" class="py-20 text-center flex flex-col items-center">
              <span class="text-5xl opacity-30 mb-3">🛒</span>
              <p class="text-gray-400 font-semibold">Keranjang masih kosong</p>
            </div>

            <div v-for="(item, index) in cart" :key="item.rollId" class="bg-white border border-gray-100 shadow-sm rounded-2xl p-4">
              <div class="flex justify-between items-start gap-2 mb-3">
                <div class="min-w-0">
                  <p class="font-bold text-base text-gray-900 truncate">{{ item.fabricName }}</p>
                  <p class="text-xs text-gray-400 font-mono mt-0.5">{{ item.rollSku }}</p>
                </div>
                <button @click="hapusDariKeranjang(index)" class="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-xl transition">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>

              <div v-if="!item.isUtuh" class="flex flex-wrap items-center gap-3 mt-1 mb-3">
                <div class="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-inner">
                  <button @click="item.qty = Math.max(0, +(item.qty - 1).toFixed(2))" class="px-4 py-3 text-gray-600 hover:bg-gray-200 font-bold text-lg leading-none">−</button>
                  <input
                    v-model.number="item.qty" type="number" min="0" step="0.1" :max="item.maxStock"
                    class="w-16 text-center text-base font-bold text-gray-900 border-x border-gray-200 py-3 focus:outline-none bg-transparent"
                  />
                  <button @click="item.qty = Math.min(item.maxStock, +(item.qty + 1).toFixed(2))" class="px-4 py-3 text-gray-600 hover:bg-gray-200 font-bold text-lg leading-none">+</button>
                </div>
                <select v-model="item.sellUnit" class="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20">
                  <option value="Meter">Meter</option>
                  <option value="Yard">Yard</option>
                </select>
              </div>
              <div v-else class="mt-2 mb-3">
                <span class="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5 inline-block">
                  Roll utuh · {{ fmtNum(item.qty) }} {{ item.baseUnit }}
                </span>
              </div>

              <div v-if="!item.isUtuh && item.sellUnit !== item.baseUnit" class="text-xs font-semibold text-amber-600 bg-amber-50 p-2 rounded-lg mb-3">
                ⚠ Dikonversi otomatis ke {{ item.baseUnit }}
              </div>

              <div class="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Harga / {{ item.sellUnit }}</label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">Rp</span>
                    <input v-model.number="item.unitPrice" type="number" min="0"
                      class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 pl-9 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:bg-white" />
                  </div>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Diskon</label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">Rp</span>
                    <input v-model.number="item.discount" type="number" min="0"
                      class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 pl-9 text-sm font-bold text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:bg-white" />
                  </div>
                </div>
              </div>

              <div class="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Subtotal</span>
                <span class="text-lg font-bold text-blue-700 tabular-nums">{{ rupiah(subtotal(item)) }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white border-t border-gray-100 px-5 py-5 space-y-3 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]" style="padding-bottom: calc(1.25rem + env(safe-area-inset-bottom))">
            <div class="flex justify-between text-sm text-gray-500 font-semibold">
              <span>Total Diskon</span>
              <span class="tabular-nums text-orange-500">-{{ rupiah(totalDiscount) }}</span>
            </div>
            <div class="flex justify-between items-baseline">
              <span class="text-base font-bold text-gray-900">Total Pembayaran</span>
              <span class="text-2xl font-black text-gray-900 tabular-nums">{{ rupiah(grandTotal) }}</span>
            </div>
            <button
              @click="prosesTransaksi"
              :disabled="cart.length === 0 || processing"
              class="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition text-base shadow-lg shadow-blue-600/30 mt-2 flex items-center justify-center gap-2"
            >
              <svg v-if="processing" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              {{ processing ? 'Memproses...' : 'Proses Transaksi' }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

definePageMeta({ layout: 'dashboard' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const tenantId = ref(null)

// ── State ─────────────────────────────────────
const fabrics = ref([])
const searchQuery = ref('')
const searchTimeout = ref(null)
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
const filteredFabrics = computed(() => fabrics.value)

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
    }
  }
})

// Debounced search database-side
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
      .select('id, name, base_unit')
      .ilike('name', `%${q}%`)
      .limit(20)
    
    if (data) fabrics.value = data
  }, 300)
})

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