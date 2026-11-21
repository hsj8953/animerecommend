'use client'

import { useEffect } from 'react'
import { startPwa } from '@/lib/pwa'

// 레이아웃에 한 번 넣어 두면 서비스 워커 등록과 설치 이벤트 받기를 시작한다
export function PwaStart() {
  useEffect(() => {
    startPwa()
  }, [])
  return null
}
