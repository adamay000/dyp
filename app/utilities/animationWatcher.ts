import defer from 'p-defer'

/**
 * anime.jsのタイムラインのアニメーションの終了を監視するためのpromiseを作る
 * @example
 * const animationWatcher = new AnimationWatcher()
 * const animation = anime.timeline()
 * animation.complete = () => animationWatcher.resolve()
 * function enter() {
 *   const promise = animationWatcher.create()
 *   animation.play()
 *   return promise
 * }
 */
export class AnimationWatcher {
  private readonly watchers = [] as Array<ReturnType<typeof defer>>

  /** アニメーションの終了を監視するpromiseを作る */
  public create(): Promise<void> {
    const deferred = defer<void>()
    this.watchers.push(deferred)
    return deferred.promise
  }

  /** アニメーションの終了時に監視中のすべてのpromiseを解決する */
  public resolve() {
    this.watchers.forEach((watcher) => watcher.resolve())
    this.watchers.length = 0
  }
}
