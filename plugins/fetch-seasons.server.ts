import { useSeasons } from '~/composables/useSeasons'

export default defineNuxtPlugin(async () => {
  // 在服务端预获取季节数据
  // 这会将数据填充到 useFetch 的缓存中
  await useSeasons()
})
