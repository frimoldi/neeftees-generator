import JSZip from "jszip"

export const validateZipFileContent = async (file: File): Promise<boolean> => {
  const zip = await JSZip.loadAsync(file)

  return zip
    .filter((relativePath) => {
      return (
        !relativePath.startsWith("__MACOSX") &&
        !relativePath.endsWith(".DS_Store")
      )
    })
    .every((file) => file.name.match(/^\/*[^/]+\/([\w,\s-]+\.png)*$/g))
}
