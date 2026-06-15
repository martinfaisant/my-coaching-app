import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outDir = join(root, 'public', 'og')
const logoPath = join(root, 'public', 'logo.png')
const outPath = join(outDir, 'default.jpg')

const WIDTH = 1200
const HEIGHT = 630
const FOREST_DARK = '#627e59'
const FOREST_DARKER = '#506648'

mkdirSync(outDir, { recursive: true })

const gradientSvg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${FOREST_DARKER}"/>
      <stop offset="100%" style="stop-color:${FOREST_DARK}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
</svg>
`

const background = await sharp(Buffer.from(gradientSvg)).png().toBuffer()
const logo = await sharp(logoPath)
  .resize(320, 320, { fit: 'inside', withoutEnlargement: true })
  .png()
  .toBuffer()

await sharp(background)
  .composite([{ input: logo, gravity: 'center' }])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(outPath)

console.log(`OG image written to ${outPath}`)
