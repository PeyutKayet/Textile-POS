<template>
  <div class="flex h-screen bg-gray-50/70">
    <!-- ============ SIDEBAR (desktop) ============ -->
    <aside class="hidden md:flex w-60 lg:w-64 bg-white border-r border-gray-100 flex-col shrink-0 z-10">
      <!-- Brand -->
      <div class="h-16 flex items-center gap-2.5 px-5 border-b border-gray-100 shrink-0">
        <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5.586a1 1 0 01.707.293l7 7a1 1 0 010 1.414l-5.586 5.586a1 1 0 01-1.414 0l-7-7A1 1 0 017 8.586V4a1 1 0 011-1z" />
          </svg>
        </div>
        <div class="min-w-0">
          <h2 class="text-sm font-bold text-gray-900 truncate leading-tight">{{ storeName }}</h2>
          <p class="text-[10px] text-gray-400 font-medium">Panel Toko Kain</p>
        </div>
      </div>

      <!-- Menu -->
      <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
        <p class="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-300">Menu Utama</p>
        <NuxtLink
          v-for="item in activeMenuItems"
          :key="item.to"
          :to="item.to"
          class="group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition"
          :class="isActive(item.to)
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'"
        >
          <span
            class="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-blue-600 transition-opacity"
            :class="isActive(item.to) ? 'opacity-100' : 'opacity-0'"
          ></span>
          <span v-html="item.icon" class="shrink-0 [&>svg]:w-[18px] [&>svg]:h-[18px]"></span>
          {{ item.label }}
        </NuxtLink>
      </nav>

      <!-- Footer sidebar: user mini -->
      <div class="p-3 border-t border-gray-100">
        <div class="flex items-center gap-2.5 px-2 py-2">
          <div class="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
            {{ initial }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold text-gray-800 truncate">{{ userName }}</p>
            <p class="text-[10px] text-gray-400">Sedang aktif</p>
          </div>
          <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
        </div>
      </div>
    </aside>

    <!-- ============ AREA KANAN ============ -->
    <div class="flex-1 flex flex-col overflow-hidden relative min-w-0">
      <!-- Header -->
      <header class="h-16 bg-white/80 backdrop-blur border-b border-gray-100 flex items-center px-4 md:px-6 justify-between shrink-0 z-20">
        <!-- Judul halaman (otomatis dari route) -->
        <div class="flex items-center gap-3 min-w-0">
          <h1 class="text-base font-bold text-gray-900 truncate">{{ currentPageTitle }}</h1>
        </div>

        <!-- Profil dropdown -->
        <div class="relative" ref="dropdownRef">
          <button
            @click="showDropdown = !showDropdown"
            class="flex items-center gap-2.5 rounded-full pl-1 pr-2 md:pr-3 py-1 hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-sm shadow-blue-600/30">
              {{ initial }}
            </div>
            <div class="text-left hidden sm:block">
              <p class="text-xs font-bold text-gray-800 leading-tight max-w-[120px] truncate">{{ userName }}</p>
              <p class="text-[10px] text-gray-400 leading-tight">{{ storeName }}</p>
            </div>
            <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          <!-- Dropdown panel -->
          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 translate-y-1 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div v-if="showDropdown" class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl shadow-gray-900/5 border border-gray-100 py-2 z-50 origin-top-right">
              <div class="px-4 py-2.5 border-b border-gray-50 mb-1">
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-300">Masuk sebagai</p>
                <p class="text-sm font-bold text-gray-800 truncate mt-0.5">{{ userName }}</p>
              </div>
              <NuxtLink
                v-for="item in activeProfileMenu"
                :key="item.to"
                :to="item.to"
                @click="showDropdown = false"
                class="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
              >
                <span v-html="item.icon" class="[&>svg]:w-4 [&>svg]:h-4 text-gray-400"></span>
                {{ item.label }}
              </NuxtLink>
              <div class="border-t border-gray-50 mt-1 pt-1">
                <button
                  @click="logout"
                  class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Keluar
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </header>

      <!-- Konten -->
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>

      <!-- ============ BOTTOM NAV (mobile) ============ -->
      <nav class="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-40" style="padding-bottom: env(safe-area-inset-bottom)">
        <div class="flex items-center justify-around h-16">
          <NuxtLink
            v-for="item in activeMenuItems"
            :key="item.to"
            :to="item.to"
            class="flex-1 h-full flex flex-col items-center justify-center gap-1 transition relative"
            :class="isActive(item.to) ? 'text-blue-600' : 'text-gray-400'"
          >
            <span
              class="absolute top-0 w-8 h-0.5 rounded-full bg-blue-600 transition-opacity"
              :class="isActive(item.to) ? 'opacity-100' : 'opacity-0'"
            ></span>
            <span v-html="item.icon" class="[&>svg]:w-5 [&>svg]:h-5"></span>
            <span class="text-[10px] font-semibold">{{ item.short }}</span>
          </NuxtLink>
        </div>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const route = useRoute()

const userName = ref('Memuat...')
const userRole = ref(null) // Ubah ke null biar sistem tau ini status "lagi loading"
const storeName = ref('JuraganPOS')
const showDropdown = ref(false)
const dropdownRef = ref(null)

// ── Ikon ──
const icons = {
  dashboard: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
  stock: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>',
  inbound: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 14l-4-4m0 0l4-4m-4 4h12a4 4 0 010 8h-1"/></svg>',
  pos: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3c-.6.6-.2 1.7.7 1.7H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>',
  history: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  users: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>',
  settings: '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>'
}

const menuItems = [
  { to: '/', label: 'Dashboard', short: 'Home', icon: icons.dashboard, title: 'Beranda' },
  { to: '/bahan', label: 'Katalog Stok', short: 'Stok', icon: icons.stock, title: 'Katalog Stok' },
  { to: '/barang-masuk', label: 'Barang Masuk', short: 'Masuk', icon: icons.inbound, title: 'Barang Masuk' },
  { to: '/pos', label: 'Kasir (POS)', short: 'Kasir', icon: icons.pos, title: 'Kasir' },
  { to: '/riwayat', label: 'Riwayat Transaksi', short: 'Riwayat', icon: icons.history, title: 'Riwayat Transaksi' }
]

const profileMenu = [
  { to: '/pegawai', label: 'Manajemen Pegawai', icon: icons.users },
  { to: '/pengaturan', label: 'Pengaturan Akun', icon: icons.settings }
]

// ── 1. Solusi Glitch Menu ──
const activeMenuItems = computed(() => {
  if (userRole.value === null) return [] // Kosongin dulu selama loading, biar nggak kedip
  if (userRole.value === 'kasir') {
    return menuItems.filter(m => m.to === '/bahan')
  }
  return menuItems 
})

const activeProfileMenu = computed(() => {
  if (userRole.value === null || userRole.value === 'kasir') {
    return [] 
  }
  return profileMenu
})

// ── 2. Proteksi Bypass Rute (Satpam) ──
watchEffect(() => {
  // Kalau pegawai maksa ketik URL selain '/bahan', tendang balik!
  if (userRole.value === 'kasir' && route.path !== '/bahan') {
    navigateTo('/bahan')
  }
})

// ── Active state & judul halaman ──
const isActive = (to) => to === '/' ? route.path === '/' : route.path.startsWith(to)
const currentPageTitle = computed(() =>
  menuItems.find(m => isActive(m.to))?.title || storeName.value
)
const initial = computed(() => (userName.value || '?').charAt(0).toUpperCase())

const onClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) showDropdown.value = false
}
onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))

const logout = async () => {
  await supabase.auth.signOut()
  navigateTo('/login')
}

watchEffect(async () => {
  const userId = user.value?.id || user.value?.sub
  if (!userId) return navigateTo('/login')

  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, role, tenants ( name )')
    .eq('id', userId)
    .maybeSingle()

  if (data) {
    userName.value = data.full_name || 'User'
    userRole.value = data.role 
    if (data.tenants) storeName.value = data.tenants.name
  } else if (error) {
    console.error('Gagal ambil data profil:', error.message)
  }
})
</script>