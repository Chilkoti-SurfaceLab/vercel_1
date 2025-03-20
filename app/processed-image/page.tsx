"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import ImageViewer from "../components/ImageViewer"
import { Button } from "@/components/ui/button"

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

export default function ProcessedImagePage() {
  const searchParams = useSearchParams()
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)
  const [circles, setCircles] = useState<Circle[]>([])
  const [clusters, setClusters] = useState<Cluster[]>([])

  useEffect(() => {
    const originalUrl = searchParams.get("originalImageUrl")
    if (originalUrl) {
      setOriginalImageUrl(originalUrl)
    }
  }, [searchParams])

  const handleCirclesChange = (newCircles: Circle[], newClusters: Cluster[]) => {
    setCircles(newCircles)
    setClusters(newClusters)
  }

  const handleFollowUpAnalysis = async () => {
    console.log("Performing follow-up analysis with circles:", circles)
    console.log("Clusters:", clusters)
    // You can send this data to your API for further processing
  }

  if (!originalImageUrl) {
    return <div>No image URL provided</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Image Analysis</h1>
      <div className="flex flex-col md:flex-row">
        <div className="md:w-3/4">
          <ImageViewer imageUrl={originalImageUrl} onCirclesChange={handleCirclesChange} />
        </div>
        <div className="md:w-1/4 md:ml-4 mt-4 md:mt-0">
          <Button onClick={handleFollowUpAnalysis} className="w-full">
            Perform Follow-up Analysis
          </Button>
        </div>
      </div>
    </div>
  )
}

