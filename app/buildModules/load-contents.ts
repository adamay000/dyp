import { join } from 'path'
import { promisify } from 'util'
import { stat as _stat, copy } from 'fs-extra'

const stat = promisify(_stat)

// ポートフォリオに載せる情報のデータをコピーする
export const copyContentsJson = async () => {
  const contentsDirname = join(__dirname, '../contents')
  const staticDirname = join(__dirname, '../public/contents')
  const fromJson = join(contentsDirname, '.sample/contents.json')
  const fromImage = join(contentsDirname, '.sample/images')
  const toJson = join(contentsDirname, 'contents.json')
  // 開発時点のバージョンのnuxtだと<img :src="require(imagePath)">のような動的importができないのでstaticディレクトリに置く
  const toImage = join(staticDirname, 'images')

  // サンプルファイルが存在していない場合はエラー
  const fromStats = await stat(fromJson).catch(() => null)
  if (fromStats === null) {
    throw new Error(`.sample/contents.json does not exist. ${fromJson}`)
  }

  // すでにコピー済みなら何もしない
  const toStats = await stat(toJson).catch(() => null)
  if (toStats !== null) {
    return
  }

  // サンプルファイルをコピーする
  await copy(fromJson, toJson)
  await copy(fromImage, toImage)
}

export default async function loadContents() {
  await copyContentsJson()
}
