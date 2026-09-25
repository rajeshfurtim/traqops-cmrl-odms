/** Saves a blob as a file. The one seam to swap when files come from the server. */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/** Keeps a file name to letters, digits, dot, dash and underscore. */
export const safeFileName = (name: string) => name.replace(/[^\w.-]+/g, '_').replace(/_+/g, '_')
