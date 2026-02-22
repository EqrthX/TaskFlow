import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Sidebar from '../components/Sidebar'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
  parseISO
} from 'date-fns'
import { th } from 'date-fns/locale' // นำเข้าภาษาไทย
import { LogOut, ChevronLeft, ChevronRight, Plus, Trash2, X, Menu } from 'lucide-react'

// --- Interface ---
interface Task {
  id: number
  title: string
  isDone: boolean
  date: string // รับเป็น ISO String จาก DB
}

interface User {
  first_name: string
  last_name: string
}

const Dashboard = () => {
  const navigate = useNavigate()

  // State
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date()) // เดือนปัจจุบันที่แสดง
  const [selectedDate, setSelectedDate] = useState<Date | null>(null) // วันที่ถูกคลิก (เพื่อเพิ่มงาน)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('');

  // 1. โหลดข้อมูล
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) setUser(JSON.parse(storedUser))

        // ดึงงานทั้งหมด (ในของจริงควรดึงตามช่วงเดือน: ?start=...&end=...)
        const res = await api.get('/tasks/show-tasks')

        setTasks(res.data.tasks || [])
      } catch (e) {
        console.error("Fetch error", e)
      }
    }
    fetchData()
  }, [])

  // 2. ฟังก์ชันจัดการปฏิทิน
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');

      // 2. เคลียร์ข้อมูล user ใน localStorage ออก
      localStorage.clear();

      // 3. ดีดกลับไปหน้า Login
      navigate('/login');
    } catch (error) {
      console.error("Logout error", error);
      // ถึงจะ Error ก็ควรเคลียร์ฝั่ง client แล้วเด้งออกไปเลย
      localStorage.clear();
      navigate('/login');
    }
  }
  const onDateClick = (day: Date) => {
    setSelectedDate(day)
    setIsModalOpen(true) // เปิด Modal เพิ่มงาน
  }

  // 3. ฟังก์ชัน API
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim() || !selectedDate || !newTaskDescription.trim()) return

    try {
      // ส่งวันที่ไปด้วย (format เป็น ISO หรือ yyyy-MM-dd ตามที่ Backend ต้องการ)
      const payload = {
        title: newTaskTitle,
        description: newTaskDescription,
        date: selectedDate.toISOString()
      }

      const res = await api.post('/tasks/add-tasks', payload)
      
      setTasks([...tasks, res.data.data])

      // Reset & Close
      setNewTaskTitle('')
      setNewTaskDescription('')
      setIsModalOpen(false)
    } catch (e) {
      console.error("Add task failed", e)
      alert("เพิ่มงานไม่สำเร็จ")
    }
  }

  const toggleTask = async (task: Task) => {
    try {
      // Optimistic Update
      const updatedTasks = tasks.map(t => t.id === task.id ? { ...t, isDone: !t.isDone } : t)
      setTasks(updatedTasks)

      await api.patch(`/tasks/${task.id}`, { isDone: !task.isDone })
    } catch (e) {
      console.error("Update failed", e)
    }
  }

  const deleteTask = async (id: number) => {
    if (!confirm("ลบงานนี้?")) return
    try {
      setTasks(tasks.filter(t => t.id !== id))
      await api.delete(`/tasks/${id}`)
    } catch (e) {
      alert("ลบไม่สำเร็จ")
      console.error("Delete failed", e)
    }
  }

  // 4. สร้าง Grid วันที่
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }) // 0 = Sunday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })

    const dateFormat = "d"

    // Loop สร้างวันตั้งแต่วันแรกของปฏิทินจนวันสุดท้าย
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

    return (
      <div className="grid grid-cols-7 gap-0">
        {/* Header วัน (อาทิตย์ - เสาร์) */}
        {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map((dayName) => (
          <div key={dayName} className="p-1 sm:p-3 text-center font-semibold bg-gray-100 border-r border-b text-gray-600 text-xs sm:text-sm">
            {dayName}
          </div>
        ))}

        {/* ช่องวันที่ */}
        {calendarDays.map((dayItem, idx) => {
          // หางานของวันนี้
          const dayTasks = tasks.filter(task => isSameDay(parseISO(task.date), dayItem))

          return (
            <div
              key={idx}
              className={`h-32 sm:h-56 p-1 sm:p-2 border-r border-b border-gray-400 relative group transition hover:bg-gray-300 cursor-pointer flex flex-col
                ${!isSameMonth(dayItem, monthStart) ? 'bg-gray-50/50 text-gray-400' : 'bg-white'}
                ${isSameDay(dayItem, new Date()) ? 'bg-blue-50' : ''}
              `}
              onClick={() => onDateClick(dayItem)}
            >
              {/* เลขวันที่ */}
              <div className="flex justify-between items-start mb-1">
                <span className={`text-xs sm:text-sm font-medium w-6 sm:w-10 h-6 sm:h-10 flex items-center justify-center rounded-full 
                  ${isSameDay(dayItem, new Date()) ? 'bg-blue-600 text-white' : ''}`}>
                  {format(dayItem, dateFormat)}
                </span>

                {/* ปุ่มบวกเล็กๆ (โผล่ตอนเอาเมาส์ชี้) */}
                <button className="opacity-0 group-hover:opacity-100 text-blue-500 hover:bg-blue-100 rounded-full p-0.5 hidden sm:block">
                  <Plus size={14} />
                </button>
              </div>

              {/* รายการงานในช่อง - แสดงแค่ 3 อันล่าสุด */}
              <div className="space-y-0.5 sm:space-y-1 flex-1 overflow-y-auto">
                {dayTasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    onClick={(e) => { e.stopPropagation(); toggleTask(task); }} // หยุดคลิกทะลุไปโดนช่องวัน
                    className={`text-xs p-1 sm:p-1.5 rounded border truncate flex items-center gap-1 sm:gap-1.5 transition text-2xs sm:text-xs
                      ${task.isDone
                        ? 'bg-green-100 border-green-200 text-green-700 line-through'
                        : 'bg-white border-blue-100 text-gray-700 hover:border-blue-300 shadow-sm'}
                    `}
                  >
                    <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full shrink-0 ${task.isDone ? 'bg-green-500' : 'bg-amber-500'}`} />
                    <span className="text-xs line-clamp-1">{task.title}</span>
                  </div>
                ))}
                {/* แสดง +X more ถ้ามีงานมากกว่า 3 อัน */}
                {dayTasks.length > 3 && (
                  <button
                    onClick={() => onDateClick(dayItem)}
                    className="text-xs text-blue-600 font-medium hover:text-blue-800 hover:underline"
                  >
                    +{dayTasks.length - 3}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-300 font-sans flex">
      {/* Sidebar */}
      <Sidebar
        tasks={tasks}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <nav className="bg-white shadow px-4 sm:px-6 py-3 flex justify-between items-center mb-4 sm:mb-6 sticky top-0 z-10">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-blue-600">TaskFlow</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:block text-sm text-gray-600">{user?.first_name} {user?.last_name}</span>
            {/* 👇 เปลี่ยนจาก handleLogout() เป็นสั่งเปิด Modal */}
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </nav>
        {/* --- Logout Confirmation Modal --- */}
        {isLogoutModalOpen && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsLogoutModalOpen(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="text-red-600" size={32} />
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">ยืนยันการออกจากระบบ</h3>
              <p className="text-gray-500 mb-8">คุณต้องการออกจากระบบ TaskFlow ใช่หรือไม่?</p>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-3 bg-red-600 text-white hover:bg-red-700 rounded-xl font-bold shadow-lg shadow-red-200 transition"
                >
                  ออกจากระบบ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-2 sm:px-4 pb-6 sm:pb-10 flex-1">
        {/* Header ปฏิทิน */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 bg-white p-3 sm:p-4 rounded-t-lg shadow-sm border-b">
          <div className="flex items-center gap-1 sm:gap-4 w-full sm:w-auto">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 flex-1 sm:flex-none">
              {format(currentMonth, 'MMMM yyyy', { locale: th })} {/* แสดงชื่อเดือนภาษาไทย */}
            </h2>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="p-1 sm:p-2 hover:bg-gray-100 rounded text-gray-600"><ChevronLeft size={20} className="sm:size-5" /></button>
              <button onClick={nextMonth} className="p-1 sm:p-2 hover:bg-gray-100 rounded text-gray-600"><ChevronRight size={20} className="sm:size-5" /></button>
            </div>
          </div>
          <button
            onClick={() => { setSelectedDate(new Date()); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1 sm:gap-2 shadow-sm text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
          >
            <Plus size={20} /> <span className="hidden sm:inline">สร้างงานวันนี้</span>
          </button>
        </div>

        {/* ตัวปฏิทิน */}
        <div className="bg-white rounded-b-lg shadow overflow-hidden">
          {renderCalendar()}
        </div>
      </main>

      {/* --- Modal เพิ่มงาน --- */}
      {isModalOpen && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start gap-2 mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                เพิ่มงานวันที่ {format(selectedDate, 'd MMM yyyy', { locale: th })}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 shrink-0">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddTask}>
              <input
                autoFocus
                type="text"
                placeholder="พิมพ์ชื่อรายการงาน..."
                className="w-full border rounded-lg p-2 sm:p-3 focus:ring-2 focus:ring-blue-500 outline-none mb-3 sm:mb-4 text-sm"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
              />
              <textarea
                placeholder='รายละเอียด'
                className="w-full border rounded-lg p-2 sm:p-3 focus:ring-2 focus:ring-blue-500 outline-none mb-3 sm:mb-4 text-sm resize-none"
                rows={3}
                value={newTaskDescription}
                onChange={e => setNewTaskDescription(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 sm:px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">ยกเลิก</button>
                <button type="submit" className="px-3 sm:px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">บันทึก</button>
              </div>
            </form>

            {/* List งานของวันนี้ที่มีอยู่แล้ว (เผื่ออยากลบ) */}
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t">
              <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">งานในวันนี้</h4>
              <div className="space-y-1 sm:space-y-2 max-h-40 overflow-y-auto">
                {tasks
                  .filter(t => isSameDay(parseISO(t.date), selectedDate))
                  .map(t => (
                    <div key={t.id} className="flex justify-between items-center text-xs sm:text-sm p-2 bg-gray-50 rounded group">
                      <span className={t.isDone ? 'line-through text-gray-400 truncate' : 'truncate'}>{t.title}</span>
                      <button onClick={() => deleteTask(t.id)} className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 shrink-0 ml-2">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                {tasks.filter(t => isSameDay(parseISO(t.date), selectedDate)).length === 0 && (
                  <p className="text-xs text-gray-400 text-center">ว่างเปล่า...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default Dashboard