import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...values: clsx.ClassValue[]) => {
  return twMerge(clsx(values))
}
