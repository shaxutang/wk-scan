import { WkrcType } from '@/main/wkrc'
import { RCode } from '@/utils/R'
import { useEffect, useState } from 'react'

export const useWkrc = () => {
  const [wkrc, setWkrc] = useState<WkrcType>({})

  useEffect(() => {
    window.electron.getWkrc().then((res) => {
      const { code, data } = res
      if (code === RCode.SUCCESS) {
        setWkrc(data)
      }
    })
  }, [])

  return wkrc
}
