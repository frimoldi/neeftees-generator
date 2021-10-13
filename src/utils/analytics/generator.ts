export const logGenerationStarted = (numberOfAssets: number) => {
  console.log("Generator started: ", numberOfAssets)
}

export const logGenerationEnded = () => {
  console.log("Generator ended")
}

export const logAssetsFileProcessed = (
  numberOfTraits: number,
  numberOfValues: number
) => {
  console.log("Assets file processed:")
  console.log("- number of traits: ", numberOfTraits)
  console.log("- number of values: ", numberOfValues)
}
