"use client"

import { useState, useEffect } from "react"
import Dashboard from "@/components/dashboard"
import TicketsList from "@/components/tickets-list"
import CreateTicket from "@/components/create-ticket"
import TicketDetail from "@/components/ticket-detail"

interface Ticket {
  id: number
  ticket_number: string
  title: string
  description?: string
  status: "open" | "in_progress" | "waiting" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  category_name: string
  category_color?: string
  assigned_to_name?: string
  created_at: string
  created_by_name?: string
  comments?: any[]
  history?: any[]
  agents?: Agent[]
}

interface Agent {
  id: number
  name: string
  role?: string
}

export default function Home() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [view, setView] = useState<"dashboard" | "list" | "create" | "detail">("dashboard")
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost/servicedesk/api/tickets.php?action=list")
      const result = await response.json()
      if (result.success) {
        setTickets(result.data)
      }
    } catch (error) {
      console.error("Error fetching tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAgents = async () => {
    try {
      const response = await fetch("http://localhost/servicedesk/api/users.php?action=agents")
      const result = await response.json()
      if (result.success) {
        setAgents(result.data)
      }
    } catch (error) {
      console.error("Error fetching agents:", error)
    }
  }

  useEffect(() => {
    // Primero obtenemos los agentes y luego los tickets para asegurar que la lista esté disponible
    fetchAgents()
    fetchTickets()
  }, [])

  // Este nuevo efecto se encarga de adjuntar los agentes a los tickets una vez que ambos se han cargado.
  useEffect(() => {
    if (tickets.length > 0 && agents.length > 0) {
      setTickets((prevTickets) =>
        prevTickets.map((ticket) => ({ ...ticket, agents: agents }))
      )
    }
  }, [agents]) // Se ejecuta solo cuando la lista de agentes cambia (de vacía a llena).
  const handleViewDetail = (ticketId: number) => {
    setSelectedTicketId(ticketId)
    setView("detail")
  }

  const handleBackToList = () => {
    setView("list")
  }

  const handleGoToDashboard = () => {
    setView("dashboard")
  }

  const handleTicketCreated = () => {
    fetchTickets() // Vuelve a cargar los tickets desde la API
    setView("list") // Cambia a la vista de lista
  }

  const handleUpdateTicket = (updatedTicket: Ticket) => {
    // Al actualizar un ticket, lo reemplazamos en la lista y le añadimos la lista de agentes
    const ticketWithAgents = { ...updatedTicket, agents: agents }
    setTickets(
      tickets.map((t) => (t.id === updatedTicket.id ? ticketWithAgents : t))
    )
    setSelectedTicketId(updatedTicket.id) // Aseguramos que el ticket seleccionado se mantenga
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-card">
        <div className="px-6 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleGoToDashboard}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">SD</span>
            </div>
            <h1 className="text-xl font-bold">ServiceDesk</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView("dashboard")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === "dashboard" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === "list" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
              }`}
            >
              Tickets
            </button>
            <button
              onClick={() => setView("create")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === "create" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
              }`}
            >
              Crear
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {view === "dashboard" && <Dashboard />}
        {view === "list" &&
          (loading ? (
            <p className="text-center text-muted-foreground">Cargando tickets...</p>
          ) : (
            <TicketsList tickets={tickets} onViewDetail={handleViewDetail} />
          ))
        }
        {view === "create" && <CreateTicket onTicketCreated={handleTicketCreated} />}
        {view === "detail" && selectedTicketId && (
          <TicketDetail
            ticket={tickets.find((t) => t.id === selectedTicketId)!}
            onBack={handleBackToList}
            onUpdateTicket={handleUpdateTicket}
            agents={agents}
          />
        )}
      </div>
    </main>
  )
}
