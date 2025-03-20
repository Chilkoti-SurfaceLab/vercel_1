"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import FileUpload from "./components/FileUpload"
import ParameterForm from "./components/ParameterForm"
import ImageViewer from "./components/ImageViewer"

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

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [parameters, setParameters] = useState({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [circles, setCircles] = useState<Circle[]>([])
  const [clusters, setClusters] = useState<Cluster[]>([])

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setImageUrl(url)
  }

  const handleParameterChange = (params: Record<string, any>) => {
    setParameters(params)
  }

  const handleCirclesChange = (newCircles: Circle[], newClusters: Cluster[]) => {
    setCircles(newCircles)
    setClusters(newClusters)
  }

  const handleSubmit = async () => {
    if (!selectedFile || Object.keys(parameters).length === 0) {
      alert("Please select a file and fill in all parameters")
      return
    }

    setIsProcessing(true)

    const formData = new FormData()
    formData.append("image", selectedFile)
    formData.append("parameters", JSON.stringify(parameters))

    try {
      const response = await fetch("/api/process-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Image processing failed")
      }

      const data = await response.json()
      console.log("Processing complete:", data)
      // You can update the UI here based on the processing results if needed
    } catch (error) {
      console.error("Error:", error)
      alert("An error occurred while processing the image")
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePlaceholderClick = () => {
    document.getElementById("file-upload")?.click()
  }

  return (
    <main className="container mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center">D4Scope Image Analysis Web App</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/3">
              <ParameterForm onChange={handleParameterChange} />
              <div className="mt-4">
                <FileUpload onFileSelect={handleFileSelect} />
              </div>
              {selectedFile && (
                <Button onClick={handleSubmit} disabled={isProcessing} className="w-full mt-4">
                  {isProcessing ? "Processing..." : "Process Image"}
                </Button>
              )}
            </div>
            <div className="md:w-2/3">
              {imageUrl ? (
                <ImageViewer imageUrl={imageUrl} onCirclesChange={handleCirclesChange} />
              ) : (
                <div
                  className="w-full h-96 bg-gray-200 flex items-center justify-center cursor-pointer"
                  onClick={handlePlaceholderClick}
                >
                  <p className="text-gray-500">Click to upload an image</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

