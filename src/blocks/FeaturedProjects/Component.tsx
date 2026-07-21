import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import type { FeaturedProjectsBlock as FeaturedProjectsBlockProps, Project } from '@/payload-types'

import { Media } from '@/components/Media'
import { Reveal } from '@/components/Motion/Reveal'

export const FeaturedProjectsBlock: React.FC<FeaturedProjectsBlockProps> = async ({
  category,
  heading,
  limit,
  populateBy,
  projects: selected,
}) => {
  let projects: Project[] = []

  if (populateBy === 'selection' && selected?.length) {
    projects = selected.filter((project): project is Project => typeof project === 'object')
  } else {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'projects',
      depth: 1,
      limit: limit ?? 3,
      overrideAccess: false,
      sort: '-publishedAt',
      where: {
        _status: { equals: 'published' },
        ...(category
          ? { categories: { in: [typeof category === 'object' ? category.id : category] } }
          : {}),
      },
    })
    projects = result.docs
  }

  if (projects.length === 0) return null

  return (
    <section className="py-14 md:py-20">
      <div className="container">
        <Reveal>
          <div className="mb-10 flex items-end justify-between gap-4">
            <h2 className="text-h2">{heading || 'What we do'}</h2>
            <Link className="font-medium text-brand hover:underline" href="/activities">
              All activities →
            </Link>
          </div>
        </Reveal>
        <ul className="grid gap-6 md:grid-cols-3 list-none p-0">
          {projects.map((project, index) => (
            <Reveal as="li" delay={index * 0.07} key={project.id}>
              <Link
                className="thread-top group block h-full overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
                href={`/activities/${project.slug}`}
              >
                {project.coverImage && typeof project.coverImage === 'object' ? (
                  <Media
                    imgClassName="aspect-3/2 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    resource={project.coverImage}
                    size="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="aspect-3/2 w-full bg-loom" />
                )}
                <div className="p-5">
                  <div className="flex flex-wrap gap-2">
                    {(project.categories || []).map(
                      (projectCategory) =>
                        typeof projectCategory === 'object' && (
                          <span
                            className="rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-foreground"
                            key={projectCategory.id}
                          >
                            {projectCategory.title}
                          </span>
                        ),
                    )}
                  </div>
                  <h3 className="mt-3 text-h3 group-hover:underline">{project.title}</h3>
                  {project.summary && (
                    <p className="mt-2 line-clamp-3 text-muted-foreground">{project.summary}</p>
                  )}
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
