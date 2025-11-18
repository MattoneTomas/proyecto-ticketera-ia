"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"

interface TicketData {
  id: number
  ticket_number: string
  title: string
  description: string
  status: string
  priority: string
  category_name: string
  assigned_to_name?: string
  created_at: string
  created_by_name?: string
  comments?: any[]
  history?: any[]
  assigned_to?: number | null
}

interface Agent {
  id: number
  name: string
  role?: string
}

const statusOptions = [
  { value: "open", label: "Abierto" },
  { value: "in_progress", label: "En Progreso" },
  { value: "waiting", label: "En Espera" },
  { value: "resolved", label: "Resuelto" },
  { value: "closed", label: "Cerrado" },
]

const priorityMap: Record<string, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente",
}

export default function TicketDetail({
  ticket: initialTicket,
  onBack,
  onUpdateTicket,
}: {
  ticket: TicketData
  onBack: () => void
  onUpdateTicket: (ticket: TicketData) => void
  agents: Agent[]
}) {
  // Renombramos la prop para usarla directamente
  const ticket = initialTicket;
  const [newComment, setNewComment] = useState("")
  const [showStatusPopup, setShowStatusPopup] = useState(false)
  const [popupMessage, setPopupMessage] = useState("")

  // --- INICIO: Actualizaciones en Tiempo Real (Polling) ---
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const handleStatusChange = (newStatus: string) => {
    if (ticket) {
      const updateStatus = async () => {
        try {
          const response = await fetch(`http://localhost/servicedesk/api/tickets.php?action=update&id=${ticket.id}`, {
            method: 'POST', // Cambiado a POST para mayor compatibilidad
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: newStatus,
              changed_by: 1, // Asumimos que el usuario 1 cambia el estado.
            }),
          });

          const result = await response.json();
          if (!response.ok || !result.success) {
            throw new Error(result.message || "Error al actualizar el estado");
          }

          // Notificamos al componente padre con los datos actualizados desde la API
          onUpdateTicket(result.data);

          // Configuramos y mostramos el popup
          const newStatusLabel = statusOptions.find((s) => s.value === newStatus)?.label || newStatus;
          setPopupMessage(`Estado cambiado a: ${newStatusLabel}`);
          setShowStatusPopup(true);
          setTimeout(() => setShowStatusPopup(false), 3000); // Ocultar después de 3 segundos

        } catch (error) {
          console.error("Error al cambiar el estado:", error);
          // Aquí podrías mostrar un popup de error
        }
      }
      updateStatus();
    }
  }

  const handleAddComment = async () => {
    if (newComment.trim() && ticket) {
      try {
        const response = await fetch(`http://localhost/servicedesk/api/tickets.php?action=comment&id=${ticket.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            comment: newComment,
            user_id: 1, // Asumimos que el usuario 1 comenta. Cambiar si tienes un sistema de login.
          }),
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Error al agregar comentario");
        }

        setNewComment("");
        onUpdateTicket(result.data); // Notificamos al padre con el ticket completo desde la API
      } catch (error) {
        console.error("Error al agregar comentario:", error);
      }
    }
  }

  const currentStatusLabel = statusOptions.find((s) => s.value === ticket.status)?.label || ticket.status
  const currentPriorityLabel = priorityMap[ticket.priority] || ticket.priority

  // Si por alguna razón el ticket no existe, no renderizamos nada.
  if (!ticket) return null;

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-primary hover:underline flex items-center gap-1">
        ← Volver a lista
      </button>

      {showStatusPopup && (
        <div className="fixed top-20 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-transform animate-in slide-in-from-right">
          <p className="font-medium">✓ {popupMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-mono text-muted-foreground mb-2">{ticket.ticket_number}</p>
                <h1 className="text-3xl font-bold">{ticket.title}</h1>
              </div>
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-border">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Categoría</p>
                <p className="font-medium">{ticket.category_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Prioridad</p>
                <p className="font-medium">{currentPriorityLabel}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Asignado a</p>
                <p className="font-medium">{ticket.assigned_to_name || "Sin asignar"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Creado por</p>
                <p className="font-medium">{ticket.created_by_name || "Sin asignar"}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Descripción</h3>
              <p className="text-foreground leading-relaxed">{ticket.description}</p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Comentarios</h3>
            <div className="space-y-4 mb-6">
              {ticket.comments?.map((comment, idx) => (
                <div key={idx} className="pb-4 border-b border-border last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium">{comment.name}</p>
                    <p className="text-sm text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className="text-foreground">{comment.comment}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Agrega un comentario..."
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <button
                onClick={handleAddComment}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Agregar Comentario
              </button>
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Historial</h3>
            <div className="space-y-3">
              {ticket.history?.map((entry, idx) => {
                const oldLabel =
                  entry.field_name === "status"
                    ? statusOptions.find((s) => s.value === entry.old_value)?.label
                    : entry.old_value
                const newLabel =
                  entry.field_name === "status"
                    ? statusOptions.find((s) => s.value === entry.new_value)?.label
                    : entry.new_value

                return (
                  <div key={idx} className="text-sm pb-3 border-b border-border last:border-b-0">
                    <p className="font-medium capitalize">
                      {entry.field_name === "status" ? "Estado" : entry.field_name}
                    </p>
                    <p className="text-muted-foreground">
                      {oldLabel} → {newLabel}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Por {entry.changed_by}</p>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
