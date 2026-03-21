import React, { useState, useRef } from 'react'
import { Upload, X, FileIcon } from 'lucide-react'

interface FileUploadProps {
  files: File[]
  onFilesChange: (files: File[]) => void
}

const FileUpload: React.FC<FileUploadProps> = ({ files, onFilesChange }) => {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (newFiles: File[]) => {
    const updatedFiles = [...files, ...newFiles]
    onFilesChange(updatedFiles)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    onFilesChange(updatedFiles)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-4 cursor-pointer transition-all
          ${dragActive
            ? 'border-amber-500 bg-amber-50/50'
            : 'border-amber-200 bg-amber-50/30 hover:border-amber-400 hover:bg-amber-50/50'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleChange}
          className="hidden"
          accept="*"
        />
        <div className="flex flex-col items-center justify-center py-4 gap-2">
          <Upload size={24} className="text-amber-600" />
          <div className="text-center">
            <p className="text-sm font-semibold text-stone-700">
              ลากไฟล์มาวาง หรือคลิกเพื่อเลือก
            </p>
            <p className="text-xs text-stone-500 mt-0.5">
              รองรับไฟล์ทุกประเภท
            </p>
          </div>
        </div>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-stone-700">
            ไฟล์ที่เลือก ({files.length})
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-2.5 bg-white border border-amber-200 rounded-lg hover:bg-amber-50/50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FileIcon size={16} className="text-amber-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-stone-700 truncate">
                      {file.name}
                    </p>
                    <p className="text-[0.65rem] text-stone-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                  className="p-1 hover:bg-rose-100 rounded-lg text-rose-600 transition-colors shrink-0 ml-2"
                  type="button"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUpload
