import type { CollectionSlug, GlobalSlug, Payload, PayloadRequest } from 'payload'

import { daysFromNow, makePlaceholderImage, makePlaceholderPDF, rt } from './helpers'

const collectionsToClear: CollectionSlug[] = [
  'search',
  'form-submissions',
  'forms',
  'pages',
  'news',
  'projects',
  'project-categories',
  'job-applications',
  'cv-uploads',
  'vacancies',
  'events',
  'appeals',
  'testimonials',
  'partners',
  'faqs',
  'library-documents',
  'newsletter-subscribers',
  'people',
  'categories',
  'activity-log',
  'redirects',
  'media',
]

// Next.js revalidation errors are normal when seeding the database without a
// server running (e.g. `pnpm seed`) — they can be safely ignored.
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  const context = { disableRevalidate: true }
  payload.logger.info('Seeding BBAlliance demo content…')

  /* ---------------------------------------------------------------- */
  /* Clear existing content                                            */
  /* ---------------------------------------------------------------- */
  payload.logger.info('— Clearing collections…')
  for (const collection of collectionsToClear) {
    try {
      await payload.delete({
        collection,
        where: { id: { exists: true } },
        context,
        depth: 0,
      })
    } catch (error) {
      payload.logger.warn(`Could not clear ${collection}: ${(error as Error).message}`)
    }
  }

  /* ---------------------------------------------------------------- */
  /* Users (upsert — never duplicate)                                   */
  /* ---------------------------------------------------------------- */
  payload.logger.info('— Ensuring demo users…')
  const demoUsers = [
    {
      name: 'Demo Admin [PLACEHOLDER — replace]',
      email: 'admin@bballiance.org.uk',
      roles: ['admin'],
    },
    {
      name: 'Demo Editor [PLACEHOLDER — replace]',
      email: 'editor@bballiance.org.uk',
      roles: ['editor'],
    },
    {
      name: 'Demo Contributor [PLACEHOLDER — replace]',
      email: 'contributor@bballiance.org.uk',
      roles: ['contributor'],
    },
  ] as const

  const password = process.env.SEED_ADMIN_PASSWORD || 'bballiance-demo'
  for (const user of demoUsers) {
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: user.email } },
      limit: 1,
    })
    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: { ...user, password, roles: [...user.roles] },
        context,
      })
    }
  }

  /* ---------------------------------------------------------------- */
  /* Media placeholders                                                 */
  /* ---------------------------------------------------------------- */
  payload.logger.info('— Generating placeholder imagery…')
  const image = async (label: string, w: number, h: number, tone?: Parameters<typeof makePlaceholderImage>[3]) => {
    const file = await makePlaceholderImage(label, w, h, tone)
    const doc = await payload.create({
      collection: 'media',
      context,
      data: { alt: `${label} [PLACEHOLDER — replace with a real photo]` },
      file,
    })
    return doc.id
  }

  const heroImg = await image('Community day on Blackburn Boulevard', 1920, 1080, 'loom')
  const youthImg = await image('Youth club five-a-side', 1200, 800, 'brick')
  const foodImg = await image('Food pantry volunteers', 1200, 800, 'moor')
  const elderImg = await image('Elders tea afternoon', 1200, 800, 'gold')
  const educationImg = await image('Homework club', 1200, 800, 'loom')
  const environmentImg = await image('Corporation Park clean-up', 1200, 800, 'moor')
  const internationalImg = await image('Water project, Sylhet', 1200, 800, 'brick')
  const aboutImg = await image('Darwen Tower at dusk', 1200, 900, 'loom')
  const appealImg = await image('Winter warmth appeal', 1200, 800, 'brick')
  const eventImg1 = await image('Community iftar', 1200, 800, 'gold')
  const eventImg2 = await image('Family fun day', 1200, 800, 'moor')
  const eventImg3 = await image('Charity walk to Darwen Tower', 1200, 800, 'loom')
  const newsImg1 = await image('New minibus arrival', 1200, 800, 'brick')
  const newsImg2 = await image('Volunteer awards night', 1200, 800, 'loom')
  const newsImg3 = await image('Pantry milestone', 1200, 800, 'moor')
  const personImg = await image('Team member portrait', 800, 1000, 'cotton')
  const partnerLogo1 = await image('Partner logo — council', 400, 200, 'cotton')
  const partnerLogo2 = await image('Partner logo — foundation', 400, 200, 'cotton')
  const partnerLogo3 = await image('Partner logo — housing', 400, 200, 'cotton')
  const partnerLogo4 = await image('Partner logo — college', 400, 200, 'cotton')
  const ogImg = await image('BBAlliance — stronger together', 1200, 630, 'loom')

  /* ---------------------------------------------------------------- */
  /* Taxonomies                                                         */
  /* ---------------------------------------------------------------- */
  payload.logger.info('— Creating categories…')
  const projectCategoryNames = [
    'Youth',
    'Food Support',
    'Elderly Care',
    'Education',
    'Environment',
    'International',
  ]
  const projectCategories: Record<string, number> = {}
  for (const title of projectCategoryNames) {
    const doc = await payload.create({
      collection: 'project-categories',
      context,
      data: { title, slug: title.toLowerCase().replace(/\s+/g, '-') },
    })
    projectCategories[title] = doc.id as number
  }

  const newsCategoryNames = ['Community', 'Fundraising', 'Volunteering']
  const newsCategories: Record<string, number> = {}
  for (const title of newsCategoryNames) {
    const doc = await payload.create({
      collection: 'categories',
      context,
      data: { title, slug: title.toLowerCase() },
    })
    newsCategories[title] = doc.id as number
  }

  /* ---------------------------------------------------------------- */
  /* People                                                             */
  /* ---------------------------------------------------------------- */
  payload.logger.info('— Creating people…')
  const people = [
    { name: 'Yusuf Patel [PLACEHOLDER — replace]', role: 'Chair of Trustees', personType: 'trustee', displayOrder: 1 },
    { name: 'Sarah Whittaker [PLACEHOLDER — replace]', role: 'Treasurer', personType: 'trustee', displayOrder: 2 },
    { name: 'Mohammed Iqbal [PLACEHOLDER — replace]', role: 'Trustee — Safeguarding Lead', personType: 'trustee', displayOrder: 3 },
    { name: 'Amina Begum [PLACEHOLDER — replace]', role: 'Charity Manager', personType: 'staff', displayOrder: 1 },
    { name: 'Danny Holden [PLACEHOLDER — replace]', role: 'Youth & Community Worker', personType: 'staff', displayOrder: 2 },
    { name: 'Fatima Shah [PLACEHOLDER — replace]', role: 'Volunteer Coordinator', personType: 'volunteer', displayOrder: 1 },
    { name: 'George Aspinall [PLACEHOLDER — replace]', role: 'Pantry Volunteer', personType: 'volunteer', displayOrder: 2 },
  ] as const

  const personIds: number[] = []
  for (const person of people) {
    const doc = await payload.create({
      collection: 'people',
      context,
      data: {
        ...person,
        personType: person.personType,
        photo: personImg,
        bio: rt(
          `${person.name.replace(' [PLACEHOLDER — replace]', '')} has been part of BBAlliance since [PLACEHOLDER year]. [PLACEHOLDER — replace with a short, warm biography of two or three sentences.]`,
        ),
      },
    })
    personIds.push(doc.id as number)
  }

  /* ---------------------------------------------------------------- */
  /* Partners & testimonials & FAQs                                     */
  /* ---------------------------------------------------------------- */
  payload.logger.info('— Creating partners, testimonials, FAQs…')
  const partnerDefs = [
    { name: 'Blackburn with Darwen Borough Council [PLACEHOLDER — replace]', logo: partnerLogo1, partnerType: 'partner', url: 'https://www.blackburn.gov.uk' },
    { name: 'Lancashire Community Foundation [PLACEHOLDER — replace]', logo: partnerLogo2, partnerType: 'funder', url: 'https://example.org' },
    { name: 'Together Housing [PLACEHOLDER — replace]', logo: partnerLogo3, partnerType: 'sponsor', url: 'https://example.org' },
    { name: 'Blackburn College [PLACEHOLDER — replace]', logo: partnerLogo4, partnerType: 'partner', url: 'https://example.org' },
  ] as const
  const partnerIds: number[] = []
  for (const partner of partnerDefs) {
    const doc = await payload.create({
      collection: 'partners',
      context,
      data: { ...partner, partnerType: partner.partnerType },
    })
    partnerIds.push(doc.id as number)
  }

  const testimonialDefs = [
    {
      quote:
        'The youth club gave our son somewhere to belong. He’s made friends from right across town — it’s changed our whole week. [PLACEHOLDER — replace]',
      name: 'Saima',
      context: 'Parent, Bastwell youth club',
    },
    {
      quote:
        'I was on my own after my wife passed. The Tuesday tea afternoons got me out of the house — now I help set the chairs out. [PLACEHOLDER — replace]',
      name: 'George',
      context: 'Elders group member, Darwen',
    },
    {
      quote:
        'When work dried up, the pantry meant my kids never noticed the difference. No forms, no fuss, just neighbours helping. [PLACEHOLDER — replace]',
      name: 'Kelly',
      context: 'Food pantry member',
    },
  ]
  for (const testimonial of testimonialDefs) {
    await payload.create({ collection: 'testimonials', context, data: testimonial })
  }

  const faqDefs = [
    { question: 'How can I volunteer with BBAlliance?', category: 'volunteering', displayOrder: 1, answer: rt('Have a look at our current volunteer roles on the Get Involved page, or just send us the interest form — we’ll find something that fits the time you have. Most roles need no experience at all. [PLACEHOLDER — review]') },
    { question: 'Do I need a DBS check to volunteer?', category: 'volunteering', displayOrder: 2, answer: rt('Only for roles working directly with children or vulnerable adults — and we arrange and pay for the check for you. [PLACEHOLDER — review]') },
    { question: 'Where does my donation go?', category: 'donations', displayOrder: 1, answer: rt('Donations fund our local projects in Blackburn and Darwen first — the pantry, youth clubs and elders’ groups — plus our national and international appeals. Our accounts are published on the Reports & documents page. [PLACEHOLDER — review]') },
    { question: 'Can I Gift Aid my donation?', category: 'donations', displayOrder: 2, answer: rt('Yes — if you’re a UK taxpayer, Gift Aid adds 25p to every £1 you give at no cost to you. Tick the Gift Aid box when you donate. [PLACEHOLDER — review]') },
    { question: 'Who can use the food pantry?', category: 'projects', displayOrder: 1, answer: rt('Anyone in Blackburn with Darwen who needs it. No referral needed — just come along during opening hours. [PLACEHOLDER — review]') },
    { question: 'How do I hire your community space?', category: 'general', displayOrder: 1, answer: rt('Get in touch through the contact page with the date and what you’re planning, and we’ll come back to you within two working days. [PLACEHOLDER — review]') },
  ]
  for (const faq of faqDefs) {
    await payload.create({ collection: 'faqs', context, data: { ...faq, category: faq.category as 'general' } })
  }

  /* ---------------------------------------------------------------- */
  /* Projects                                                           */
  /* ---------------------------------------------------------------- */
  payload.logger.info('— Creating projects…')
  const projectDefs = [
    {
      title: 'Bastwell Youth Club',
      slug: 'bastwell-youth-club',
      category: 'Youth',
      status: 'ongoing',
      location: 'Bastwell, Blackburn',
      coverImage: youthImg,
      summary:
        'Twice-weekly sports, games and mentoring for 11–16s — a safe, welcoming space run by local volunteers. [PLACEHOLDER — replace]',
      impactStats: [
        { value: 120, suffix: '+', label: 'young people each week [PLACEHOLDER]' },
        { value: 14, label: 'volunteer mentors [PLACEHOLDER]' },
      ],
    },
    {
      title: 'Neighbourhood Food Pantry',
      slug: 'neighbourhood-food-pantry',
      category: 'Food Support',
      status: 'ongoing',
      location: 'Audley Range, Blackburn',
      coverImage: foodImg,
      summary:
        'A dignified, membership-style pantry: £3.50 a visit for a full basket of fresh food and cupboard staples. [PLACEHOLDER — replace]',
      impactStats: [
        { value: 6800, label: 'meals shared this year [PLACEHOLDER]' },
        { value: 300, suffix: '+', label: 'member households [PLACEHOLDER]' },
      ],
    },
    {
      title: 'Tuesday Tea Afternoons',
      slug: 'tuesday-tea-afternoons',
      category: 'Elderly Care',
      status: 'ongoing',
      location: 'Darwen',
      coverImage: elderImg,
      summary:
        'Company, cake and a warm room for older neighbours — with door-to-door lifts from our volunteer drivers. [PLACEHOLDER — replace]',
      impactStats: [{ value: 45, label: 'regular members [PLACEHOLDER]' }],
    },
    {
      title: 'After-School Homework Club',
      slug: 'after-school-homework-club',
      category: 'Education',
      status: 'ongoing',
      location: 'Little Harwood, Blackburn',
      coverImage: educationImg,
      summary:
        'Quiet desks, friendly tutors and free wifi, four nights a week — helping every child keep up. [PLACEHOLDER — replace]',
      impactStats: [{ value: 85, label: 'pupils supported each term [PLACEHOLDER]' }],
    },
    {
      title: 'Green Streets Clean-ups',
      slug: 'green-streets-clean-ups',
      category: 'Environment',
      status: 'upcoming',
      location: 'Across Blackburn with Darwen',
      coverImage: environmentImg,
      summary:
        'Monthly litter-picks and planting days, street by street — kit provided, all ages welcome. [PLACEHOLDER — replace]',
      impactStats: [{ value: 40, label: 'bags collected per event [PLACEHOLDER]' }],
    },
    {
      title: 'Clean Water for Sylhet',
      slug: 'clean-water-for-sylhet',
      category: 'International',
      status: 'completed',
      location: 'Sylhet, Bangladesh',
      coverImage: internationalImg,
      summary:
        'Working with a trusted local partner, we funded 12 tube wells serving around 1,800 people. [PLACEHOLDER — replace]',
      impactStats: [
        { value: 12, label: 'wells installed [PLACEHOLDER]' },
        { value: 1800, suffix: '+', label: 'people with clean water [PLACEHOLDER]' },
      ],
    },
  ] as const

  const projectIds: number[] = []
  for (const project of projectDefs) {
    const doc = await payload.create({
      collection: 'projects',
      context,
      data: {
        title: project.title,
        slug: project.slug,
        summary: project.summary,
        coverImage: project.coverImage,
        categories: [projectCategories[project.category]],
        status: project.status,
        location: project.location,
        impactStats: [...project.impactStats],
        partners: [partnerIds[0]],
        body: rt(
          `## What we do`,
          `${project.summary}`,
          `[PLACEHOLDER — replace with two or three paragraphs about ${project.title}: who it serves, when it runs, what a typical session looks like, and how people can join in.]`,
          `## Get involved`,
          `Want to help with ${project.title}? Visit our Get Involved page or drop us a line through the contact form.`,
        ),
        gallery: [
          { image: project.coverImage, caption: 'Add real photos through the Media library [PLACEHOLDER]' },
        ],
        _status: 'published',
      },
    })
    projectIds.push(doc.id as number)
  }

  /* ---------------------------------------------------------------- */
  /* News                                                               */
  /* ---------------------------------------------------------------- */
  payload.logger.info('— Creating news…')
  const newsDefs = [
    {
      title: 'Our new community minibus has arrived',
      slug: 'new-community-minibus',
      heroImage: newsImg1,
      category: 'Community',
      publishedAt: daysFromNow(-6),
      body: 'Thanks to your generosity and a grant from [PLACEHOLDER — funder name], our 16-seat minibus is finally here. It will run lifts to the Tuesday tea afternoons and take the youth club on trips across Lancashire. [PLACEHOLDER — replace with the full story.]',
    },
    {
      title: 'Volunteer awards night celebrates 60 local heroes',
      slug: 'volunteer-awards-night',
      heroImage: newsImg2,
      category: 'Volunteering',
      publishedAt: daysFromNow(-20),
      body: 'King George’s Hall was full as we said thank you to the volunteers who make everything possible. [PLACEHOLDER — replace with the full story and real names/photos with consent.]',
    },
    {
      title: 'Food pantry passes 300 member households',
      slug: 'pantry-300-households',
      heroImage: newsImg3,
      category: 'Fundraising',
      publishedAt: daysFromNow(-45),
      body: 'Three years after opening, the Neighbourhood Food Pantry now supports more than 300 households a week. [PLACEHOLDER — replace with the full story.]',
    },
  ]
  const newsIds: number[] = []
  for (const article of newsDefs) {
    const doc = await payload.create({
      collection: 'news',
      context,
      data: {
        title: `${article.title} [PLACEHOLDER — replace]`,
        slug: article.slug,
        heroImage: article.heroImage,
        categories: [newsCategories[article.category]],
        authors: [personIds[3]],
        publishedAt: article.publishedAt,
        content: rt(article.body, '[PLACEHOLDER — add quotes, photos and details, then delete this line.]'),
        meta: { description: article.body.slice(0, 150) },
        _status: 'published',
      },
    })
    newsIds.push(doc.id as number)
  }

  /* ---------------------------------------------------------------- */
  /* Events                                                             */
  /* ---------------------------------------------------------------- */
  payload.logger.info('— Creating events…')
  const eventDefs = [
    {
      title: 'Family Fun Day [PLACEHOLDER — replace]',
      slug: 'family-fun-day',
      coverImage: eventImg2,
      startDate: daysFromNow(12, 11),
      endDate: daysFromNow(12, 15),
      venue: 'Corporation Park, Blackburn [PLACEHOLDER]',
      summary: 'Bouncy castles, food stalls, football and face painting — free entry, everyone welcome. [PLACEHOLDER]',
    },
    {
      title: 'Charity Walk to Darwen Tower [PLACEHOLDER — replace]',
      slug: 'charity-walk-darwen-tower',
      coverImage: eventImg3,
      startDate: daysFromNow(26, 9),
      endDate: daysFromNow(26, 13),
      venue: 'Meet at Darwen Market Square [PLACEHOLDER]',
      summary: 'A sponsored 5-mile walk up to the tower and back, raising funds for the Winter Warmth Appeal. [PLACEHOLDER]',
      bookingLink: 'https://example.org/[PLACEHOLDER-booking-link]',
    },
    {
      title: 'Community Iftar [PLACEHOLDER — replace]',
      slug: 'community-iftar',
      coverImage: eventImg1,
      startDate: daysFromNow(40, 19),
      venue: 'Bangor Street Community Centre [PLACEHOLDER]',
      summary: 'Neighbours of all faiths and none breaking bread together — bring a dish if you can. [PLACEHOLDER]',
      recurrenceNote: 'Held every year during Ramadan',
    },
    {
      title: 'Spring Jumble Sale [PLACEHOLDER — replace]',
      slug: 'spring-jumble-sale',
      coverImage: eventImg2,
      startDate: daysFromNow(-30, 10),
      endDate: daysFromNow(-30, 14),
      venue: 'St. Silas’ Church Hall [PLACEHOLDER]',
      summary: 'Bargains for all the family — every penny to local projects. [PLACEHOLDER]',
    },
  ]
  for (const event of eventDefs) {
    await payload.create({
      collection: 'events',
      context,
      data: {
        ...event,
        description: rt(
          event.summary,
          '[PLACEHOLDER — add the full event details: timings, accessibility, parking, contact.]',
        ),
        _status: 'published',
      },
    })
  }

  /* ---------------------------------------------------------------- */
  /* Appeals                                                            */
  /* ---------------------------------------------------------------- */
  payload.logger.info('— Creating appeals…')
  const winterAppeal = await payload.create({
    collection: 'appeals',
    context,
    data: {
      title: 'Winter Warmth Appeal [PLACEHOLDER — replace]',
      slug: 'winter-warmth-appeal',
      summary:
        'Help us keep 200 local households warm this winter with heated blankets, warm packs and energy top-up vouchers. [PLACEHOLDER]',
      story: rt(
        '## Why it matters',
        'Cold homes make people ill. Last winter, our volunteers delivered warm packs to over 150 households across Blackburn and Darwen — this year the need is bigger. [PLACEHOLDER — replace with the real appeal story.]',
        '## What your gift buys',
        '£10 buys a heated blanket. £25 tops up a pre-payment meter for a week. £50 kits out a whole household for winter. [PLACEHOLDER — check amounts.]',
      ),
      coverImage: appealImg,
      targetAmount: 15000,
      raisedAmount: 9250,
      endDate: daysFromNow(75),
      _status: 'published',
    },
  })

  await payload.create({
    collection: 'appeals',
    context,
    data: {
      title: 'Ramadan Food Parcels 2025 [PLACEHOLDER — replace]',
      slug: 'ramadan-food-parcels-2025',
      summary: 'COMPLETED: 400 food parcels delivered across the borough and to partners overseas. [PLACEHOLDER]',
      story: rt('Thanks to 300 generous donors this appeal beat its target. [PLACEHOLDER — replace with the wrap-up story and photos.]'),
      coverImage: foodImg,
      targetAmount: 10000,
      raisedAmount: 11480,
      endDate: daysFromNow(-90),
      _status: 'published',
    },
  })

  /* ---------------------------------------------------------------- */
  /* Vacancies                                                          */
  /* ---------------------------------------------------------------- */
  payload.logger.info('— Creating vacancies…')
  const vacancyDefs = [
    {
      title: 'Youth Worker (part-time) [PLACEHOLDER — replace]',
      slug: 'youth-worker-part-time',
      vacancyType: 'paid',
      location: 'Bastwell, Blackburn',
      hours: '21 hours / week, including two evenings',
      salary: '£24,500 pro rata [PLACEHOLDER]',
      closingDate: daysFromNow(21, 17),
    },
    {
      title: 'Finance & Admin Officer [PLACEHOLDER — replace]',
      slug: 'finance-admin-officer',
      vacancyType: 'paid',
      location: 'Blackburn town centre office',
      hours: '14 hours / week, flexible',
      salary: '£23,000 pro rata [PLACEHOLDER]',
      closingDate: daysFromNow(14, 12),
    },
    {
      title: 'Volunteer Minibus Driver [PLACEHOLDER — replace]',
      slug: 'volunteer-minibus-driver',
      vacancyType: 'voluntary',
      location: 'Blackburn & Darwen',
      hours: 'Tuesday afternoons, 2–3 hours',
      closingDate: daysFromNow(60, 17),
    },
    {
      title: 'Volunteer Pantry Assistant [PLACEHOLDER — replace]',
      slug: 'volunteer-pantry-assistant',
      vacancyType: 'voluntary',
      location: 'Audley Range, Blackburn',
      hours: 'Any weekday morning',
      closingDate: daysFromNow(60, 17),
    },
  ] as const
  for (const vacancy of vacancyDefs) {
    await payload.create({
      collection: 'vacancies',
      context,
      data: {
        ...vacancy,
        vacancyType: vacancy.vacancyType,
        description: rt(
          '## About the role',
          '[PLACEHOLDER — replace with the role description: what they’ll do, who they’ll work with, what a week looks like.]',
          '## Who we’re looking for',
          '[PLACEHOLDER — replace with the person specification. Keep it human — list what matters, not a wall of “essential criteria”.]',
          '## How to apply',
          'Use the application form below — we reply to every applicant within a week of the closing date.',
        ),
        _status: 'published',
      },
    })
  }

  /* ---------------------------------------------------------------- */
  /* Document library                                                   */
  /* ---------------------------------------------------------------- */
  payload.logger.info('— Creating document library…')
  const documentDefs = [
    { title: 'Annual Report 2025 [PLACEHOLDER — replace]', year: 2025, documentCategory: 'report' },
    { title: 'Annual Accounts 2025 [PLACEHOLDER — replace]', year: 2025, documentCategory: 'accounts' },
    { title: 'Safeguarding Policy [PLACEHOLDER — replace]', year: 2026, documentCategory: 'policy' },
    { title: 'AGM Minutes — March 2026 [PLACEHOLDER — replace]', year: 2026, documentCategory: 'minutes' },
  ] as const
  for (const document of documentDefs) {
    await payload.create({
      collection: 'library-documents',
      context,
      data: {
        title: document.title,
        year: document.year,
        documentCategory: document.documentCategory,
        description: 'Replace this placeholder PDF with the real document. [PLACEHOLDER]',
      },
      file: makePlaceholderPDF(document.title),
    })
  }

  /* ---------------------------------------------------------------- */
  /* Forms (form builder)                                               */
  /* ---------------------------------------------------------------- */
  payload.logger.info('— Creating forms…')
  const contactForm = await payload.create({
    collection: 'forms',
    context,
    data: {
      title: 'Contact form',
      confirmationType: 'message',
      confirmationMessage: rt('Thank you — your message is on its way. We aim to reply within two working days.'),
      emails: [
        {
          emailTo: 'hello@bballiance.org.uk',
          emailFrom: '"BBAlliance website" <noreply@bballiance.org.uk>',
          subject: 'New contact enquiry: {{subject}}',
          message: rt('A new enquiry has arrived from the website contact form.'),
        },
      ],
      fields: [
        { blockType: 'text', name: 'name', label: 'Your name', required: true, width: 50 },
        { blockType: 'email', name: 'email', label: 'Email address', required: true, width: 50 },
        { blockType: 'text', name: 'phone', label: 'Phone (optional)', required: false, width: 50 },
        {
          blockType: 'select',
          name: 'subject',
          label: 'What is it about?',
          required: true,
          width: 50,
          options: [
            { label: 'General', value: 'general' },
            { label: 'Volunteering', value: 'volunteering' },
            { label: 'Donations', value: 'donations' },
            { label: 'Media', value: 'media' },
            { label: 'Partnerships', value: 'partnerships' },
            { label: 'Other', value: 'other' },
          ],
        },
        { blockType: 'textarea', name: 'message', label: 'Your message', required: true },
        {
          blockType: 'checkbox',
          name: 'consent',
          label: 'I’m happy for BBAlliance to store this message and reply to me (see our privacy policy).',
          required: true,
        },
      ],
    },
  })

  const volunteerForm = await payload.create({
    collection: 'forms',
    context,
    data: {
      title: 'Volunteer interest form',
      confirmationType: 'message',
      confirmationMessage: rt('Thank you! Our volunteer coordinator will be in touch within a week.'),
      emails: [
        {
          emailTo: 'hello@bballiance.org.uk',
          emailFrom: '"BBAlliance website" <noreply@bballiance.org.uk>',
          subject: 'New volunteer interest from {{name}}',
          message: rt('Someone new wants to volunteer.'),
        },
      ],
      fields: [
        { blockType: 'text', name: 'name', label: 'Your name', required: true, width: 50 },
        { blockType: 'email', name: 'email', label: 'Email address', required: true, width: 50 },
        {
          blockType: 'textarea',
          name: 'interests',
          label: 'What would you like to help with, and roughly how much time do you have?',
          required: true,
        },
        {
          blockType: 'checkbox',
          name: 'consent',
          label: 'I’m happy for BBAlliance to store these details and contact me about volunteering.',
          required: true,
        },
      ],
    },
  })

  /* ---------------------------------------------------------------- */
  /* Pages                                                              */
  /* ---------------------------------------------------------------- */
  payload.logger.info('— Creating pages…')

  const policyPage = (title: string, slug: string, bodyIntro: string) =>
    payload.create({
      collection: 'pages',
      context,
      depth: 0,
      data: {
        title,
        slug,
        hero: { type: 'lowImpact', richText: rt(`# ${title}`, 'Template text for the charity to review — this is a starting point, not legal advice. [PLACEHOLDER — review before launch]') },
        layout: [
          {
            blockType: 'content',
            columns: [
              {
                size: 'full',
                richText: rt(
                  bodyIntro,
                  '## What this covers',
                  '[PLACEHOLDER — this template text must be reviewed and completed by the charity. It is a starting point, not legal advice.]',
                  '## Contact us about this policy',
                  'Questions about this policy can be sent via our contact page or to hello@bballiance.org.uk.',
                ),
              },
            ],
          },
        ],
        meta: { description: `${title} for BBAlliance.` },
        _status: 'published',
      },
    })

  // Editable 404 wording (used by the not-found page).
  await payload.create({
    collection: 'pages',
    context,
    depth: 0,
    data: {
      title: 'Page Not Found (404 wording)',
      slug: 'page-not-found',
      hero: {
        type: 'lowImpact',
        richText: rt(
          '# Well, this street doesn’t exist',
          'The page you’re after may have moved or been renamed. Try the menu, or head back home.',
        ),
      },
      layout: [
        {
          blockType: 'content',
          columns: [
            {
              size: 'full',
              richText: rt(
                'This page’s heading and text appear on the site’s “404 — page not found” screen. Edit the Hero section above to change the wording.',
              ),
            },
          ],
        },
      ],
      meta: { description: 'Page not found.' },
      _status: 'published',
    },
  })

  await policyPage('Privacy Policy', 'privacy-policy', 'How BBAlliance collects, uses and protects personal information, in line with UK GDPR.')
  await policyPage('Cookie Policy', 'cookie-policy', 'What cookies this website uses and how you can control them.')
  await policyPage('Safeguarding Statement', 'safeguarding', 'BBAlliance is committed to keeping children and vulnerable adults safe in everything we do.')
  await policyPage('Accessibility Statement', 'accessibility', 'We want everyone to be able to use this website. This page explains what we do to make it accessible, and how to tell us if something isn’t working for you.')
  await policyPage('Complaints Procedure', 'complaints', 'How to raise a concern or complaint about BBAlliance, and what happens next.')

  const aboutPage = await payload.create({
    collection: 'pages',
    context,
    depth: 0,
    data: {
      title: 'About Us',
      slug: 'about-us',
      hero: {
        type: 'mediumImpact',
        media: aboutImg,
        richText: rt(
          '# Rooted in Blackburn and Darwen',
          'BBAlliance began around one kitchen table in [PLACEHOLDER year] with a simple idea: neighbours looking after neighbours.',
        ),
      },
      layout: [
        {
          blockType: 'imageTextSplit',
          image: aboutImg,
          imagePosition: 'right',
          richText: rt(
            '## Our story',
            'From one food collection in [PLACEHOLDER year], BBAlliance has grown into a charity running youth clubs, a food pantry, elders’ groups and education projects across Blackburn with Darwen — while supporting trusted partners nationally and internationally. [PLACEHOLDER — replace with the real story.]',
            '## Our mission',
            'Stronger together: practical help, real friendship and opportunities for every neighbour, whatever their background. [PLACEHOLDER — replace]',
          ),
        },
        {
          blockType: 'statRow',
          heading: 'What that looks like',
          background: 'tint',
          stats: [
            { value: 6, label: 'projects running today [PLACEHOLDER]' },
            { value: 60, suffix: '+', label: 'active volunteers [PLACEHOLDER]' },
            { value: 6800, label: 'meals shared this year [PLACEHOLDER]' },
            { value: 3, label: 'countries reached [PLACEHOLDER]' },
          ],
        },
        {
          blockType: 'timeline',
          heading: 'How we got here',
          items: [
            { marker: '[YEAR]', title: 'Founded [PLACEHOLDER]', description: rt('A first food collection organised from a living room in Bastwell. [PLACEHOLDER — replace]') },
            { marker: '[YEAR]', title: 'First premises [PLACEHOLDER]', description: rt('The pantry opens its doors on Audley Range. [PLACEHOLDER — replace]') },
            { marker: '[YEAR]', title: 'Charity registered [PLACEHOLDER]', description: rt('BBAlliance becomes a registered charity. [PLACEHOLDER — replace]') },
            { marker: 'Today', title: 'Six projects and counting', description: rt('Youth, food, elders, education, environment and international work. [PLACEHOLDER — replace]') },
          ],
        },
        {
          blockType: 'content',
          columns: [
            {
              size: 'full',
              richText: rt(
                '## Governance',
                'BBAlliance is governed by a volunteer board of trustees who meet every [PLACEHOLDER] weeks. Our annual reports and accounts are published on the Reports & documents page — we believe in being open about where every pound goes.',
              ),
            },
          ],
        },
        {
          blockType: 'cta',
          richText: rt('## Meet the people behind the work'),
          links: [
            { link: { type: 'custom', label: 'Trustees & staff', url: '/trustees-and-staff', appearance: 'default' } },
            { link: { type: 'custom', label: 'Reports & documents', url: '/documents', appearance: 'outline' } },
          ],
        },
      ],
      meta: {
        description: 'The story, mission and people of BBAlliance — a community charity in Blackburn and Darwen.',
      },
      _status: 'published',
    },
  })

  const trusteesPage = await payload.create({
    collection: 'pages',
    context,
    depth: 0,
    data: {
      title: 'Trustees & Staff',
      slug: 'trustees-and-staff',
      hero: {
        type: 'lowImpact',
        richText: rt('# The people behind BBAlliance', 'Trustees who steer us, staff who run things day to day, and volunteers who make it all happen.'),
      },
      layout: [
        {
          blockType: 'content',
          columns: [
            {
              size: 'full',
              richText: rt('Our full team is shown below — this page updates automatically when People are edited in the admin panel.'),
            },
          ],
        },
      ],
      meta: { description: 'Meet the trustees, staff and volunteers of BBAlliance.' },
      _status: 'published',
    },
  })

  const homePage = await payload.create({
    collection: 'pages',
    context,
    depth: 0,
    data: {
      title: 'Home',
      slug: 'home',
      hero: {
        type: 'highImpact',
        media: heroImg,
        richText: rt(
          '# Stronger together in Blackburn and Darwen',
          'We’re your neighbours — running youth clubs, a food pantry, elders’ groups and more, right here in the borough and beyond.',
        ),
        links: [
          { link: { type: 'custom', label: 'Donate', url: '/donate', appearance: 'default' } },
          { link: { type: 'custom', label: 'Get involved', url: '/get-involved', appearance: 'outline' } },
        ],
      },
      layout: [
        {
          blockType: 'statRow',
          heading: 'This year, together',
          stats: [
            { value: 6800, label: 'meals shared [PLACEHOLDER]' },
            { value: 120, suffix: '+', label: 'young people each week [PLACEHOLDER]' },
            { value: 60, suffix: '+', label: 'active volunteers [PLACEHOLDER]' },
            { value: 15000, prefix: '£', label: 'raised for winter warmth [PLACEHOLDER]' },
          ],
        },
        {
          blockType: 'featuredProjects',
          heading: 'What we do',
          populateBy: 'latest',
          limit: 3,
        },
        {
          blockType: 'appealProgress',
          appeal: winterAppeal.id,
          showStory: false,
        },
        {
          blockType: 'archive',
          introContent: rt('## Latest news'),
          populateBy: 'collection',
          relationTo: 'news',
          limit: 3,
        },
        {
          blockType: 'eventsStrip',
          heading: 'What’s on',
          limit: 3,
        },
        {
          blockType: 'testimonialsBlock',
          heading: 'In our neighbours’ words',
          populateBy: 'latest',
          limit: 3,
        },
        {
          blockType: 'partnerLogos',
          heading: 'Working alongside',
          populateBy: 'all',
        },
        {
          blockType: 'cta',
          richText: rt('## Ready to lend a hand?', 'An hour a week changes someone’s whole week — including yours.'),
          links: [
            { link: { type: 'custom', label: 'Volunteer with us', url: '/get-involved', appearance: 'default' } },
            { link: { type: 'custom', label: 'Donate', url: '/donate', appearance: 'outline' } },
          ],
        },
      ],
      meta: {
        title: 'BBAlliance — community charity in Blackburn and Darwen',
        description:
          'BBAlliance runs youth clubs, a food pantry, elders’ groups and education projects across Blackburn with Darwen, and supports causes nationally and internationally.',
        image: ogImg,
      },
      _status: 'published',
    },
  })

  /* ---------------------------------------------------------------- */
  /* Globals                                                            */
  /* ---------------------------------------------------------------- */
  payload.logger.info('— Configuring globals…')

  await payload.updateGlobal({
    slug: 'site-settings',
    context,
    data: {
      siteName: 'BBAlliance',
      strapline: 'Stronger together in Blackburn and Darwen',
      charityNumber: 'Registered Charity No. [PENDING]',
      registeredAddress: '[PLACEHOLDER — replace] 1 Example Street, Blackburn, BB1 1AA',
      organisationLine:
        'BBAlliance is a community charity based in Blackburn with Darwen, Lancashire. [PLACEHOLDER — add CIO/company details]',
    },
  })

  await payload.updateGlobal({
    slug: 'contact-settings',
    context,
    data: {
      email: 'hello@bballiance.org.uk',
      phone: '01254 000000 [PLACEHOLDER]',
      address: '[PLACEHOLDER — replace]\nBBAlliance Community Hub\n1 Example Street\nBlackburn BB1 1AA',
      officeHours: [
        { days: 'Monday – Friday', hours: '9am – 5pm' },
        { days: 'Saturday', hours: '10am – 1pm' },
      ],
      latitude: 53.7486,
      longitude: -2.4842,
      mapZoom: 15,
      socialLinks: [
        { platform: 'facebook', url: 'https://facebook.com/[PLACEHOLDER]' },
        { platform: 'instagram', url: 'https://instagram.com/[PLACEHOLDER]' },
        { platform: 'x', url: 'https://x.com/[PLACEHOLDER]' },
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'appearance',
    context,
    data: { accent: 'brick', heroStyle: 'weave', darkModeEnabled: true, localeSwitcherEnabled: false },
  })

  await payload.updateGlobal({
    slug: 'donation-settings',
    context,
    data: {
      donateUrl: 'https://www.justgiving.com/[PLACEHOLDER-replace]',
      donateLabel: 'Donate',
      appealText: rt(
        'Every pound you give stays close to home — funding the pantry, youth clubs and elders’ groups here in Blackburn and Darwen, and trusted partner projects further afield. [PLACEHOLDER — review]',
      ),
      giftAidText: rt(
        'If you’re a UK taxpayer, Gift Aid makes your donation worth 25% more — at no extra cost to you. Just tick the Gift Aid box when donating and the government adds 25p to every £1. [PLACEHOLDER — review]',
      ),
    },
  })

  await payload.updateGlobal({
    slug: 'email-settings',
    context,
    data: {
      fromName: 'BBAlliance',
      fromEmail: 'noreply@bballiance.org.uk',
      contactRecipients: [{ email: 'hello@bballiance.org.uk' }],
      jobsRecipients: [{ email: 'hello@bballiance.org.uk' }],
    },
  })

  await payload.updateGlobal({
    slug: 'seo-settings',
    context,
    data: {
      titleTemplate: '%s | BBAlliance',
      defaultDescription:
        'BBAlliance is a community charity in Blackburn and Darwen, Lancashire, running local projects and supporting causes nationally and internationally. [PLACEHOLDER — review]',
      defaultOGImage: ogImg,
      allowIndexing: true,
      legalName: 'BBAlliance [PLACEHOLDER — replace with registered name]',
      areaServed: 'Blackburn with Darwen, Lancashire, UK',
    },
  })

  await payload.updateGlobal({
    slug: 'cookie-settings',
    context,
    data: {
      bannerHeading: 'Cookies on this site',
      bannerText: rt(
        'We use essential cookies to make this site work. With your permission, we’d also use analytics cookies to understand how it’s used — nothing is switched on until you say so.',
      ),
      acceptLabel: 'Accept all',
      rejectLabel: 'Essential only',
      categories: [
        { key: 'essential', label: 'Essential', alwaysOn: true, description: 'Needed for the site to function — remembering cookie choices, keeping forms secure.' },
        { key: 'analytics', label: 'Analytics', alwaysOn: false, description: 'Help us understand which pages are useful. Never used to identify you.' },
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'announcement-bar',
    context,
    data: {
      enabled: true,
      message: rt('Our Winter Warmth Appeal is live — help keep 200 local households warm. [PLACEHOLDER]'),
      enableLink: true,
      link: { type: 'custom', label: 'Give warmth', url: '/appeals/winter-warmth-appeal', newTab: false },
      variant: 'urgent',
    },
  })

  await payload.updateGlobal({
    slug: 'maintenance-mode',
    context,
    data: {
      enabled: false,
      heading: 'We’ll be back soon',
      message: rt('We’re making some improvements to the site. In the meantime you can reach us at hello@bballiance.org.uk.'),
    },
  })

  await payload.updateGlobal({
    slug: 'header',
    context,
    data: {
      navItems: [
        { link: { type: 'reference', label: 'About us', reference: { relationTo: 'pages', value: aboutPage.id } } },
        {
          link: { type: 'custom', label: 'Our activities', url: '/activities' },
        },
        { link: { type: 'custom', label: 'News', url: '/news' } },
        { link: { type: 'custom', label: 'Events', url: '/events' } },
        {
          link: { type: 'custom', label: 'Get involved', url: '/get-involved' },
          children: [
            { link: { type: 'custom', label: 'Volunteer', url: '/get-involved' } },
            { link: { type: 'custom', label: 'Work with us', url: '/jobs' } },
            { link: { type: 'custom', label: 'Appeals', url: '/appeals' } },
            { link: { type: 'custom', label: 'Partner with us', url: '/get-involved#partner' } },
          ],
        },
        { link: { type: 'custom', label: 'Contact', url: '/contact' } },
        { link: { type: 'custom', label: 'Donate', url: '/donate' }, highlight: true },
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'footer',
    context,
    data: {
      columns: [
        {
          title: 'Explore',
          links: [
            { link: { type: 'reference', label: 'About us', reference: { relationTo: 'pages', value: aboutPage.id } } },
            { link: { type: 'reference', label: 'Trustees & staff', reference: { relationTo: 'pages', value: trusteesPage.id } } },
            { link: { type: 'custom', label: 'Our activities', url: '/activities' } },
            { link: { type: 'custom', label: 'Reports & documents', url: '/documents' } },
            { link: { type: 'custom', label: 'FAQs', url: '/faqs' } },
          ],
        },
        {
          title: 'Get involved',
          links: [
            { link: { type: 'custom', label: 'Volunteer', url: '/get-involved' } },
            { link: { type: 'custom', label: 'Donate', url: '/donate' } },
            { link: { type: 'custom', label: 'Work with us', url: '/jobs' } },
            { link: { type: 'custom', label: 'Current appeals', url: '/appeals' } },
          ],
        },
      ],
      legalLinks: [
        { link: { type: 'custom', label: 'Privacy policy', url: '/privacy-policy' } },
        { link: { type: 'custom', label: 'Cookie policy', url: '/cookie-policy' } },
        { link: { type: 'custom', label: 'Safeguarding', url: '/safeguarding' } },
        { link: { type: 'custom', label: 'Accessibility', url: '/accessibility' } },
        { link: { type: 'custom', label: 'Complaints', url: '/complaints' } },
      ],
      newsletterEnabled: true,
      newsletterHeading: 'Stay in the loop',
    },
  })

  payload.logger.info(
    `Seeded ✔ — demo sign-ins: admin@bballiance.org.uk / editor@… / contributor@… (password: ${password})`,
  )
  payload.logger.info('Every invented fact is marked [PLACEHOLDER — replace].')

  // Quiet "unused" warnings for values kept for future seed phases.
  void contactForm
  void volunteerForm
  void projectIds
  void newsIds
  void homePage
  void req
}
