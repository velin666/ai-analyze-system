import { startFileCleanupScheduler } from '../utils/fileCleanup'

export default async () => {
  // Start the file cleanup scheduler when the server starts
  startFileCleanupScheduler()
}
