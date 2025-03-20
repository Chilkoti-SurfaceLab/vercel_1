"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ParameterFormProps {
  onChange: (params: Record<string, any>) => void
}

export default function ParameterForm({ onChange }: ParameterFormProps) {
  const [params, setParams] = useState({
    scan_size: "5",
    assay: "Open Format",
    cAb_names: "cAnti-IL-6",
    blur_kernel_size: 9,
    contrast_thr: 550,
    canny_edge_thr1: 30,
    canny_edge_thr2: 20,
    dp: 0.7,
    param1: 18,
    param2: 21,
    minRadius: 7,
    maxRadius: 100,
  })

  useEffect(() => {
    onChange(params)
  }, [params, onChange])

  const handleInputChange = (name: string, value: string | number) => {
    setParams((prevParams) => ({
      ...prevParams,
      [name]: name === "cAb_names" ? value : Number(value),
    }))
  }

  const renderInput = (key: string, label: string) => {
    switch (key) {
      case "scan_size":
        return (
          <Select onValueChange={(value) => handleInputChange(key, value)} defaultValue={params[key].toString()}>
            <SelectTrigger>
              <SelectValue placeholder="Select assay scan pixel size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
            </SelectContent>
          </Select>
        )
      case "assay":
        return (
          <Select onValueChange={(value) => handleInputChange(key, value)} defaultValue={params[key]}>
            <SelectTrigger>
              <SelectValue placeholder="Select assay type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Open Format">Open Format</SelectItem>
              <SelectItem value="Microfluidic">Microfluidic</SelectItem>
            </SelectContent>
          </Select>
        )
      case "cAb_names":
        return (
          <Input
            type="text"
            id={key}
            name={key}
            value={params[key]}
            onChange={(e) => handleInputChange(key, e.target.value)}
          />
        )
      case "blur_kernel_size":
        return (
          <Input
            type="number"
            id={key}
            name={key}
            value={params[key]}
            onChange={(e) =>
              handleInputChange(key, Math.max(1, Math.min(999, Number.parseInt(e.target.value))) * 2 - 1)
            }
            min={1}
            max={999}
            step={2}
          />
        )
      case "contrast_thr":
        return (
          <Input
            type="number"
            id={key}
            name={key}
            value={params[key]}
            onChange={(e) => handleInputChange(key, e.target.value)}
            min={0}
            max={65000}
          />
        )
      case "canny_edge_thr1":
      case "canny_edge_thr2":
      case "dp":
      case "param1":
      case "param2":
        return (
          <Input
            type="number"
            id={key}
            name={key}
            value={params[key]}
            onChange={(e) => handleInputChange(key, e.target.value)}
            min={0}
            max={1000}
            step={0.1}
          />
        )
      case "minRadius":
        return (
          <Input
            type="number"
            id={key}
            name={key}
            value={params[key]}
            onChange={(e) => handleInputChange(key, e.target.value)}
            min={1}
            max={100}
          />
        )
      case "maxRadius":
        return (
          <Input
            type="number"
            id={key}
            name={key}
            value={params[key]}
            onChange={(e) => handleInputChange(key, e.target.value)}
            min={100}
            max={500}
          />
        )
      default:
        return null
    }
  }

  const labelMap: Record<string, string> = {
    scan_size: "Assay Scan Pixel Size",
    assay: "Assay Type",
    cAb_names: "cAb Names",
    blur_kernel_size: "Blur Kernel Size",
    contrast_thr: "Contrast Threshold",
    canny_edge_thr1: "Canny Edge Threshold 1",
    canny_edge_thr2: "Canny Edge Threshold 2",
    dp: "DP",
    param1: "Parameter 1",
    param2: "Parameter 2",
    minRadius: "Minimum Radius",
    maxRadius: "Maximum Radius",
  }

  return (
    <div className="space-y-4">
      {Object.entries(params).map(([key, value]) => (
        <div key={key} className="space-y-2">
          <Label htmlFor={key}>{labelMap[key]}</Label>
          {renderInput(key, labelMap[key])}
        </div>
      ))}
    </div>
  )
}

