export interface Contents {
  main: {
    introduction: {
      author: string
      image: string
      birth: Date
      description: string
      tags: Array<string>
      careers: Array<{
        date: Date
        text: string
      }>
      favorites: Array<string>
    }
    projects: Array<{
      id: string
      title: string
      date: Date
      text: string
      position: string | null
      links: Array<{
        url: string
        comment: string | null
      }>
      site: string | null
      video: string | null
      github: string | null
      thumbnail: string
      images: Array<string>
      tags: Array<string>
    }>
  }
  tags: Array<{
    key: string
    icon: string
  }>
}
