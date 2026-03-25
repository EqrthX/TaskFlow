import React, { useState } from 'react'
import { format, subDays, startOfDay } from 'date-fns'
import { th } from 'date-fns/locale'
import { X, ChevronDown, Check, Clock } from 'lucide-react'

// 1. 🌟 เพิ่ม color ใน Interface
interface Task {
  id: number
  title: string
  isDone: boolean
  date: string
  color?: string // เพิ่มฟิลด์สี
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

  // 2. 🌟 เพิ่ม State สำหรับเก็บสีที่ถูกเลือกกรอง
  const [selectedColorFilter, setSelectedColorFilter] = useState<string | null>(null)

  const dateOptions = [
    { label: 'ทั้งหมด', value: null },
    { label: 'วันนี้', value: startOfDay(new Date()) },
    { label: 'เมื่อวาน', value: startOfDay(subDays(new Date(), 1)) },
    { label: '7 วันที่ผ่านมา', value: startOfDay(subDays(new Date(), 7)) },
    { label: '30 วันที่ผ่านมา', value: startOfDay(subDays(new Date(), 30)) },
  ]

  // ตัวเลือกสีที่คุณกำหนดไว้
  const colorOptions = [
    { hex: '#f59e0b', name: 'เหลือง (Amber)' },
    { hex: '#ef4444', name: 'แดง (ด่วน)' },
    { hex: '#3b82f6', name: 'ฟ้า (ทั่วไป)' },
    { hex: '#10b981', name: 'เขียว (สุขภาพ)' },
    { hex: '#8b5cf6', name: 'ม่วง (ส่วนตัว)' },
    { hex: '#012023', name: 'เทา (อื่นๆ)' },
  ]

  const handleDateFilter = (date: Date | null) => {
    setSelectedDateFilter(date)
    setDateOptionsOpen(false)
    onDateFilter?.(date)
  }

  // 3. 🌟 อัปเดตตรรกะการกรอง ให้เช็คทั้ง "วันที่" และ "สี"
  const filteredTasks = tasks.filter(task => {
    // เช็ควันที่
    const matchDate = selectedDateFilter
      ? new Date(task.date).toDateString() === selectedDateFilter.toDateString()
      : true;

    // เช็คสี (ถ้างานไหนไม่มีสี ให้มองว่าเป็นสี Default #f59e0b)
    const taskColor = task.color || '#f59e0b';
    const matchColor = selectedColorFilter
      ? taskColor === selectedColorFilter
      : true;

    return matchDate && matchColor;
  })

  const filteredCompleted = filteredTasks.filter(t => t.isDone)
  const filteredPending = filteredTasks.filter(t => !t.isDone)
  const percent = filteredTasks.length > 0
    ? Math.round((filteredCompleted.length / filteredTasks.length) * 100)
    : 0

