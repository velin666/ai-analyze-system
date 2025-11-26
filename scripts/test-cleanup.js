import { promises as fs } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const UPLOAD_DIR = join(process.cwd(), 'uploads')

async function createTestFiles() {
  console.log('Creating test files...')

  // 确保目录存在
  try {
    await fs.access(UPLOAD_DIR)
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
  }

  // 创建一个旧文件（25小时前）
  const oldFile = join(UPLOAD_DIR, 'test-old-file.txt')
  await fs.writeFile(oldFile, 'This is an old test file')

  // 修改文件时间为25小时前
  const oldTime = new Date(Date.now() - 25 * 60 * 60 * 1000)
  await fs.utimes(oldFile, oldTime, oldTime)

  // 创建对应的元数据文件
  const metaFile = join(UPLOAD_DIR, 'test-old-file.meta.json')
  await fs.writeFile(
    metaFile,
    JSON.stringify(
      {
        id: 'test-old-file',
        name: 'test-old-file.txt',
        originalName: 'test-old-file.txt',
        uploadedAt: oldTime.toISOString(),
      },
      null,
      2
    )
  )
  await fs.utimes(metaFile, oldTime, oldTime)

  // 创建一个新文件（1小时前）
  const newFile = join(UPLOAD_DIR, 'test-new-file.txt')
  await fs.writeFile(newFile, 'This is a new test file')

  const newTime = new Date(Date.now() - 1 * 60 * 60 * 1000)
  await fs.utimes(newFile, newTime, newTime)

  console.log('Test files created:')
  console.log('- test-old-file.txt (25 hours old) - should be deleted')
  console.log('- test-old-file.meta.json (25 hours old) - should be deleted')
  console.log('- test-new-file.txt (1 hour old) - should be kept')
}

async function checkFiles() {
  console.log('\nCurrent files in uploads directory:')
  try {
    const files = await fs.readdir(UPLOAD_DIR)
    if (files.length === 0) {
      console.log('(directory is empty)')
      return
    }

    for (const file of files) {
      const filePath = join(UPLOAD_DIR, file)
      const stats = await fs.stat(filePath)
      const ageHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60)
      console.log(`- ${file} (${ageHours.toFixed(1)} hours old)`)
    }
  } catch (error) {
    console.log('No uploads directory found')
  }
}

async function main() {
  if (process.argv[2] === 'create') {
    await createTestFiles()
  }

  await checkFiles()
}

main().catch(console.error)
