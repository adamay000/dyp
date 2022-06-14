import { defineNuxtPlugin } from '#app'
import { useContents } from '@/composables/useContents'
import contents from '@/contents/contents.json'

export default defineNuxtPlugin(() => {
  // TODO 認証行う？ssgならアプリケーションの外でやった方がよさそう
  const { loadContents } = useContents()
  loadContents(contents)
})
