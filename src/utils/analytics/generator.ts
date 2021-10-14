export const logGenerationStarted = (numberOfAssets: number) => {
  // @ts-ignore
  window.heap.track("Generation started", { numberOfAssets })
}

export const logGenerationEnded = () => {
  // @ts-ignore
  window.heap.track("Generator ended")
}

export const logAssetsFileProcessed = (
  numberOfTraits: number,
  numberOfValues: number
) => {
  // @ts-ignore
  window.heap.track("Assets file processed", { numberOfTraits, numberOfValues })
}
