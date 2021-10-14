export const initialize = (env: "development" | "production" | "test") => {
  if (env === "test") return

  if (env === "development") {
    // @ts-ignore
    window.heap.load("181194367")
  } else if (env === "production") {
    // @ts-ignore
    window.heap.load("4062471324")
  }

  // @ts-ignore
  window.heap.identify()
}
