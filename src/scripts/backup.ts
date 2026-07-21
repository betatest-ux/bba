/**
 * `pnpm backup` — writes a timestamped backup to ./backups/:
 *
 *  - SQLite: copies the database file.
 *  - Postgres: runs pg_dump (must be installed on the host).
 *  - Media: writes a manifest of every upload (filename, alt, URL) and copies
 *    the public/media and public/documents directories.
 *
 * Restore instructions live in README.md → “Backups & restore”.
 */
import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const backupRoot = path.resolve(process.cwd(), 'backups', timestamp)

const databaseURI = process.env.DATABASE_URI || process.env.DATABASE_URL || 'file:./bba.db'

const copyDirIfExists = (from: string, to: string): void => {
  if (fs.existsSync(from)) {
    fs.cpSync(from, to, { recursive: true })
    console.log(`✔ Copied ${from}`)
  }
}

const run = async (): Promise<void> => {
  fs.mkdirSync(backupRoot, { recursive: true })

  /* Database ------------------------------------------------------- */
  if (databaseURI.startsWith('postgres')) {
    const outFile = path.join(backupRoot, 'database.sql')
    try {
      execFileSync('pg_dump', ['--no-owner', '--dbname', databaseURI, '--file', outFile], {
        stdio: 'inherit',
      })
      console.log(`✔ Postgres dump written to ${outFile}`)
    } catch (error) {
      console.error('✖ pg_dump failed — is postgresql-client installed?', error)
      process.exitCode = 1
    }
  } else {
    const dbPath = databaseURI.replace(/^file:/, '')
    const source = path.resolve(process.cwd(), dbPath)
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, path.join(backupRoot, path.basename(source)))
      console.log(`✔ SQLite database copied (${path.basename(source)})`)
    } else {
      console.warn(`! SQLite database not found at ${source}`)
    }
  }

  /* Media manifest + files ----------------------------------------- */
  const { getPayload } = await import('payload')
  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  const media = await payload.find({ collection: 'media', depth: 0, limit: 10000, pagination: false })
  const documents = await payload.find({
    collection: 'library-documents',
    depth: 0,
    limit: 10000,
    pagination: false,
  })

  const manifest = {
    createdAt: new Date().toISOString(),
    media: media.docs.map((doc) => ({ id: doc.id, filename: doc.filename, alt: doc.alt })),
    libraryDocuments: documents.docs.map((doc) => ({ id: doc.id, filename: doc.filename, title: doc.title })),
  }
  fs.writeFileSync(path.join(backupRoot, 'media-manifest.json'), JSON.stringify(manifest, null, 2))
  console.log('✔ Media manifest written')

  copyDirIfExists(path.resolve(process.cwd(), 'public/media'), path.join(backupRoot, 'media'))
  copyDirIfExists(path.resolve(process.cwd(), 'public/documents'), path.join(backupRoot, 'documents'))
  copyDirIfExists(path.resolve(process.cwd(), 'private-uploads'), path.join(backupRoot, 'private-uploads'))

  console.log(`\nBackup complete → ${backupRoot}`)
  process.exit(0)
}

void run()
