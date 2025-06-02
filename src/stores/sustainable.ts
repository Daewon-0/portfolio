import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface SustainableProject {
  id: number
  title: string
  description: string
  progress: number
  participants: number
  category: 'environment' | 'social' | 'economic'
}

export const useStore = defineStore('sustainable', () => {
  // 상태
  const projects = ref<SustainableProject[]>([])
  const activeCategory = ref<string>('all')
  const loading = ref(false)

  // 게터
  const filteredProjects = computed(() => {
    if (activeCategory.value === 'all') {
      return projects.value
    }
    return projects.value.filter(project => project.category === activeCategory.value)
  })

  const projectStats = computed(() => {
    return {
      total: projects.value.length,
      environment: projects.value.filter(p => p.category === 'environment').length,
      social: projects.value.filter(p => p.category === 'social').length,
      economic: projects.value.filter(p => p.category === 'economic').length,
      totalParticipants: projects.value.reduce((acc, curr) => acc + curr.participants, 0)
    }
  })

  // 액션
  const fetchProjects = async () => {
    loading.value = true
    try {
      // API 호출 로직 구현
      const response = await fetch('/api/projects')
      const data = await response.json()
      projects.value = data
    } catch (error) {
      console.error('프로젝트 데이터 로딩 실패:', error)
    } finally {
      loading.value = false
    }
  }

  const addProject = async (project: Omit<SustainableProject, 'id'>) => {
    loading.value = true
    try {
      // API 호출 로직 구현
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(project)
      })
      const newProject = await response.json()
      projects.value.push(newProject)
    } catch (error) {
      console.error('프로젝트 추가 실패:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateProject = async (id: number, updates: Partial<SustainableProject>) => {
    loading.value = true
    try {
      // API 호출 로직 구현
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
      const updatedProject = await response.json()
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }
    } catch (error) {
      console.error('프로젝트 업데이트 실패:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const setActiveCategory = (category: string) => {
    activeCategory.value = category
  }

  return {
    // 상태
    projects,
    activeCategory,
    loading,
    
    // 게터
    filteredProjects,
    projectStats,
    
    // 액션
    fetchProjects,
    addProject,
    updateProject,
    setActiveCategory
  }
}) 