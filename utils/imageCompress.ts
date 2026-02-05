/**
 * Compresse une image pour une photo de profil : petite taille, qualité améliorée.
 * Cible : max 96px, JPEG qualité 0.7, ~15-35 KB.
 */
const MAX_SIZE = 96
const JPEG_QUALITY = 0.7

export async function compressProfileImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Canvas non disponible'))
      return
    }

    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height = Math.round((height * MAX_SIZE) / width)
          width = MAX_SIZE
        } else {
          width = Math.round((width * MAX_SIZE) / height)
          height = MAX_SIZE
        }
      }
      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Échec compression'))
        },
        'image/jpeg',
        JPEG_QUALITY
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Image invalide'))
    }
    img.src = url
  })
}
