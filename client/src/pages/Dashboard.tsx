import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Sidebar from '../components/Sidebar'
import FileUpload from '../components/FileUpload'
import TaskDetailModal from '../components/TaskDetailModal'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
  parseISO, isBefore, startOfDay,
} from 'date-fns'
import toast, { Toaster } from 'react-hot-toast'
import { th } from 'date-fns/locale'
import { LogOut, ChevronLeft, ChevronRight, Plus, Trash2, X, Menu, Loader2, Edit } from 'lucide-react'

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
  attachments: Attachment[]
}

interface User {
  first_name: string
  last_name: string
}

const Dashboard = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [taskFiles, setTaskFiles] = useState<File[]>([])
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(null)

  const openEditModal = (task: Task) => {
    setSelectedTaskDetail(null)
    setEditingTask(task)
    setEditTitle(task.title)
    setEditDescription(task.description || '')
  }

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask || !editTitle.trim()) return
    try {
      await api.patch(`/tasks/update-task-content/${editingTask.id}`, {
        title: editTitle,
        description: editDescription,
      })
      setTasks(tasks.map(t =>
        t.id === editingTask.id ? { ...t, title: editTitle, description: editDescription } : t
      ))
      toast.success('แก้ไขงานสำเร็จ!')
      setEditingTask(null)
    } catch (error: any) {
      toast.error('แก้ไขไม่สำเร็จ')
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) setUser(JSON.parse(storedUser))
        const res = await api.get('/tasks/show-tasks')
        setTasks(res.data.tasks || [])
      } catch (e) {
        console.error('Fetch error', e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
      localStorage.clear()
      navigate('/login')
    } catch {
      localStorage.clear()
      navigate('/login')
    }
  }

  const onDateClick = (day: Date) => {
    setSelectedDate(day)
    setIsModalOpen(true)
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim() || !selectedDate || !newTaskDescription.trim()) return
    if (isBefore(startOfDay(selectedDate), startOfDay(new Date()))) {
      toast.error('ไม่สามารถเพิ่มงานในวันที่ผ่านมาแล้ว')
      return
    }
    try {
      const formData = new FormData()
      formData.append('title', newTaskTitle)
      formData.append('description', newTaskDescription)
      formData.append('date', selectedDate.toISOString())

      taskFiles.forEach((file) => {
        formData.append('images', file)
      })

      const res = await api.post('/tasks/add-tasks', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      setTasks([...tasks, res.data.data])
      setNewTaskTitle('')
      setNewTaskDescription('')
      setTaskFiles([])
      setIsModalOpen(false)
      toast.success('เพิ่มงานสำเร็จ!')
    } catch {
      toast.error('เพิ่มงานไม่สำเร็จ')
    }
  }

  const toggleTask = async (task: Task) => {
    try {
      setTasks(tasks.map(t => t.id === task.id ? { ...t, isDone: !t.isDone } : t))
      await api.patch(`/tasks/update-task/${task.id}`, { isDone: !task.isDone })
    } catch {
      console.error('Update failed')
    }
  }

  const deleteTask = async (id: number) => {
    if (!confirm('ลบงานนี้?')) return
    try {
      setTasks(tasks.filter(t => t.id !== id))
      await api.delete(`/tasks/delete-task/${id}`)
      toast.success('ลบงานสำเร็จ!')
    } catch {
      toast.error('ลบไม่สำเร็จ กรุณาลองใหม่')
    }
  }

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t))
  }

  const handleTaskDelete = (taskId: number) => {
    setTasks(tasks.filter(t => t.id !== taskId))
  }

  // ── Calendar ──────────────────────────────────────────────
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

    return (
      <div className="grid grid-cols-7 gap-0">
        {/* Day headers */}
        {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map((dayName) => (
          <div
            key={dayName}
            className="p-1 sm:p-3 text-center font-bold bg-amber-100/60 border-r border-b border-amber-200 text-amber-800 text-[0.65rem] sm:text-xs uppercase tracking-wide"
          >
            {dayName}
          </div>
        ))}

        {/* Day cells */}
        {calendarDays.map((dayItem, idx) => {
          const dayTasks = tasks.filter(task => isSameDay(parseISO(task.date), dayItem))
          const isToday = isSameDay(dayItem, new Date())
          const isCurrentMonth = isSameMonth(dayItem, monthStart)
          const isPastDate = isBefore(startOfDay(dayItem), startOfDay(new Date()))

          return (
            <div
              key={idx}
              onClick={() => onDateClick(dayItem)}
              className={`
                h-20 sm:h-36 md:h-44 p-1 sm:p-2 border-r border-b border-amber-200/70
                relative group cursor-pointer flex flex-col transition-colors
                ${!isCurrentMonth ? 'bg-amber-50/30' : 'bg-[#fdfaf4]'}
                ${isToday ? 'bg-amber-100/50' : ''}
                ${isPastDate ? 'bg-stone-100/50 opacity-50' : 'hover:bg-amber-100/40'}
              `}
            >
              {/* Date number */}
              <div className="flex justify-between items-start mb-0.5 sm:mb-1">
                <span className={`
                  text-[0.65rem] sm:text-sm font-semibold w-5 h-5 sm:w-7 sm:h-7
                  flex items-center justify-center rounded-full transition-colors
                  ${isToday ? 'bg-amber-600 text-amber-50' : isCurrentMonth ? 'text-stone-700' : 'text-stone-300'}
                `}>
                  {format(dayItem, 'd')}
                </span>
                <button className={`opacity-0 group-hover:opacity-100 rounded-full p-0.5 hidden sm:flex transition-opacity ${isPastDate ? 'text-stone-300' : 'text-amber-600 hover:bg-amber-200/60'
                  }`}>
                  <Plus size={12} />
                </button>
              </div>

              {/* Task chips */}
              <div className="space-y-0.5 flex-1 overflow-hidden">
                {dayTasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedTaskDetail(task) }}
                    className={`
                      text-[0.55rem] sm:text-[0.65rem] px-1 sm:px-1.5 py-0.5 rounded
                      truncate flex items-center gap-1 transition-all cursor-pointer
                      ${task.isDone
                        ? 'bg-green-100 text-green-700 line-through border border-green-200'
                        : 'bg-white text-stone-600 border border-amber-200 shadow-sm hover:border-amber-400'}
                    `}
                  >
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${task.isDone ? 'bg-green-500' : 'bg-amber-500'}`} />
                    <span className="truncate">{task.title}</span>
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <span className="text-[0.55rem] sm:text-[0.6rem] text-amber-700 font-semibold pl-0.5">
                    +{dayTasks.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen min-h-dvh bg-amber-50 flex flex-col items-center justify-center"
        style={{ backgroundImage: "radial-gradient(ellipse at 30% 50%, rgba(210,180,140,0.2) 0%, transparent 60%)" }}>
        <div className="w-12 h-12 mb-4 bg-linear-to-br from-amber-400 to-amber-700 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-amber-600/25 animate-pulse">
          📝
        </div>
        <Loader2 className="w-6 h-6 text-amber-600 animate-spin mb-3" />
        <p className="text-sm text-stone-500 italic font-serif">กำลังโหลดข้อมูล…</p>
      </div>
    )
  }

  // ── Shared input styles ────────────────────────────────────
  const inputClass = "w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-amber-50/60 border border-amber-200 rounded-lg text-sm text-stone-800 placeholder:text-stone-300 placeholder:italic outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 focus:bg-white"
  const labelClass = "block text-[0.65rem] font-bold text-stone-400 uppercase tracking-widest mb-1 sm:mb-1.5"

  return (
    <div
      className="min-h-screen min-h-dvh flex"
      style={{
        backgroundColor: '#f5f0e8',
        backgroundImage: "radial-gradient(ellipse at 20% 50%, rgba(210,180,140,0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(188,164,130,0.12) 0%, transparent 50%)",
      }}
    >
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes shake  { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-5px)} 40%,80%{transform:translateX(5px)} }
        .anim-up { animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      {/* Sidebar */}
      <Sidebar tasks={tasks} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Navbar ── */}
        <nav className="bg-[#fdfaf4] border-b border-amber-200/80 px-4 sm:px-6 py-3 flex justify-between items-center sticky top-0 z-20"
          style={{ boxShadow: "0 2px 12px rgba(139,109,56,0.08)" }}>

          {/* Left: hamburger + brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-amber-100 rounded-lg text-stone-600 transition-colors"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-400 to-amber-700 rounded-lg flex items-center justify-center text-sm shadow shadow-amber-600/25">
                📝
              </div>
              <h1 className="font-serif text-base sm:text-lg font-semibold text-stone-800 tracking-tight">
                TaskFlow
              </h1>
            </div>
          </div>

          {/* Right: username + logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user && (
              <span className="hidden sm:block text-xs sm:text-sm text-stone-500 font-medium">
                {user.first_name} {user.last_name}
              </span>
            )}
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-all font-medium"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </nav>

        {/* ── Main ── */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-5 md:px-6 py-5 sm:py-7">

          {/* Calendar header */}
          <div
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-0 px-3 sm:px-5 py-3 sm:py-4 rounded-t-lg border border-b-0 border-amber-200/80 bg-[#fdfaf4]"
            style={{ boxShadow: "0 2px 8px rgba(139,109,56,0.06)" }}
          >
            {/* Month nav */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <h2 className="font-serif text-base sm:text-xl font-semibold text-stone-800 flex-1 sm:flex-none capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: th })}
              </h2>
              <div className="flex gap-1">
                <button
                  onClick={prevMonth}
                  className="p-1.5 hover:bg-amber-100 rounded-lg text-stone-500 hover:text-amber-700 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 hover:bg-amber-100 rounded-lg text-stone-500 hover:text-amber-700 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Add task button */}
            <button
              onClick={() => { setSelectedDate(new Date()); setIsModalOpen(true) }}
              className="flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto px-4 py-2 bg-gradient-to-br from-amber-500 to-amber-700 text-amber-50 text-sm font-bold rounded-lg shadow-md shadow-amber-600/25 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-600/35 active:translate-y-0"
            >
              <Plus size={16} />
              <span>สร้างงานวันนี้</span>
            </button>
          </div>

          {/* Calendar grid */}
          <div
            className="rounded-b-lg border border-amber-200/80 overflow-hidden"
            style={{ boxShadow: "0 4px 20px rgba(139,109,56,0.08)" }}
          >
            {renderCalendar()}
          </div>
        </main>
      </div>

      {/* ── Logout Modal ── */}
      {isLogoutModalOpen && (
        <div
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsLogoutModalOpen(false)}
        >
          <div
            className="bg-[#fdfaf4] rounded-sm w-full max-w-sm p-6 sm:p-8 text-center anim-up border border-amber-200/60"
            style={{ boxShadow: "0 8px 40px rgba(139,109,56,0.18)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="h-[3px] w-full bg-gradient-to-r from-rose-400 via-rose-300 to-rose-400 rounded-t-sm -mt-6 sm:-mt-8 mb-6 sm:mb-8 -mx-6 sm:-mx-8 px-6 sm:px-8" />
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="text-rose-500" size={22} />
            </div>
            <h3 className="font-serif text-lg font-semibold text-stone-800 mb-2">ออกจากระบบ?</h3>
            <p className="text-sm text-stone-400 italic font-serif mb-6">คุณต้องการออกจาก TaskFlow ใช่หรือไม่?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2.5 text-sm text-stone-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg font-medium transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 text-sm bg-gradient-to-br from-rose-500 to-rose-700 text-white rounded-lg font-bold shadow-md shadow-rose-600/25 transition-all hover:-translate-y-0.5"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Task Modal ── */}
      {isModalOpen && selectedDate && (
        <div
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-[#fdfaf4] w-full sm:max-w-lg rounded-t-2xl sm:rounded-sm max-h-[92dvh] overflow-y-auto anim-up border border-amber-200/60"
            style={{ boxShadow: "0 -4px 32px rgba(139,109,56,0.14), 0 8px 40px rgba(139,109,56,0.18)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Top accent */}
            <div className="h-[3px] w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 rounded-t-2xl sm:rounded-t-sm" />

            <div className="px-5 sm:px-7 py-5 sm:py-7">
              {/* Modal header */}
              <div className="flex justify-between items-start gap-2 mb-5">
                <div>
                  <p className="text-[0.65rem] font-bold text-amber-600 uppercase tracking-widest mb-0.5">เพิ่มงานใหม่</p>
                  <h3 className="font-serif text-base sm:text-lg font-semibold text-stone-800">
                    {format(selectedDate, 'd MMMM yyyy', { locale: th })}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    setTaskFiles([])
                  }}
                  className="text-stone-400 hover:text-stone-600 hover:bg-amber-100 p-1 rounded-lg transition-colors shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddTask} className="space-y-3 sm:space-y-4">
                <div>
                  <label className={labelClass}>ชื่องาน</label>
                  <input
                    autoFocus
                    type="text"
                    placeholder="พิมพ์ชื่อรายการงาน…"
                    className={inputClass}
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>รายละเอียด</label>
                  <textarea
                    placeholder="รายละเอียด…"
                    className={`${inputClass} resize-none`}
                    rows={3}
                    value={newTaskDescription}
                    onChange={e => setNewTaskDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>แนบไฟล์ (ทำได้หลายรูป)</label>
                  <FileUpload
                    files={taskFiles}
                    onFilesChange={setTaskFiles}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false)
                      setTaskFiles([])
                    }}
                    className="px-4 py-2 text-sm text-stone-600 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-gradient-to-br from-amber-500 to-amber-700 text-amber-50 font-bold rounded-lg shadow-md shadow-amber-600/25 transition-all hover:-translate-y-0.5"
                  >
                    บันทึก
                  </button>
                </div>
              </form>

              {/* Existing tasks for this day */}
              <div className="mt-5 pt-4 border-t border-dashed border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[0.6rem] font-bold text-amber-600 uppercase tracking-widest">งานในวันนี้</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-amber-200 to-transparent" />
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {tasks
                    .filter(t => isSameDay(parseISO(t.date), selectedDate))
                    .map(t => (
                      <div
                        key={t.id}
                        className="flex justify-between items-center text-sm p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-lg group"
                      >
                        <div
                          className="flex items-center gap-2 flex-1 cursor-pointer min-w-0"
                          onClick={() => setSelectedTaskDetail(t)}
                        >
                          <div className={`w-2 h-2 rounded-full shrink-0 ${t.isDone ? 'bg-green-500' : 'bg-amber-500'}`} />
                          <span className={`text-sm truncate ${t.isDone ? 'line-through text-stone-400' : 'text-stone-700'}`}>
                            {t.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                          <button
                            onClick={() => openEditModal(t)}
                            className="p-1 text-amber-600 hover:bg-amber-200/60 rounded transition-colors"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => deleteTask(t.id)}
                            className="p-1 text-rose-500 hover:bg-rose-100 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  {tasks.filter(t => isSameDay(parseISO(t.date), selectedDate)).length === 0 && (
                    <p className="text-xs text-stone-400 italic text-center py-2 font-serif">ยังไม่มีงานในวันนี้…</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Task Modal ── */}
      {editingTask && (
        <div
          className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4"
          onClick={() => setEditingTask(null)}
        >
          <div
            className="bg-[#fdfaf4] w-full sm:max-w-md rounded-t-2xl sm:rounded-sm anim-up border border-amber-200/60"
            style={{ boxShadow: "0 -4px 32px rgba(139,109,56,0.14), 0 8px 40px rgba(139,109,56,0.18)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="h-[3px] w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 rounded-t-2xl sm:rounded-t-sm" />

            <div className="px-5 sm:px-7 py-5 sm:py-7">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <p className="text-[0.65rem] font-bold text-amber-600 uppercase tracking-widest mb-0.5">แก้ไขงาน</p>
                  <h3 className="font-serif text-base sm:text-lg font-semibold text-stone-800">อัปเดตรายละเอียด</h3>
                </div>
                <button
                  onClick={() => setEditingTask(null)}
                  className="text-stone-400 hover:text-stone-600 hover:bg-amber-100 p-1 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEditTask} className="space-y-4">
                <div>
                  <label className={labelClass}>ชื่องาน</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>รายละเอียด</label>
                  <textarea
                    className={`${inputClass} resize-none`}
                    rows={4}
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="px-4 py-2 text-sm text-stone-600 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-gradient-to-br from-amber-500 to-amber-700 text-amber-50 font-bold rounded-lg shadow-md shadow-amber-600/25 transition-all hover:-translate-y-0.5"
                  >
                    บันทึกการแก้ไข
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Task Detail Modal ── */}
      {selectedTaskDetail && (
        <TaskDetailModal
          task={selectedTaskDetail}
          isOpen={!!selectedTaskDetail}
          onClose={() => setSelectedTaskDetail(null)}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
          onEditClick={openEditModal}
        />
      )}

      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#fdfaf4',
            border: '1px solid #e5d9c8',
            color: '#3d2b1f',
            fontFamily: 'Nunito, sans-serif',
            fontSize: '0.875rem',
            boxShadow: '0 4px 16px rgba(139,109,56,0.14)',
          },
        }}
      />
    </div>
  )
}

export default Dashboard