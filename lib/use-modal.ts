'use client'

import { useEffect, useRef, type RefObject } from 'react'

// 모달·사이드 메뉴 공통 동작: 열려 있는 동안 ESC로 닫기, 배경 스크롤 막기, 닫기 버튼에 포커스
export function useModal(
  open: boolean,
  onClose: () => void,
  focusRef?: RefObject<HTMLElement | null>,
) {
  // onClose가 렌더마다 새 함수여도 효과가 다시 실행되지 않도록 ref로 보관
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    focusRef?.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, focusRef])
}
