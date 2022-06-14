let isScrollDisabled = false
// スクロールの禁止はposition: fixedを利用するので、解除時に元のスクロール位置に戻す必要がある
let previousScrollX = 0
let previousScrollY = 0

/** ページのスクロールを禁止する */
export const disableScroll = () => {
  if (process.server || isScrollDisabled) {
    return
  }
  isScrollDisabled = true

  previousScrollX = window.scrollX
  previousScrollY = window.scrollY
  const htmlStyle = document.documentElement.style
  const bodyStyle = document.body.style

  // scrollbarが表示されているかどうか
  if (window.innerWidth > document.documentElement.clientWidth) {
    // 表示されている場合はがくつきを防ぐために縦のバーは表示する
    htmlStyle.setProperty('overflow-x', 'hidden')
    htmlStyle.setProperty('overflow-y', 'scroll')
  } else {
    // iOSなどではhiddenにしておかないと、モーダルをスクロールしようとしたときに親要素が反応してしまうので注意
    htmlStyle.setProperty('overflow', 'hidden')
  }

  htmlStyle.setProperty('position', 'fixed')
  htmlStyle.setProperty('width', '100%')
  htmlStyle.setProperty('left', `${-previousScrollX}px`)
  htmlStyle.setProperty('top', `${-previousScrollY}px`)
  bodyStyle.setProperty('overflow', 'hidden')
}

/** ページのスクロールを許可する */
export const enableScroll = () => {
  if (process.server || !isScrollDisabled) {
    return
  }
  isScrollDisabled = false

  const htmlStyle = document.documentElement.style
  const bodyStyle = document.body.style
  htmlStyle.removeProperty('position')
  htmlStyle.removeProperty('width')
  htmlStyle.removeProperty('left')
  htmlStyle.removeProperty('top')
  htmlStyle.removeProperty('overflow-x')
  htmlStyle.removeProperty('overflow-y')
  htmlStyle.removeProperty('overflow')
  bodyStyle.removeProperty('overflow')

  htmlStyle.setProperty('scroll-behavior', 'auto')
  bodyStyle.setProperty('scroll-behavior', 'auto')
  window.scroll(previousScrollX, previousScrollY)
  htmlStyle.removeProperty('scroll-behavior')
  bodyStyle.removeProperty('scroll-behavior')
}
