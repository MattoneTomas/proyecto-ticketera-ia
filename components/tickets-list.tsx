"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"

interface Ticket {
  id: number
  ticket_number: string
  title: string
  status: "open" | "in_progress" | "waiting" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  category_name: string
  category_color: string
  assigned_to_name?: string
  created_at: string
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  open: { bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-600 dark:text-blue-400", label: "Abierto" },
  in_progress: {
    bg: "bg-purple-50 dark:bg-purple-950",
    text: "text-purple-600 dark:text-purple-400",
    label: "En Progreso",
  },
  waiting: { bg: "bg-yellow-50 dark:bg-yellow-950", text: "text-yellow-600 dark:text-yellow-400", label: "En Espera" },
  resolved: { bg: "bg-green-50 dark:bg-green-950", text: "text-green-600 dark:text-green-400", label: "Resuelto" },
  closed: { bg: "bg-gray-50 dark:bg-gray-950", text: "text-gray-600 dark:text-gray-400", label: "Cerrado" },
}

const priorityMap: Record<string, { className: string; label: string }> = {
  low: { className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300", label: "Baja" },
  medium: { className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300", label: "Media" },
  high: { className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300", label: "Alta" },
  urgent: { className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300", label: "Urgente" },
}

export default function TicketsList({
  tickets,
  onViewDetail,
}: {
  tickets: Ticket[]
  onViewDetail: (id: number) => void
}) {
  const [filter, setFilter] = useState<string>("")

  const filteredTickets = filter ? tickets.filter((t) => t.status === filter) : tickets

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Tickets</h2>
        <p className="text-muted-foreground">Gestiona todos tus tickets en un solo lugar</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter("")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
          }`}
        >
          Todos ({tickets.length})
        </button>
        {Object.entries(statusColors).map(([status, colors]) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === status ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            {colors.label} ({tickets.filter((t) => t.status === status).length})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No hay tickets para mostrar</p>
          </Card>
        ) : (
          filteredTickets.map((ticket) => {
            const statusStyle = statusColors[ticket.status]
            const priorityStyle = priorityMap[ticket.priority]

            return (
              <Card
                key={ticket.id}
                className="p-4 hover:bg-muted/50 cursor-pointer transition-colors border border-border"
                onClick={() => onViewDetail(ticket.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-muted-foreground">{ticket.ticket_number}</span>
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ticket.category_color }}></span>
                      <span className="text-xs font-medium">{ticket.category_name}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{ticket.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Asignado a: {ticket.assigned_to_name || "Sin asignar"}</span>
                      <span>•</span>
                      <span>Creado: {new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {priorityStyle && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityStyle.className}`}>
                        {priorityStyle.label}
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                      {statusStyle.label}
                    </span>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
