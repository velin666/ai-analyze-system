import { cleanupOldFiles } from '../server/utils/fileCleanup.js'

console.log('Testing direct cleanup function...')

try {
  await cleanupOldFiles()
  console.log('Cleanup function executed successfully!')
} catch (error) {
  console.error('Error running cleanup:', error.message)
}
