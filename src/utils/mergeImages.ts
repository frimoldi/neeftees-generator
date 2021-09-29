type Sources = string[]

const mergeImages = async (sources: Sources) => {
  const imgBitmaps = await Promise.all(
    sources.map((source) =>
      fetch(source)
        .then((res) => res.blob())
        .then(createImageBitmap)
    )
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
