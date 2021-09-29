type Sources = string[]

const base64ToBlob = (source: string, sliceSize = 512) => {
  const byteCharacters = atob(source)
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize)

    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }

  const blob = new Blob(byteArrays)
  return blob
}

const mergeImages = async (sources: Sources) => {
  const imgBitmaps = await Promise.all(
    sources.map((source) => createImageBitmap(base64ToBlob(source)))
  )

  const width = Math.max.apply(
    Math,
    imgBitmaps.map((bitmap) => bitmap.width)
  )
  const height = Math.max.apply(
    Math,
    imgBitmaps.map((bitmap) => bitmap.height)
  )

  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw Error("2d context is null!")
  }

  imgBitmaps.forEach((img) => {
    ctx.drawImage(img, 0, 0)
  })

  return canvas.convertToBlob()
}

export default mergeImages
