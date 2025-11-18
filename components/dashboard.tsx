"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card } from "@/components/ui/card"

interface Stats {
  open: number
  in_progress: number
  waiting: number
  resolved: number
  closed: number
}

interface Activity {
  date: string
  low: number
  medium: number
  high: number
  urgent: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    open: 0,
    in_progress: 0,
    waiting: 0,
    resolved: 0,
    closed: 0,
  })
  const [activity, setActivity] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [daysFilter, setDaysFilter] = useState(30)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost/servicedesk/api/tickets.php?action=stats&days=${daysFilter}`)
        const result = await response.json()
        if (result.success) {
          setStats(result.data.summary)
          setActivity(result.data.activity)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [daysFilter])

  const statCards = [
    {
      title: "Abiertos",
      value: stats.open,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "En Progreso",
      value: stats.in_progress,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "En Espera",
      value: stats.waiting,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
    },
    {
      title: "Resueltos",
      value: stats.resolved,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Cerrados",
      value: stats.closed,
      color: "text-gray-500",
      bgColor: "bg-gray-50 dark:bg-gray-950",
    },
  ]

  const priorityMap: Record<string, string> = {
    low: "Baja",
    medium: "Media",
    high: "Alta",
    urgent: "Urgente",
  }

  // Agrupamos los datos de actividad por fecha para evitar barras duplicadas
  const groupedActivity = activity.reduce((acc: Record<string, Activity>, day: Activity) => {
    const date = day.date
    if (!acc[date]) {
      acc[date] = {
        date: date,
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0,
      }
    }
    acc[date].low += Number(day.low)
    acc[date].medium += Number(day.medium)
    acc[date].high += Number(day.high)
    acc[date].urgent += Number(day.urgent)
    return acc
  }, {})
  const chartData = Object.values(groupedActivity)

  // Calculamos los totales para cada prioridad para mostrarlos en la leyenda
  const priorityTotals = chartData.reduce(
    (acc, day) => {
      acc.low += Number(day.low)
      acc.medium += Number(day.medium)
      acc.high += Number(day.high)
      acc.urgent += Number(day.urgent)
      return acc
    },
    { low: 0, medium: 0, high: 0, urgent: 0 }
  )

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
            <p className="text-muted-foreground">Resumen general del sistema de tickets</p>
          </div>
          <div className="flex gap-2">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setDaysFilter(days)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  daysFilter === days
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-border"
                }`}
              >
                Últimos {days} días
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, idx) => (
          <Card key={idx} className={`p-4 ${stat.bgColor}`}>
            <p className="text-sm font-medium text-muted-foreground mb-2">{stat.title}</p>
            {loading ? (
              <div className="h-10 w-16 bg-muted/50 rounded animate-pulse"></div>
            ) : (
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            )}
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <h3 className="text-xl font-bold mb-4">Tickets Creados por Día</h3>
        {loading ? (
          <div className="h-72 w-full bg-muted/50 rounded animate-pulse"></div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} barCategoryGap="20%" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(str) => new Date(str).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
              />
              <YAxis allowDecimals={false} />
              {/* Tooltip eliminado para una vista más limpia */}
              {/* <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} /> */}
              <Legend
                formatter={(value, entry) => {
                  const dataKey = entry.dataKey as keyof typeof priorityTotals
                  return `${value} (${priorityTotals[dataKey]})`
                }}
              />
              <Bar dataKey="low" fill="#3B82F6" name="Baja" barSize={18} />
              <Bar dataKey="medium" fill="#8B5CF6" name="Media" barSize={18} />
              <Bar dataKey="high" fill="#F59E0B" name="Alta" barSize={18} />
              <Bar dataKey="urgent" fill="#EF4444" name="Urgente" barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  )
}
