import { defineNuxtPlugin, useRuntimeConfig } from '#app'

/** カスタムイベント */
export enum GTMEvent {
  View = 'dyp.view',
  LinkClick = 'dyp.link.click',
  ButtonClick = 'dyp.button.click',
  Keyboard = 'dyp.keyboard'
}

/** イベントがどこで起きたか */
export enum GTMCategory {
  Top = 'top',
  ProjectSummary = 'project.summary',
  ProjectDetail = 'project.detail'
}

/** イベントのパラメータ */
type GTMEventDetail = {
  [GTMEvent.View]: {
    category: GTMCategory
    label: string
  }
  [GTMEvent.LinkClick]: {
    category: GTMCategory
    label: string
    url: string
  }
  [GTMEvent.ButtonClick]: {
    category: GTMCategory
    label: string
  }
  [GTMEvent.Keyboard]: {
    category: GTMCategory
    label: string
    key: string
  }
}

interface GTMTrigger {
  <T extends GTMEvent>(eventType: T, params: GTMEventDetail[T]): void
}

interface DataLayer {
  push(params: { 'gtm.start': number; event: 'gtm.js' }): void
  push(params: { event: GTMEvent; [key: string]: string }): void
}

declare global {
  interface Window {
    dataLayer: DataLayer
  }
}

/** gtmを読み込む */
function installGTM(gtmId: string) {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`
  document.body.appendChild(script)
}

export default defineNuxtPlugin<{ gtm: GTMTrigger }>(() => {
  // IDは環境変数から受け取る
  const gtmId = (useRuntimeConfig().public.gtmId as string | void) || null

  if (gtmId === null) {
    return {
      provide: {
        gtm: () => {}
      }
    }
  }

  installGTM(gtmId)

  return {
    provide: {
      gtm: (eventType, params) => {
        window.dataLayer.push({
          event: eventType,
          ...Object.entries(params).reduce(
            (details, [key, value]) => ({
              ...details,
              [key]: value
            }),
            {}
          )
        })
      }
    }
  }
})
