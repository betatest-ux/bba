'use client'

import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'

import RichText from '@/components/RichText'

const CONSENT_KEY = 'bba-cookie-consent'

type ConsentState = 'accepted' | 'rejected'

type Props = {
  acceptLabel: string
  categories: { alwaysOn: boolean; description: string; key: string; label: string }[]
  gatedBodyCode: string | null
  gatedHeadCode: string | null
  heading: string
  message: DefaultTypedEditorState | null
  rejectLabel: string
}

/**
 * Injects admin-provided scripts only after consent. Injection parses the
 * HTML fragment and recreates <script> nodes (innerHTML alone won't execute
 * them), appending everything else verbatim.
 */
const injectHTML = (html: string, target: 'body' | 'head'): void => {
  const container = document.createElement('div')
  container.innerHTML = html
  const parent = target === 'head' ? document.head : document.body

  Array.from(container.childNodes).forEach((node) => {
    if (node.nodeName === 'SCRIPT') {
      const original = node as HTMLScriptElement
      const script = document.createElement('script')
      Array.from(original.attributes).forEach((attribute) =>
        script.setAttribute(attribute.name, attribute.value),
      )
      script.text = original.text
      parent.appendChild(script)
    } else {
      parent.appendChild(node)
    }
  })
}

export const CookieConsentClient: React.FC<Props> = ({
  acceptLabel,
  categories,
  gatedBodyCode,
  gatedHeadCode,
  heading,
  message,
  rejectLabel,
}) => {
  const [visible, setVisible] = useState(false)
  const [injected, setInjected] = useState(false)

  const runGatedScripts = useCallback(() => {
    if (injected) return
    if (gatedHeadCode) injectHTML(gatedHeadCode, 'head')
    if (gatedBodyCode) injectHTML(gatedBodyCode, 'body')
    setInjected(true)
  }, [gatedBodyCode, gatedHeadCode, injected])

  useEffect(() => {
    let stored: string | null = null
    try {
      stored = localStorage.getItem(CONSENT_KEY)
    } catch {
      /* storage unavailable — treat as undecided but don't crash */
    }
    if (stored === 'accepted') {
      runGatedScripts()
    } else if (stored !== 'rejected') {
      setVisible(true)
    }
  }, [runGatedScripts])

  const decide = (state: ConsentState) => {
    try {
      localStorage.setItem(CONSENT_KEY, state)
    } catch {
      /* fine */
    }
    setVisible(false)
    if (state === 'accepted') runGatedScripts()
  }

  if (!visible) return null

  return (
    <div
      aria-label="Cookie choices"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card p-4 shadow-2xl md:p-6"
      role="region"
    >
      <div className="container flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-display text-lg font-bold">{heading}</h2>
          {message ? (
            <div className="mt-1 text-sm text-muted-foreground [&_p]:m-0">
              <RichText data={message} enableGutter={false} enableProse={false} />
            </div>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              We use essential cookies to make this site work, and optional analytics cookies only
              if you say yes.
            </p>
          )}
          {categories.length > 0 && (
            <details className="mt-2 text-sm">
              <summary className="cursor-pointer font-medium text-brand">
                What each category does
              </summary>
              <ul className="mt-2 space-y-1 list-none p-0">
                {categories.map((category) => (
                  <li key={category.key}>
                    <strong>{category.label}</strong>
                    {category.alwaysOn && ' (always on)'} — {category.description}
                  </li>
                ))}
              </ul>
            </details>
          )}
          <p className="mt-2 text-sm">
            <Link className="underline" href="/cookie-policy">
              Read our cookie policy
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <button
            className="inline-flex h-11 items-center rounded-full border border-border px-6 font-medium transition-colors hover:border-foreground/40"
            onClick={() => decide('rejected')}
            type="button"
          >
            {rejectLabel}
          </button>
          <button
            className="inline-flex h-11 items-center rounded-full bg-brand px-6 font-semibold text-brand-on transition-transform duration-150 hover:scale-[1.03]"
            onClick={() => decide('accepted')}
            type="button"
          >
            {acceptLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
