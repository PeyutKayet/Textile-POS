<template>
  <div>
    <VitePwaManifest />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- Popup PWA Install -->
    <div v-if="showPopup" class="fixed bottom-4 left-4 right-4 md:bottom-8 md:left-auto md:right-8 md:w-96 z-[9999] bg-white rounded-xl shadow-2xl border border-gray-100 p-5 flex flex-col gap-3">
      <div class="flex justify-between items-start gap-3">
        <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-gray-900 text-sm">Install Aplikasi Kasir</h3>
          <p v-if="isIOS" class="text-xs text-gray-500 mt-1">Tap icon <b>Share</b> di bawah layar Safari, lalu pilih <b>"Add to Home Screen"</b> biar bisa diakses tanpa browser.</p>
          <p v-else class="text-xs text-gray-500 mt-1">Install aplikasi ini di HP kamu biar lebih kenceng dan berasa kayak aplikasi native!</p>
        </div>
        <button @click="tutupPopup" class="text-gray-400 hover:text-gray-600 px-1 text-2xl leading-none">&times;</button>
      </div>
      
      <button v-if="!isIOS" @click="installPWA" class="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-blue-700 transition">
        Install Sekarang
      </button>
    </div>

    <!-- Toast Tekan Back Sekali Lagi -->
    <div v-if="showExitToast" class="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] bg-gray-900/90 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-xl transition-opacity duration-300">
      Tekan sekali lagi untuk keluar
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const route = useRoute()
const router = useRouter()

const showPopup = ref(false)
const deferredPrompt = ref(null)
const isIOS = ref(false)

// State buat fitur Back Button
const showExitToast = ref(false)
let backPressedOnce = false

onMounted(() => {
  // ==============================
  // 1. Logika PWA Install
  // ==============================
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
  if (!isStandalone) {
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)

    if (isIosDevice) {
      isIOS.value = true
      if (!localStorage.getItem('hideInstallPopup')) {
        setTimeout(() => { showPopup.value = true }, 2000)
      }
    } else {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        deferredPrompt.value = e
        if (!localStorage.getItem('hideInstallPopup')) {
          setTimeout(() => { showPopup.value = true }, 2000)
        }
      })
    }
  }

  // ==============================
  // 2. Logika Tombol Back (Native Feel)
  // ==============================
  // Kasih jebakan history pakai URL saat ini biar browser gak ngelepas aplikasinya
  window.history.pushState(null, document.title, window.location.href)

  window.addEventListener('popstate', (e) => {
    if (route.path === '/') {
      if (!backPressedOnce) {
        // Tahan agar tidak langsung keluar, pasang jebakan lagi di posisi sekarang
        window.history.pushState(null, document.title, window.location.href)
        
        backPressedOnce = true
        showExitToast.value = true
        
        // Reset state setelah 2 detik
        setTimeout(() => {
          backPressedOnce = false
          showExitToast.value = false
        }, 2000)
      } else {
        // Biarkan lolos dan keluar
        window.history.back()
      }
    } else {
      // Kalau posisi BUKAN di Dashboard, paksa balik ke Dashboard
      router.push('/')
      setTimeout(() => {
        // Pasang jebakan baru setelah sampai di Dashboard
        window.history.pushState(null, document.title, window.location.href)
      }, 100)
    }
  })
})

const installPWA = async () => {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    if (outcome === 'accepted') {
      console.log('User menginstall PWA')
    }
    deferredPrompt.value = null
  }
  showPopup.value = false
}

const tutupPopup = () => {
  showPopup.value = false
  localStorage.setItem('hideInstallPopup', 'true')
}
</script>