  return (
    <>
      {/* Overlay (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-72 z-50 overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:sticky lg:top-0 lg:max-h-screen lg:w-64
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          background: '#fdfaf4',
          borderRight: '1px solid rgba(180,155,110,0.25)',
          boxShadow: isOpen
            ? '4px 0 32px rgba(139,109,56,0.14)'
            : '2px 0 12px rgba(139,109,56,0.08)',
        }}
      >
        <div className="h-[3px] w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 shrink-0" />
        <div className="absolute left-9 top-3 bottom-3 w-px bg-rose-300/25 pointer-events-none" />

        {/* ── Header ── */}
        <div className="px-5 pt-5 pb-4 border-b border-dashed border-amber-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[0.6rem] font-bold text-amber-600 uppercase tracking-widest mb-0.5">
                สมุดงาน
              </p>
              <h2 className="font-serif text-lg font-semibold text-stone-800">งานของฉัน</h2>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-stone-400 hover:text-stone-600 hover:bg-amber-100 p-1.5 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="bg-amber-100/50 border border-amber-200/60 rounded-lg p-3.5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-stone-500 font-medium">งานทั้งหมด</span>
              <span className="font-serif text-xl font-semibold text-stone-800">
                {filteredTasks.length}
              </span>
            </div>
            <div className="w-full bg-amber-200/60 rounded-full h-1.5 overflow-hidden mb-1.5">
              <div
                className="bg-gradient-to-r from-amber-500 to-green-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="text-[0.65rem] text-stone-400 italic font-serif">
              ความสำเร็จ {percent}%
            </p>
          </div>
        </div>

        {/* ── Date Filter ── */}
        <div className="px-5 py-3.5 border-b border-amber-200/60">
          <p className="text-[0.6rem] font-bold text-amber-600 uppercase tracking-widest mb-2">
            กรองตามวันที่
          </p>
          <div className="relative">
            <button
              onClick={() => setDateOptionsOpen(!dateOptionsOpen)}
              className="w-full flex items-center justify-between bg-amber-50/60 hover:bg-amber-100/60 border border-amber-200 rounded-lg px-3 py-2 text-sm text-stone-700 font-medium transition-colors"
            >
              <span>
                {selectedDateFilter
                  ? format(selectedDateFilter, 'dd MMM yyyy', { locale: th })
                  : 'ทั้งหมด'}
              </span>
              <ChevronDown
                size={16}
                className={`text-amber-600 transition-transform duration-200 ${dateOptionsOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {dateOptionsOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#fdfaf4] border border-amber-200 rounded-lg shadow-lg z-10 overflow-hidden"
                style={{ boxShadow: '0 4px 16px rgba(139,109,56,0.12)' }}>
                {dateOptions.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => handleDateFilter(option.value)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                      ${selectedDateFilter?.toDateString() === option.value?.toDateString()
                        ? 'bg-amber-100 text-amber-800 font-semibold'
                        : 'text-stone-600 hover:bg-amber-50'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4. 🌟 ── Color Filter (หมวดหมู่สี) ── */}
        <div className="px-5 py-3.5 border-b border-amber-200/60">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[0.6rem] font-bold text-amber-600 uppercase tracking-widest">
              กรองตามสี
            </p>
            {/* ปุ่มเคลียร์สี (จะโชว์ก็ต่อเมื่อมีการเลือกสีอยู่) */}
            {selectedColorFilter && (
              <button
                onClick={() => setSelectedColorFilter(null)}
                className="text-[0.6rem] text-stone-500 hover:text-amber-600 underline"
              >
                ดูทั้งหมด
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {colorOptions.map((c) => (
              <button
                key={c.hex}
                onClick={() => setSelectedColorFilter(selectedColorFilter === c.hex ? null : c.hex)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColorFilter === c.hex ? 'scale-125 border-stone-800 shadow-sm' : 'border-transparent hover:scale-110'
                  } ${selectedColorFilter && selectedColorFilter !== c.hex ? 'opacity-40' : 'opacity-100'}`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* ── Stats cards ── */}
        <div className="px-5 py-3.5 space-y-2.5 border-b border-amber-200/60">
          <div className="flex items-center gap-3 bg-green-50/80 border border-green-200/70 rounded-lg px-3.5 py-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow shadow-green-500/25 shrink-0">
              <Check size={15} className="text-white" />
            </div>
            <div>
              <p className="text-[0.65rem] text-stone-500 leading-none mb-0.5">เสร็จแล้ว</p>
              <p className="font-serif text-xl font-semibold text-green-700 leading-none">
                {filteredCompleted.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-amber-50/80 border border-amber-200/70 rounded-lg px-3.5 py-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow shadow-amber-500/25 shrink-0">
              <Clock size={15} className="text-white" />
            </div>
            <div>
              <p className="text-[0.65rem] text-stone-500 leading-none mb-0.5">รอดำเนิน</p>
              <p className="font-serif text-xl font-semibold text-amber-700 leading-none">
                {filteredPending.length}
              </p>
            </div>
          </div>
        </div>

        {/* ── Task list ── */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[0.6rem] font-bold text-amber-600 uppercase tracking-widest whitespace-nowrap">
              รายชื่องาน
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-amber-200 to-transparent" />
          </div>

          {filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-stone-400 italic font-serif">ไม่มีงานที่ตรงกับเงื่อนไข…</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[calc(100vh-480px)] overflow-y-auto pr-1">

              {filteredPending.length > 0 && (
                <div>
                  <p className="text-[0.6rem] font-bold text-stone-400 uppercase tracking-widest mb-2">
                    😴 รอดำเนิน ({filteredPending.length})
                  </p>
                  <div className="space-y-1.5">
                    {filteredPending.map(task => (
                      <div
                        key={task.id}
                        className="bg-[#fdfaf4] border border-amber-200/80 rounded-lg px-3 py-2.5 hover:border-amber-400/60 hover:shadow-sm transition-all flex items-start gap-2"
                      >
                        {/* จุดสีหน้าชื่องาน */}
                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: task.color || '#f59e0b' }} />
                        <div>
                          <p className="text-sm text-stone-700 line-clamp-2 leading-snug">{task.title}</p>
                          <p className="text-[0.65rem] text-stone-400 mt-0.5 italic font-serif">
                            {format(new Date(task.date), 'd MMM', { locale: th })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredCompleted.length > 0 && (
                <div>
                  <p className="text-[0.6rem] font-bold text-stone-400 uppercase tracking-widest mb-2 mt-4">
                    ✨ เสร็จแล้ว ({filteredCompleted.length})
                  </p>
                  <div className="space-y-1.5">
                    {filteredCompleted.map(task => (
                      <div
                        key={task.id}
                        className="bg-green-50/60 border border-green-200/60 rounded-lg px-3 py-2.5 opacity-70 hover:opacity-90 transition-opacity flex items-start gap-2"
                      >
                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-stone-300" />
                        <div>
                          <p className="text-sm text-stone-400 line-clamp-2 line-through leading-snug">
                            {task.title}
                          </p>
                          <p className="text-[0.65rem] text-stone-400 mt-0.5 italic font-serif">
                            {format(new Date(task.date), 'd MMM', { locale: th })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar