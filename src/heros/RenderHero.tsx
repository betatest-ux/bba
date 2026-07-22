import React from 'react'

import type { Page } from '@/payload-types'

import { HighImpactHero } from '@/heros/HighImpact'
import { LowImpactHero } from '@/heros/LowImpact'
import { MediumImpactHero } from '@/heros/MediumImpact'
import { getCachedGlobal } from '@/utilities/getGlobals'

export const RenderHero: React.FC<Page['hero']> = async (props) => {
  const { type } = props || {}

  if (!type || type === 'none') return null

  if (type === 'highImpact') {
    // The admin-selected hero style (Appearance settings) picks the layout.
    const appearance = await getCachedGlobal('appearance', 0)().catch(() => null)
    return <HighImpactHero {...props} variant={appearance?.heroStyle ?? 'weave'} />
  }

  const heroes = {
    lowImpact: LowImpactHero,
    mediumImpact: MediumImpactHero,
  }

  const HeroToRender = heroes[type]

  if (!HeroToRender) return null

  return <HeroToRender {...props} />
}
