<template>
  <div class="min-h-screen bg-gradient-to-b from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
    <header class="container mx-auto px-4 py-6">
      <nav class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-green-800 dark:text-green-200">지속가능한 사회</h1>
        <div class="flex items-center space-x-4">
          <button 
            v-for="menu in navigation" 
            :key="menu.id"
            class="px-4 py-2 rounded-lg hover:bg-green-200 dark:hover:bg-green-700 transition-colors"
            @click="handleNavigation(menu.path)"
          >
            {{ menu.name }}
          </button>
        </div>
      </nav>
    </header>

    <main class="container mx-auto px-4 py-8">
      <section class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div class="space-y-6">
          <h2 class="text-4xl font-bold text-green-900 dark:text-green-100">
            함께 만드는<br/>지속가능한 미래
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            우리의 작은 실천이 모여 더 나은 미래를 만듭니다.
            지속가능한 사회를 위한 여정에 함께해주세요.
          </p>
          <div class="flex space-x-4">
            <button 
              class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              @click="startJourney"
            >
              시작하기
            </button>
            <button 
              class="px-6 py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-800 transition-colors"
              @click="learnMore"
            >
              더 알아보기
            </button>
          </div>
        </div>
        <div class="relative h-96">
          <canvas ref="canvas" class="w-full h-full rounded-lg shadow-xl"></canvas>
        </div>
      </section>

      <section class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div 
          v-for="card in sustainableCards" 
          :key="card.id"
          class="p-6 bg-white dark:bg-green-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
        >
          <div class="h-12 w-12 mb-4 rounded-full bg-green-100 dark:bg-green-700 flex items-center justify-center">
            <component :is="card.icon" class="h-6 w-6 text-green-600 dark:text-green-200"/>
          </div>
          <h3 class="text-xl font-semibold mb-3 text-green-800 dark:text-green-200">{{ card.title }}</h3>
          <p class="text-gray-600 dark:text-gray-300">{{ card.description }}</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { useTheme } from '@/composables/useTheme'
import { useStore } from '@/stores/sustainable'

// 라우터 설정
const router = useRouter()

// 상태 관리
const store = useStore()

// 테마 관리
const { isDark } = useTheme()

// Three.js 관련 참조
const canvas = ref<HTMLCanvasElement | null>(null)
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let geometry: THREE.SphereGeometry
let material: THREE.MeshPhongMaterial
let sphere: THREE.Mesh
let animationFrameId: number

// 네비게이션 메뉴
const navigation = [
  { id: 1, name: '홈', path: '/' },
  { id: 2, name: '프로젝트', path: '/projects' },
  { id: 3, name: '커뮤니티', path: '/community' },
  { id: 4, name: '소개', path: '/about' }
]

// 지속가능성 카드 데이터
const sustainableCards = [
  {
    id: 1,
    title: '환경 보호',
    description: '자연과 환경을 보호하여 미래 세대를 위한 지속가능한 환경을 만듭니다.',
    icon: 'LeafIcon'
  },
  {
    id: 2,
    title: '사회적 가치',
    description: '공정하고 포용적인 사회를 만들어 모두가 함께 성장할 수 있는 기회를 제공합니다.',
    icon: 'PeopleIcon'
  },
  {
    id: 3,
    title: '경제적 지속성',
    description: '지속가능한 경제 발전을 통해 안정적인 미래를 구축합니다.',
    icon: 'ChartIcon'
  }
]

// Three.js 초기화
const initThree = () => {
  if (!canvas.value) return

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, canvas.value.clientWidth / canvas.value.clientHeight, 0.1, 1000)
  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, alpha: true })
  renderer.setSize(canvas.value.clientWidth, canvas.value.clientHeight)

  geometry = new THREE.SphereGeometry(5, 32, 32)
  material = new THREE.MeshPhongMaterial({
    color: 0x44bb77,
    wireframe: true
  })
  sphere = new THREE.Mesh(geometry, material)
  scene.add(sphere)

  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(10, 10, 10)
  scene.add(light)

  camera.position.z = 15

  animate()
}

// 애니메이션 함수
const animate = () => {
  animationFrameId = requestAnimationFrame(animate)
  sphere.rotation.x += 0.01
  sphere.rotation.y += 0.01
  renderer.render(scene, camera)
}

// 이벤트 핸들러
const handleNavigation = (path: string) => {
  router.push(path)
}

const startJourney = () => {
  router.push('/projects')
}

const learnMore = () => {
  router.push('/about')
}

// 라이프사이클 훅
onMounted(() => {
  initThree()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  window.removeEventListener('resize', handleResize)
})

// 반응형 처리
const handleResize = () => {
  if (!canvas.value) return
  
  camera.aspect = canvas.value.clientWidth / canvas.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(canvas.value.clientWidth, canvas.value.clientHeight)
}
</script>

<style scoped>
.container {
  max-width: 1280px;
}

@media (max-width: 768px) {
  .container {
    max-width: 100%;
  }
}
</style> 