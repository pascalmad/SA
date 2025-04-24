"use client"

import { useEffect, useState } from "react"
import { motion, useAnimation } from "framer-motion"
import { useInView } from "react-intersection-observer"

interface CounterAnimationProps {
  end: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
}

export function CounterAnimation({ end, duration = 2, decimals = 0, prefix = "", suffix = "" }: CounterAnimationProps) {
  const [count, setCount] = useState(0)
  const controls = useAnimation()
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  useEffect(() => {
    if (inView) {
      let startTime: number
      let animationFrameId: number

      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
        setCount(progress * end)

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step)
        }
      }

      animationFrameId = requestAnimationFrame(step)

      return () => cancelAnimationFrame(animationFrameId)
    }
  }, [inView, end, duration])

  return (
    <motion.span ref={ref} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </motion.span>
  )
}
