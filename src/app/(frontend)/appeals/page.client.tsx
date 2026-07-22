'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

const PageClient: React.FC = () => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('light')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <React.Fragment />
}

export default PageClient
