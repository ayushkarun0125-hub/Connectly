/* global Buffer */
import fs from 'fs/promises'
import path from 'path'

const uploadsDir = path.resolve('data', 'uploads')

export async function saveFile({ filename, data }) {
  await fs.mkdir(uploadsDir, { recursive: true })
  const safeFilename = `${Date.now()}-${filename}`
  const filePath = path.join(uploadsDir, safeFilename)
  const buffer = Buffer.from(data, 'base64')
  await fs.writeFile(filePath, buffer)
  return safeFilename
}
