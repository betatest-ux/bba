import { Facebook, Instagram, Linkedin, MessageCircle, Music2, Twitter, Youtube } from 'lucide-react'
import React from 'react'

export type SocialPlatform =
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'tiktok'
  | 'whatsapp'
  | 'x'
  | 'youtube'

const icons: Record<SocialPlatform, React.ComponentType<{ 'aria-hidden'?: boolean; size?: number }>> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  tiktok: Music2,
  whatsapp: MessageCircle,
  x: Twitter,
  youtube: Youtube,
}

/** Icon auto-matched to the platform chosen in Contact Settings. */
export const SocialIcon: React.FC<{ platform: SocialPlatform; size?: number }> = ({
  platform,
  size = 18,
}) => {
  const Icon = icons[platform] ?? MessageCircle
  return <Icon aria-hidden size={size} />
}
