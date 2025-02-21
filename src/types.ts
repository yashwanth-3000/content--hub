import { StaticImageData } from 'next/image'
import { type LucideIcon } from 'lucide-react'

export interface Company {
  id: string
  name: string
  description: string
  logoUrl: string | StaticImageData
  docsUrl: string
  icon?: LucideIcon
}

export interface CompanyCardProps {
  company: Company
}

