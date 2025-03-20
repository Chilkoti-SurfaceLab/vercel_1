"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface Circle {
  x: number
  y: number
  id: string
  radius: number
}

interface Cluster {
  id: string
  circles: Circle[]
  name: string
}

interface ImageViewerProps {
  imageUrl: string
  onCirclesChange: (circles: Circle[], clusters: Cluster[]) => void
}

export default function ImageViewer({ imageUrl, onCirclesChange }: ImageViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [circles, setCircles] = useState<Circle[]>([])
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const [selectedCircles, setSelectedCircles] = useState<Set<string>>(new Set())
  const [isShiftPressed, setIsShiftPressed] = useState(false)
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null)
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.src = imageUrl
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      drawCirclesAndClusters()
    }
  }, [imageUrl])

  useEffect(() => {
    onCirclesChange(circles, clusters)
  }, [circles, clusters, onCirclesChange])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsShiftPressed(true)
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsShiftPressed(false)
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  const drawCirclesAndClusters = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.translate(offset.x, offset.y)
    ctx.scale(scale, scale)

    const img = new Image()
    img.src = imageUrl
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    circles.forEach((circle) => {
      ctx.beginPath()
      ctx.arc(circle.x, circle.y, Math.max(circle.radius, 1 / scale), 0, 2 * Math.PI)
      ctx.strokeStyle = selectedCircles.has(circle.id) ? "red" : "yellow"
      ctx.lineWidth = 2 / scale
      ctx.stroke()

      // Fill the circle with a semi-transparent color
      ctx.fillStyle = selectedCircles.has(circle.id) ? "rgba(255, 0, 0, 0.2)" : "rgba(255, 255, 0, 0.2)"
      ctx.fill()
    })

    clusters.forEach((cluster) => {
      if (cluster.circles.length > 1) {
        ctx.beginPath()
        ctx.moveTo(cluster.circles[0].x, cluster.circles[0].y)

        cluster.circles.slice(1).forEach((circle) => {
          ctx.lineTo(circle.x, circle.y)
        })
        ctx.closePath()
        ctx.strokeStyle = "blue"
        ctx.lineWidth = 2 / scale
        ctx.stroke()

        // Draw cluster name
        const centerX = cluster.circles.reduce((sum, c) => sum + c.x, 0) / cluster.circles.length
        const centerY = cluster.circles.reduce((sum, c) => sum + c.y, 0) / cluster.circles.length
        ctx.fillStyle = "blue"
        ctx.font = `${12 / scale}px Arial`
        ctx.fillText(cluster.name, centerX, centerY)
      }
    })

    ctx.restore()
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left - offset.x) / scale
    const y = (event.clientY - rect.top - offset.y) / scale

    const clickedCircleIndex = circles.findIndex(
      (circle) => Math.sqrt((circle.x - x) ** 2 + (circle.y - y) ** 2) <= circle.radius,
    )

    if (clickedCircleIndex !== -1) {
      const clickedCircle = circles[clickedCircleIndex]
      if (isShiftPressed) {
        setSelectedCircles((prev) => {
          const newSet = new Set(prev)
          if (newSet.has(clickedCircle.id)) {
            newSet.delete(clickedCircle.id)
          } else {
            newSet.add(clickedCircle.id)
          }
          return newSet
        })
      } else {
        setSelectedCircles(new Set([clickedCircle.id]))
        setSelectedCircle(clickedCircle)
      }
    } else {
      const newCircle: Circle = { x, y, id: Date.now().toString(), radius: 5 }
      setCircles([...circles, newCircle])
      if (!isShiftPressed) {
        setSelectedCircles(new Set([newCircle.id]))
        setSelectedCircle(newCircle)
      }
    }
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left - offset.x) / scale
    const y = (event.clientY - rect.top - offset.y) / scale

    const clickedCircleIndex = circles.findIndex(
      (circle) => Math.sqrt((circle.x - x) ** 2 + (circle.y - y) ** 2) <= circle.radius,
    )

    if (clickedCircleIndex !== -1) {
      setDraggingIndex(clickedCircleIndex)
    } else {
      setIsDragging(true)
      setDragStart({ x: event.clientX, y: event.clientY })
    }
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingIndex !== null) {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = (event.clientX - rect.left - offset.x) / scale
      const y = (event.clientY - rect.top - offset.y) / scale

      const newCircles = [...circles]
      newCircles[draggingIndex] = { ...newCircles[draggingIndex], x, y }
      setCircles(newCircles)
    } else if (isDragging) {
      const dx = event.clientX - dragStart.x
      const dy = event.clientY - dragStart.y
      setOffset({ x: offset.x + dx, y: offset.y + dy })
      setDragStart({ x: event.clientX, y: event.clientY })
    }
  }

  const handleMouseUp = () => {
    setDraggingIndex(null)
    setIsDragging(false)
  }

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault()
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1
    setScale(scale * zoomFactor)
  }

  const deleteSelectedCircles = () => {
    setCircles(circles.filter((circle) => !selectedCircles.has(circle.id)))
    setClusters(
      clusters.map((cluster) => ({
        ...cluster,
        circles: cluster.circles.filter((circle) => !selectedCircles.has(circle.id)),
      })),
    )
    setSelectedCircles(new Set())
    setSelectedCircle(null)
  }

  const createCluster = () => {
    if (selectedCircles.size < 2) return

    const newCluster: Cluster = {
      id: Date.now().toString(),
      circles: circles.filter((circle) => selectedCircles.has(circle.id)),
      name: `Cluster ${clusters.length + 1}`,
    }

    setClusters([...clusters, newCluster])
    setSelectedCircles(new Set())
    setSelectedCluster(newCluster)
  }

  const handleCircleRadiusChange = (value: number[]) => {
    if (selectedCircle) {
      const newCircles = circles.map((circle) =>
        circle.id === selectedCircle.id ? { ...circle, radius: value[0] } : circle,
      )
      setCircles(newCircles)
      setSelectedCircle({ ...selectedCircle, radius: value[0] })
    }
  }

  const handleClusterNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedCluster) {
      const newClusters = clusters.map((cluster) =>
        cluster.id === selectedCluster.id ? { ...cluster, name: event.target.value } : cluster,
      )
      setClusters(newClusters)
      setSelectedCluster({ ...selectedCluster, name: event.target.value })
    }
  }

  useEffect(() => {
    drawCirclesAndClusters()
  }, [circles, selectedCircles, clusters, scale, offset])

  return (
    <div className="flex flex-col">
      <div className="relative">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ border: "1px solid black", cursor: "crosshair" }}
        />
        <div className="absolute bottom-2 left-2">
          <Button onClick={() => setScale(1)} className="mr-2">
            Reset Zoom
          </Button>
          <Button onClick={() => setOffset({ x: 0, y: 0 })}>Reset Pan</Button>
        </div>
      </div>
      <div className="mt-4 space-y-4">
        <div className="flex space-x-2">
          <Button onClick={deleteSelectedCircles} disabled={selectedCircles.size === 0}>
            Delete Selected
          </Button>
          <Button onClick={createCluster} disabled={selectedCircles.size < 2}>
            Create Cluster
          </Button>
        </div>
        {selectedCircle && (
          <div className="space-y-2">
            <Label htmlFor="circle-radius">Circle Radius</Label>
            <Slider
              id="circle-radius"
              min={1}
              max={50}
              step={0.5}
              value={[selectedCircle.radius]}
              onValueChange={handleCircleRadiusChange}
            />
            <div className="text-sm text-gray-500 mt-1">Current radius: {selectedCircle.radius.toFixed(1)}</div>
          </div>
        )}
        {selectedCluster && (
          <div className="space-y-2">
            <Label htmlFor="cluster-name">Cluster Name</Label>
            <Input id="cluster-name" value={selectedCluster.name} onChange={handleClusterNameChange} />
          </div>
        )}
      </div>
    </div>
  )
}

