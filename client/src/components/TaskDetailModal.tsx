import React, { useState } from 'react'
import { X, CheckCircle, Circle, Trash2, Edit } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

interface Attachment {
  id: string
  url: string
  fileName?: string
}

interface Task {
  id: number
  title: string
  description?: string
  isDone: boolean
  date: string
  color?: string
  category?: string
  attachments: Attachment[]
}

interface TaskDetailModalProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  onTaskUpdate: (updatedTask: Task) => void
  onTaskDelete: (taskId: number) => void
  onEditClick: (task: Task) => void
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onTaskUpdate,
  onTaskDelete,
  onEditClick,
}) => {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  if (!isOpen) return null

  const handleStatusToggle = async () => {
    setIsUpdating(true)
    try {
      const updatedTask = { ...task, isDone: !task.isDone }
      await api.patch(`/tasks/update-task/${task.id}`, { isDone: !task.isDone })
      onTaskUpdate(updatedTask)
      toast.success(updatedTask.isDone ? 'ทำเครื่องหมายว่าเสร็จแล้ว' : 'ทำเครื่องหมายว่าค้างอยู่')
    } catch (error) {
      toast.error('ไม่สามารถอัปเดตสถานะได้')
      console.error('Status update failed:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/tasks/delete-task/${task.id}`)
      onTaskDelete(task.id)
      onClose()
      toast.success('ลบงานสำเร็จ')
    } catch (error) {
      toast.error('ไม่สามารถลบงานได้')
      console.error('Delete failed:', error)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#fdfaf4] w-full sm:max-w-2xl rounded-t-2xl sm:rounded-sm max-h-[92dvh] overflow-y-auto anim-up border border-amber-200/60"
        style={{ boxShadow: "0 -4px 32px rgba(139,109,56,0.14), 0 8px 40px rgba(139,109,56,0.18)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top accent */}
        <div className="h-[3px] w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 rounded-t-2xl sm:rounded-t-sm" />

        <div className="px-5 sm:px-7 py-5 sm:py-7">
          {/* Header */}
          <div className="flex justify-between items-start gap-3 mb-5">
            <div className="flex-1">
              <p className="text-[0.65rem] font-bold text-amber-600 uppercase tracking-widest mb-2">
                รายละเอียดงาน
              </p>
              <h2 className="font-serif text-lg sm:text-2xl font-semibold text-stone-800 break-words">
                {task.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 hover:bg-amber-100 p-1 rounded-lg transition-colors shrink-0"
            >
              <X size={24} />
            </button>
          </div>

          {/* Status Section */}
          <div className="mb-6 pb-6 border-b border-dashed border-amber-200">
            <button
              onClick={handleStatusToggle}
              disabled={isUpdating}
              className="flex items-center gap-3 p-4 w-full rounded-lg bg-amber-50/70 border border-amber-200/60 hover:bg-amber-100/50 hover:border-amber-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {task.isDone ? (
                <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
              ) : (
                <Circle className="w-6 h-6 text-amber-600 shrink-0 group-hover:text-amber-700" />
              )}
              <div className="flex-1 text-left">
                <p className="font-medium text-stone-700">
                  {task.isDone ? 'ทำเครื่องหมายว่าค้างอยู่' : 'ทำเครื่องหมายว่าเสร็จแล้ว'}
                </p>
                <p className="text-xs text-stone-500">สถานะปัจจุบัน: {task.isDone ? 'เสร็จแล้ว' : 'ค้างอยู่'}</p>
              </div>
              {isUpdating && (
                <div className="w-4 h-4 border-2 border-amber-400 border-t-amber-600 rounded-full animate-spin" />
              )}
            </button>
          </div>

          {/* Description Section */}
          {task.description && (
            <div className="mb-6 pb-6 border-b border-dashed border-amber-200">
              <h3 className="text-[0.65rem] font-bold text-stone-600 uppercase tracking-widest mb-3">
                รายละเอียด
              </h3>
              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap break-words">
                {task.description}
              </p>
            </div>
          )}

          {/* Images Section */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="mb-6 pb-6 border-b border-dashed border-amber-200">
              <h3 className="text-[0.65rem] font-bold text-stone-600 uppercase tracking-widest mb-3">
                ไฟล์แนบ ({task.attachments.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {task.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="relative group overflow-hidden rounded-lg border border-amber-200/60 bg-amber-50/30 aspect-square"
                  >
                    <img
                      src={attachment.url}
                      alt={attachment.fileName || 'Attachment'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                    {attachment.fileName && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[0.65rem] text-white truncate font-medium">
                          {attachment.fileName}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions Section */}
          <div className="flex gap-2 sm:gap-3 flex-col-reverse sm:flex-row">
            {showDeleteConfirm ? (
              // 🔴 โหมดยืนยันการลบ
              <div className="flex flex-col sm:flex-row items-center w-full gap-2 sm:gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="w-full sm:w-auto flex-1 text-center sm:text-left px-2">
                  <p className="text-sm font-bold text-rose-600">ยืนยันลบงานนี้?</p>
                  <p className="text-[0.65rem] text-rose-500">ข้อมูลจะหายไปถาวร</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 sm:flex-none px-4 py-2.5 text-sm text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg font-medium transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 sm:flex-none px-4 py-2.5 text-sm text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 rounded-lg font-bold transition-all"
                  >
                    ยืนยันลบ
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 text-sm text-rose-600 bg-rose-50/70 hover:bg-rose-100 border border-rose-200/60 hover:border-rose-300 rounded-lg font-medium transition-colors"
                >
                  <Trash2 size={16} />
                  <span>ลบงาน</span>
                </button>
                <button
                  onClick={() => {
                    onEditClick(task)
                    onClose()
                  }}
                  className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 text-sm text-amber-600 bg-amber-50/70 hover:bg-amber-100 border border-amber-200/60 hover:border-amber-400 rounded-lg font-medium transition-colors"
                >
                  <Edit size={16} />
                  <span>แก้ไข</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 text-sm bg-gradient-to-br from-amber-500 to-amber-700 text-amber-50 font-bold rounded-lg shadow-md shadow-amber-600/25 transition-all hover:-translate-y-0.5"
                >
                  ปิด
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskDetailModal
