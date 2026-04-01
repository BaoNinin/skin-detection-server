import { View } from '@tarojs/components'
import { useState, ReactNode } from 'react'

interface SwipeProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
  className?: string
}

export default function Swipe({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  className = ''
}: SwipeProps) {
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchEndX, setTouchEndX] = useState(0)

  const handleTouchStart = (e: any) => {
    setTouchStartX(e.touches[0].clientX)
    setTouchEndX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: any) => {
    setTouchEndX(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    const diffX = touchEndX - touchStartX

    // 左滑（从右向左）
    if (diffX < -threshold && onSwipeLeft) {
      onSwipeLeft()
    }

    // 右滑（从左向右）
    if (diffX > threshold && onSwipeRight) {
      onSwipeRight()
    }
  }

  return (
    <View
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </View>
  )
}
