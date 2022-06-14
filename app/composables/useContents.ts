import Ajv from 'ajv'
import is from 'is'
import { Ref } from 'vue'
import { useState } from '#app'
import { Contents } from '@/contents/definition'
import schema from '@/contents/schema.json'

const ajv = new Ajv()

/** Dateに変換可能なstringかどうか調べる */
export const isDateString = (value: unknown): value is string => {
  return is.string(value) && new Date(value as string).toString() !== 'Invalid Date'
}

ajv.addFormat('date-time', (value: unknown) => {
  return isDateString(value)
})

/** jsonが定義通りかチェックして、dateなどの一部データを置換する */
export const parseContents = (json: Object): Contents => {
  const validate = ajv.compile(schema)
  if (!validate(json)) {
    throw new Error(`contents.json is invalid: ${JSON.stringify(validate.errors)}`)
  }

  // 画像はpublic/contents/imagesに配置している
  const imagePath = '/contents/images/'

  // ajvでチェック済みなので型はContentsでok
  // ajvで利用するschemaはContentsの型から自動生成しているので実装ずれも考慮しなくて良い
  const parsed = JSON.parse(JSON.stringify(json)) as Contents

  // 画像はすべてパスを置き換える
  parsed.main.introduction.image = `${imagePath}${parsed.main.introduction.image}`
  for (const project of parsed.main.projects) {
    project.images.forEach((_, i) => {
      project.images[i] = `${imagePath}${project.images[i]}`
    })
  }

  // Date型を置換する
  parsed.main.introduction.birth = new Date(parsed.main.introduction.birth)
  for (const career of parsed.main.introduction.careers) {
    career.date = new Date(career.date)
  }
  for (const project of parsed.main.projects) {
    project.date = new Date(project.date)
    project.thumbnail = `${imagePath}${project.thumbnail}`
  }

  return parsed
}

/** ポートフォリオのコンテンツを読み込む */
export const useContents = () => {
  const contents = useState<Contents | null>('contents', () => null)

  // 値を設定する前に使われないようにする
  return Object.defineProperty(
    {
      contents: contents as Ref<Contents>,
      loadContents(contentsJson: Object) {
        contents.value = parseContents(contentsJson)
      }
    },
    'contents',
    {
      get() {
        if (contents === null) {
          throw new Error('Contents data is not loaded yet.')
        }

        return contents
      }
    }
  )
}
