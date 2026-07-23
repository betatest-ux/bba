import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { resendAdapter } from '@payloadcms/email-resend'
import { s3Storage } from '@payloadcms/storage-s3'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { ActivityLog } from './collections/ActivityLog'
import { Appeals } from './collections/Appeals'
import { Categories } from './collections/Categories'
import { CVUploads } from './collections/CVUploads'
import { Events } from './collections/Events'
import { FAQs } from './collections/FAQs'
import { JobApplications } from './collections/JobApplications'
import { LibraryDocuments } from './collections/LibraryDocuments'
import { Media } from './collections/Media'
import { News } from './collections/News'
import { NewsletterSubscribers } from './collections/NewsletterSubscribers'
import { Pages } from './collections/Pages'
import { People } from './collections/People'
import { Partners } from './collections/Partners'
import { ProjectCategories } from './collections/ProjectCategories'
import { Projects } from './collections/Projects'
import { Testimonials } from './collections/Testimonials'
import { Users } from './collections/Users'
import { Vacancies } from './collections/Vacancies'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { AnnouncementBar } from './globals/AnnouncementBar'
import { Appearance } from './globals/Appearance'
import { ContactSettings } from './globals/ContactSettings'
import { CookieSettings } from './globals/CookieSettings'
import { CustomCode } from './globals/CustomCode'
import { DonationSettings } from './globals/DonationSettings'
import { EmailSettings } from './globals/EmailSettings'
import { MaintenanceMode } from './globals/MaintenanceMode'
import { SEOSettings } from './globals/SEOSettings'
import { SiteSettings } from './globals/SiteSettings'
import { exportEndpoints } from './endpoints/exports'
import { withActivityLog, withGlobalActivityLog } from './hooks/activityLog'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const databaseURI = process.env.DATABASE_URI || process.env.DATABASE_URL || 'file:./bba.db'

/**
 * Email: Resend if RESEND_API_KEY is set, SMTP via Nodemailer if SMTP_HOST is
 * set, otherwise Payload's console logger (local dev). See .env.example.
 */
const emailAdapter = process.env.RESEND_API_KEY
  ? resendAdapter({
      apiKey: process.env.RESEND_API_KEY,
      defaultFromAddress: process.env.EMAIL_FROM || 'noreply@bballiance.org.uk',
      defaultFromName: process.env.EMAIL_FROM_NAME || 'BBAlliance',
    })
  : process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: process.env.EMAIL_FROM || 'noreply@bballiance.org.uk',
        defaultFromName: process.env.EMAIL_FROM_NAME || 'BBAlliance',
        transportOptions: {
          auth: {
            pass: process.env.SMTP_PASS,
            user: process.env.SMTP_USER,
          },
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
        },
      })
    : undefined

export default buildConfig({
  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  // Postgres in production (set DATABASE_URI to a postgres:// URL), SQLite for
  // zero-dependency local development (file: URL, the default).
  db: databaseURI.startsWith('postgres')
    ? postgresAdapter({
        pool: { connectionString: databaseURI },
      })
    : sqliteAdapter({
        client: { url: databaseURI },
      }),
  collections: [
    // Content
    withActivityLog(Pages),
    withActivityLog(News),
    withActivityLog(Projects),
    withActivityLog(ProjectCategories),
    withActivityLog(People),
    withActivityLog(Vacancies),
    withActivityLog(Events),
    withActivityLog(Appeals),
    withActivityLog(Testimonials),
    withActivityLog(Partners),
    withActivityLog(FAQs),
    withActivityLog(LibraryDocuments),
    withActivityLog(Categories),
    withActivityLog(Media),
    // Inbox
    JobApplications,
    CVUploads,
    NewsletterSubscribers,
    // Admin
    withActivityLog(Users),
    ActivityLog,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  email: emailAdapter,
  endpoints: [...exportEndpoints],
  globals: [
    withGlobalActivityLog(Header),
    withGlobalActivityLog(Footer),
    withGlobalActivityLog(SiteSettings),
    withGlobalActivityLog(ContactSettings),
    withGlobalActivityLog(Appearance),
    withGlobalActivityLog(AnnouncementBar),
    withGlobalActivityLog(DonationSettings),
    withGlobalActivityLog(EmailSettings),
    withGlobalActivityLog(SEOSettings),
    withGlobalActivityLog(CustomCode),
    withGlobalActivityLog(CookieSettings),
    withGlobalActivityLog(MaintenanceMode),
  ],
  localization: {
    defaultLocale: 'en',
    fallback: true,
    locales: [
      { code: 'en', label: 'English' },
      // Scaffolded for future translation (large South Asian communities in
      // Blackburn with Darwen). Hidden on the public site until the language
      // switcher is enabled in Appearance settings — translating is then a
      // content task, not a rebuild.
      { code: 'ur', label: 'اردو (Urdu)', rtl: true },
    ],
  },
  plugins: [
    ...plugins,
    // Upload storage — picked automatically from environment, cheapest first:
    //  1. Vercel Blob (BLOB_READ_WRITE_TOKEN set): zero-config on Vercel,
    //     included in the free Hobby plan, no separate vendor or card.
    //  2. S3-compatible bucket (S3_BUCKET set): Cloudflare R2, AWS S3, etc.
    //  3. Neither: plain filesystem (local dev and the Docker/VPS route).
    // In all cases CVs stay access-controlled: files stream through
    // Payload's API (admin/editor read) rather than getting public URLs.
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            // Vercel serverless rejects request bodies over ~4.5 MB; client
            // uploads send files browser → Blob store directly, so admins can
            // upload full-size photos. Token minting requires a logged-in user.
            clientUploads: true,
            collections: {
              'cv-uploads': { prefix: 'cvs' },
              'library-documents': { prefix: 'documents' },
              media: { prefix: 'media' },
            },
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }),
        ]
      : []),
    ...(!process.env.BLOB_READ_WRITE_TOKEN && process.env.S3_BUCKET
      ? [
          s3Storage({
            bucket: process.env.S3_BUCKET,
            collections: {
              'cv-uploads': { prefix: 'cvs' },
              'library-documents': { prefix: 'documents' },
              media: { prefix: 'media' },
            },
            config: {
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
              },
              endpoint: process.env.S3_ENDPOINT,
              forcePathStyle: true,
              region: process.env.S3_REGION || 'auto',
            },
          }),
        ]
      : []),
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  upload: {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB — big enough for print-quality photos and CVs
    },
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
