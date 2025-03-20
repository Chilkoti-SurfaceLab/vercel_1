import { type ChangeEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FileUploadProps {
  onFileSelect: (file: File) => void
}

export default function FileUpload({ onFileSelect }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFileName(file.name)
      onFileSelect(file)
    }
  }

  return (
    <div className="space-y-2">
      <Input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="file-upload" />
      <Button asChild className="w-full">
        <label htmlFor="file-upload">Select Image</label>
      </Button>
      {fileName && <p className="text-sm mt-2">Selected file: {fileName}</p>}
    </div>
  )
}

