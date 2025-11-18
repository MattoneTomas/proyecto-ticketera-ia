"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

interface Category {
  id: number
  name: string
}

const priorityOptions = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
]

// Hook personalizado para "debounce"
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function CreateTicket({ onTicketCreated }: { onTicketCreated: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: 1,
    priority: "low",
    assigned_to_id: null as number | null,
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiSuggestionTime, setAiSuggestionTime] = useState<number>(0)

  const debouncedDescription = useDebounce(formData.description, 500)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost/servicedesk/api";
        const response = await fetch(`${apiUrl}/categories.php?action=list`)
        const result = await response.json()
        if (result.success) {
          setCategories(result.data)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    fetchCategories()
  }, [])

  // --- EFECTO PARA LA IA ---
  useEffect(() => {
    if (debouncedDescription.length > 20) { // Analizar solo si hay suficiente texto
      const analyzeText = async () => {
        setIsAnalyzing(true)
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost/servicedesk/api";
          const response = await fetch(`${apiUrl}/tickets.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "analyze_ticket",
              description: debouncedDescription,
            }),
          })
          const result = await response.json()

          // Pausa artificial para que el análisis se sienta más deliberado
          await new Promise((resolve) => setTimeout(resolve, 750))

          if (result.success) {
            setFormData((prev) => ({
              ...prev,
              category_id: result.data.category_id,
              priority: result.data.priority,
              assigned_to_id: result.data.assigned_to_id,
            }))
            setAiSuggestionTime(Date.now()) // Registra el momento de la sugerencia
          }
        } catch (error) {
          console.error("Error analyzing ticket:", error)
        } finally {
          setIsAnalyzing(false)
        }
      }
      analyzeText()
    }
  }, [debouncedDescription])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost/servicedesk/api";
      const response = await fetch(`${apiUrl}/tickets.php?action=create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, created_by: 1 }), // Asumimos usuario 1
      })
      const result = await response.json()
      if (result.success) {
        onTicketCreated()
      } else {
        alert("Error al crear el ticket: " + result.message)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error de conexión al crear el ticket.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Crear Nuevo Ticket</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">Título</label>
          <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>
        <div className="relative">
          <label htmlFor="description" className="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            name="description"
            id="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={6}
            className={`w-full p-2 border rounded-md transition-all duration-300 focus:ring-2 focus:ring-primary outline-none ${
              isAnalyzing ? "ring-2 ring-primary shadow-lg shadow-primary/20" : "ring-0"
            }`}
            placeholder="Describe tu problema aquí. La IA intentará clasificarlo automáticamente..."
          />
          {isAnalyzing && <span className="absolute bottom-3 right-3 text-xs text-muted-foreground animate-pulse">Analizando...</span>}
        </div>
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium mb-1">Categoría</label>
          <select
            name="category_id"
            id="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md transition-colors ${aiSuggestionTime > 0 ? 'animate-flash' : ''}`}
            style={{ animationDelay: `${aiSuggestionTime}ms` }} // Evita que parpadee al cargar
          >
            {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="priority" className="block text-sm font-medium mb-1">Prioridad</label>
          <select
            name="priority"
            id="priority"
            value={formData.priority}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md transition-colors ${aiSuggestionTime > 0 ? 'animate-flash' : ''}`}
            style={{ animationDelay: `${aiSuggestionTime}ms` }} // Evita que parpadee al cargar
          >
            {priorityOptions.map((p) => (<option key={p.value} value={p.value}>{p.label}</option>))}
          </select>
        </div>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50">
          {isSubmitting ? "Enviando..." : "Crear Ticket"}
        </button>
      </form>
    </Card>
  )
}