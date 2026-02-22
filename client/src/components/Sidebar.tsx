import React, { useState } from 'react'
import { format, subDays, startOfDay } from 'date-fns'
import { th } from 'date-fns/locale'
import { X, ChevronDown, Check, Clock } from 'lucide-react'

interface Task {
  id: number
  title: string
  isDone: boolean
  date: string
}

interface SidebarProps {
  tasks: Task[]
  isOpen: boolean
  onClose: () => void
  onDateFilter?: (date: Date | null) => void
}

const Sidebar: React.FC<SidebarProps> = ({ tasks, isOpen, onClose, onDateFilter }) => {
  const [selectedDateFilter, setSelectedDateFilter] = useState<Date | null>(null)
  const [dateOptionsOpen, setDateOptionsOpen] = useState(false)

  // ตัวเลือกวันที่สำหรับกรอง
  const dateOptions = [
    { label: 'ทั้งหมด', value: null },
    { label: 'วันนี้', value: startOfDay(new Date()) },
    { label: 'เมื่อวาน', value: startOfDay(subDays(new Date(), 1)) },
    { label: '7 วันที่ผ่านมา', value: startOfDay(subDays(new Date(), 7)) },
    { label: '30 วันที่ผ่านมา', value: startOfDay(subDays(new Date(), 30)) },
  ]

  const handleDateFilter = (date: Date | null) => {
    setSelectedDateFilter(date)
    setDateOptionsOpen(false)
    onDateFilter?.(date)
  }

  // กรองงานตามวันที่ถ้ามี
  const filteredTasks = selectedDateFilter
    ? tasks.filter(task => {
        const taskDate = new Date(task.date).toDateString()
        return taskDate === selectedDateFilter.toDateString()
      })
    : tasks

  const filteredCompleted = filteredTasks.filter(t => t.isDone)
  const filteredPending = filteredTasks.filter(t => !t.isDone)

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-80 bg-white shadow-lg transform transition-transform duration-300 z-50 overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:sticky lg:top-0 lg:max-h-screen lg:w-72`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">งานของฉัน</h2>
            <button
              onClick={onClose}
              className="lg:hidden text-white hover:bg-blue-800 p-1 rounded"
            >
              <X size={24} />
            </button>
          </div>

          {/* Stats Card */}
          <div className="bg-blue-50/20 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium opacity-90">งานทั้งหมด</span>
              <span className="text-2xl font-bold">{filteredTasks.length}</span>
            </div>
            <div className="w-full bg-blue-900/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-green-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${filteredTasks.length > 0 ? (filteredCompleted.length / filteredTasks.length) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span>ความสำเร็จ: {filteredTasks.length > 0 ? Math.round((filteredCompleted.length / filteredTasks.length) * 100) : 0}%</span>
            </div>
          </div>
        </div>

        {/* Date Filter */}
        <div className="p-4 border-b">
          <div className="relative">
            <button
              onClick={() => setDateOptionsOpen(!dateOptionsOpen)}
              className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 border rounded-lg p-3 text-sm font-medium text-gray-700 transition"
            >
              <span>
                {selectedDateFilter
                  ? format(selectedDateFilter, 'dd MMM yyyy', { locale: th })
                  : 'ทั้งหมด'}
              </span>
              <ChevronDown size={18} className={`transition-transform ${dateOptionsOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Date Options Dropdown */}
            {dateOptionsOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-10">
                {dateOptions.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => handleDateFilter(option.value)}
                    className={`w-full text-left px-4 py-2 text-sm transition ${
                      selectedDateFilter?.toDateString() === option.value?.toDateString()
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Task Statistics */}
        <div className="p-4 space-y-3 border-b">
          {/* Completed Tasks */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-500 rounded-full p-2">
                <Check size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">เสร็จแล้ว</p>
                <p className="text-2xl font-bold text-green-600">{filteredCompleted.length}</p>
              </div>
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-amber-500 rounded-full p-2">
                <Clock size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">รอดำเนิน</p>
                <p className="text-2xl font-bold text-amber-600">{filteredPending.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="p-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">รายชื่องาน</h3>

          {filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">ไม่มีงานในช่วงเวลานี้</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredPending.length > 0 && (
                <>
                  <p className="text-xs font-medium text-gray-500 mt-3 mb-2">😴 รอดำเนิน ({filteredPending.length})</p>
                  {filteredPending.map(task => (
                    <div
                      key={task.id}
                      className="bg-white border border-amber-200 rounded-lg p-3 hover:shadow-md transition"
                    >
                      <p className="text-sm text-gray-800 line-clamp-2">{task.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(task.date), 'd MMM', { locale: th })}
                      </p>
                    </div>
                  ))}
                </>
              )}

              {filteredCompleted.length > 0 && (
                <>
                  <p className="text-xs font-medium text-gray-500 mt-4 mb-2">✨ เสร็จแล้ว ({filteredCompleted.length})</p>
                  {filteredCompleted.map(task => (
                    <div
                      key={task.id}
                      className="bg-white border border-green-200 rounded-lg p-3 hover:shadow-md transition opacity-70"
                    >
                      <p className="text-sm text-gray-500 line-clamp-2 line-through">{task.title}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(task.date), 'd MMM', { locale: th })}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
