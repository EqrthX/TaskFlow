import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, 
  parseISO 
} from 'date-fns'
import { th } from 'date-fns/locale' // นำเข้าภาษาไทย
import { LogOut, ChevronLeft, ChevronRight, Plus, Check, Trash2, X } from 'lucide-react'

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
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  // 1. โหลดข้อมูล
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) setUser(JSON.parse(storedUser))
        
        // ดึงงานทั้งหมด (ในของจริงควรดึงตามช่วงเดือน: ?start=...&end=...)
        const res = await api.get('/tasks')
        setTasks(res.data.data || [])
      } catch (error) {
        console.error("Fetch error", error)
      }
    }
    fetchData()
  }, [])

  // 2. ฟังก์ชันจัดการปฏิทิน
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const onDateClick = (day: Date) => {
    setSelectedDate(day)
    setIsModalOpen(true) // เปิด Modal เพิ่มงาน
  }

  // 3. ฟังก์ชัน API
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim() || !selectedDate) return

    try {
      // ส่งวันที่ไปด้วย (format เป็น ISO หรือ yyyy-MM-dd ตามที่ Backend ต้องการ)
      const payload = {
        title: newTaskTitle,
        date: selectedDate.toISOString() 
      }
      
      const res = await api.post('/tasks', payload)
      setTasks([...tasks, res.data.data])
      
      // Reset & Close
      setNewTaskTitle('')
      setIsModalOpen(false)
    } catch (error) {
      alert("เพิ่มงานไม่สำเร็จ")
    }
  }

  const toggleTask = async (task: Task) => {
    try {
      // Optimistic Update
      const updatedTasks = tasks.map(t => t.id === task.id ? { ...t, isDone: !t.isDone } : t)
      setTasks(updatedTasks)
      
      await api.patch(`/tasks/${task.id}`, { isDone: !task.isDone })
    } catch (error) {
      console.error("Update failed")
    }
  }

  const deleteTask = async (id: number) => {
    if(!confirm("ลบงานนี้?")) return
    try {
      setTasks(tasks.filter(t => t.id !== id))
      await api.delete(`/tasks/${id}`)
    } catch (error) {
      alert("ลบไม่สำเร็จ")
    }
  }

  // 4. สร้าง Grid วันที่
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }) // 0 = Sunday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })

    const dateFormat = "d"
    const rows = []
    let days = []
    let day = startDate
    let formattedDate = ""

    // Loop สร้างวันตั้งแต่วันแรกของปฏิทินจนวันสุดท้าย
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

    return (
      <div className="grid grid-cols-7 border-t border-l border-gray-200">
        {/* Header วัน (อาทิตย์ - เสาร์) */}
        {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map((dayName) => (
          <div key={dayName} className="p-2 text-center font-semibold bg-gray-50 border-r border-b text-gray-600">
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
              className={`min-h-[120px] p-2 border-r border-b border-gray-200 relative group transition hover:bg-gray-50 cursor-pointer
                ${!isSameMonth(dayItem, monthStart) ? 'bg-gray-50/50 text-gray-400' : 'bg-white'}
                ${isSameDay(dayItem, new Date()) ? 'bg-blue-50' : ''}
              `}
              onClick={() => onDateClick(dayItem)}
            >
              {/* เลขวันที่ */}
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full 
                  ${isSameDay(dayItem, new Date()) ? 'bg-blue-600 text-white' : ''}`}>
                  {format(dayItem, dateFormat)}
                </span>
                
                {/* ปุ่มบวกเล็กๆ (โผล่ตอนเอาเมาส์ชี้) */}
                <button className="opacity-0 group-hover:opacity-100 text-blue-500 hover:bg-blue-100 rounded-full p-0.5">
                  <Plus size={16} />
                </button>
              </div>

              {/* รายการงานในช่อง */}
              <div className="space-y-1">
                {dayTasks.map(task => (
                  <div 
                    key={task.id}
                    onClick={(e) => { e.stopPropagation(); toggleTask(task); }} // หยุดคลิกทะลุไปโดนช่องวัน
                    className={`text-xs p-1.5 rounded border truncate flex items-center gap-1.5 transition
                      ${task.isDone 
                        ? 'bg-green-100 border-green-200 text-green-700 line-through' 
                        : 'bg-white border-blue-100 text-gray-700 hover:border-blue-300 shadow-sm'}
                    `}
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.isDone ? 'bg-green-500' : 'bg-gray-300'}`} />
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-300 font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow px-6 py-3 flex justify-between items-center mb-6 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-blue-600">TaskFlow</h1>
        <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.first_name} {user?.last_name}</span>
            <button onClick={() => { localStorage.clear(); navigate('/login') }} className="text-red-500 p-2 hover:bg-red-50 rounded-full">
                <LogOut size={20} />
            </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pb-10">
        {/* Header ปฏิทิน */}
        <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-t-lg shadow-sm border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {format(currentMonth, 'MMMM yyyy', { locale: th })} {/* แสดงชื่อเดือนภาษาไทย */}
            </h2>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft /></button>
              <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded"><ChevronRight /></button>
            </div>
          </div>
          <button 
            onClick={() => { setSelectedDate(new Date()); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
          >
            <Plus size={18} /> สร้างงานวันนี้
          </button>
        </div>

        {/* ตัวปฏิทิน */}
        <div className="bg-white rounded-b-lg shadow overflow-hidden">
          {renderCalendar()}
        </div>
      </main>

      {/* --- Modal เพิ่มงาน --- */}
      {isModalOpen && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                เพิ่มงานวันที่ {format(selectedDate, 'd MMM yyyy', { locale: th })}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddTask}>
              <input
                autoFocus
                type="text"
                placeholder="พิมพ์ชื่อรายการงาน..."
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none mb-4"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
              />
              
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">บันทึก</button>
              </div>
            </form>

            {/* List งานของวันนี้ที่มีอยู่แล้ว (เผื่ออยากลบ) */}
            <div className="mt-6 pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-500 mb-2">งานในวันนี้</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {tasks
                  .filter(t => isSameDay(parseISO(t.date), selectedDate))
                  .map(t => (
                    <div key={t.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded group">
                      <span className={t.isDone ? 'line-through text-gray-400' : ''}>{t.title}</span>
                      <button onClick={() => deleteTask(t.id)} className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600">
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
  )
}

export default Dashboard