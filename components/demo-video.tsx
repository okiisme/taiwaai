"use client"

import { useEffect, useRef } from "react"

export function DemoVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75
    }
  }, [])

  return (
    <div className="glass rounded-2xl overflow-hidden shadow-2xl">
      <div className="relative aspect-video bg-muted">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          loop
          playsInline
          controls
          controlsList="nodownload"
        >
          <source src="/demo-video.mp4" type="video/mp4" />
          お使いのブラウザは動画タグをサポートしていません。
        </video>
      </div>
    </div>
  )
}
