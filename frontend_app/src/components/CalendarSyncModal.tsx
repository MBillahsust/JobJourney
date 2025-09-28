"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Calendar as CalendarPicker } from "./ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

export type DayTask = { title: string; type?: string; duration?: number; gap?: string; resources?: string }
export type DayPlan = { day: number; tasks: DayTask[] }
export type GeneratedPlan = { durationDays: number; days: DayPlan[] }

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  planId: string
  plan?: GeneratedPlan | null
  apiRoot: string
  getToken: () => string | null
  onSynced?: (createdCount: number) => void
  startDate?: string
}

function apiJoin(root: string, path: string) {
  return `${root.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`
}

function formatDateLocal(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function parseLocalDate(ymd: string): Date {
  const [y, m, d] = (ymd || "").split("-").map((v) => Number(v))
  if (!y || !m || !d) return new Date()
  return new Date(y, (m as number) - 1, d as number, 0, 0, 0, 0)
}

export default function CalendarSyncModal(props: Props) {
  const { open, onOpenChange, planId, plan, apiRoot, getToken, onSynced, startDate: startDateProp } = props

  const [startDate, setStartDate] = useState<string>(() => startDateProp || formatDateLocal(new Date()))
  const [hours] = useState<[number, number, number]>([10, 13, 16])
  const [durationMin] = useState<number>(60)
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState<{ connected: boolean; email?: string } | null>(null)
  const [pushing, setPushing] = useState(false)

  const [currentDayIndex, setCurrentDayIndex] = useState<number>(0)

  // RIGHT-SIDE preview scroll container
  const previewScrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    ;(async () => {
      try {
        const token = getToken()
        const resp = await fetch(apiJoin(apiRoot, "/calendar/status"), {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        })
        if (resp.ok) {
          const data = await resp.json()
          setConnected(data)
        } else {
          setConnected({ connected: false })
        }
      } catch {
        setConnected({ connected: false })
      }
    })()
  }, [open, apiRoot, getToken])

  useEffect(() => {
    if (open && startDateProp) setStartDate(startDateProp)
  }, [open, startDateProp])

  useEffect(() => {
    if (!open) return
    setCurrentDayIndex(0)
    const el = previewScrollRef.current
    if (el) el.scrollTop = 0
  }, [open, planId, startDate, plan?.days?.length])

  function dayToDate(dayIndex: number): string {
    const base = parseLocalDate(startDate)
    base.setDate(base.getDate() + dayIndex)
    return formatDateLocal(base)
  }

  const preview = useMemo(() => {
    const days = plan?.days || []
    return days.map((d, idx) => {
      const date = dayToDate(idx)
      const tasks = (d.tasks || []).slice(0, 3)
      return { date, day: d.day ?? idx + 1, tasks }
    })
  }, [plan, startDate])

  const goToNextDay = () => {
    if (currentDayIndex < preview.length - 1) {
      setCurrentDayIndex(currentDayIndex + 1)
    }
  }

  const goToPrevDay = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1)
    }
  }

  const currentDay = preview[currentDayIndex]

  async function connectGoogle() {
    setConnecting(true)
    try {
      const token = getToken()
      const resp = await fetch(apiJoin(apiRoot, "/calendar/oauth/url"), {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err?.error?.message || "Failed to init Google OAuth")
      }
      const data = await resp.json()
      const w = window.open(data.url, "_blank", "width=520,height=640")
      const onMsg = (e: MessageEvent) => {
        if (e?.data?.type === "jj:google-connected") {
          window.removeEventListener("message", onMsg as any)
          try {
            w && w.close()
          } catch {}
          setConnecting(false)
          ;(async () => {
            try {
              const token = getToken()
              const resp = await fetch(apiJoin(apiRoot, "/calendar/status"), {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
              })
              const j = await resp.json().catch(() => ({}))
              setConnected(j)
            } catch {}
          })()
        }
      }
      window.addEventListener("message", onMsg as any)
    } catch (e: any) {
      alert(e?.message || "Failed to connect Google")
      setConnecting(false)
    }
  }

  async function pushToCalendar() {
    if (!startDate) {
      alert("Pick a start date")
      return
    }
    setPushing(true)
    try {
      const token = getToken()
      const body: any = {
        startDate,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Dhaka",
        startHours: hours,
        eventDurationMinutes: durationMin,
      }
      if (!planId.startsWith("plan-")) body.planId = planId
      else body.plan = plan?.days?.map((d) => ({ day: d.day, tasks: d.tasks?.slice(0, 3) })) || []

      const resp = await fetch(apiJoin(apiRoot, "/calendar/push"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body),
      })
      const data = await resp.json().catch(() => ({}))
      if (!resp.ok) {
        if (resp.status === 403 && data?.error?.code === "NEEDS_SCOPES" && data?.error?.authUrl) {
          const w = window.open(data.error.authUrl, "_blank", "width=520,height=640")
          const onMsg = (e: MessageEvent) => {
            if (e?.data?.type === "jj:google-connected") {
              window.removeEventListener("message", onMsg as any)
              try {
                w && w.close()
              } catch {}
              pushToCalendar()
            }
          }
          window.addEventListener("message", onMsg as any)
          return
        }
        throw new Error(data?.error?.message || "Failed to push to Google Calendar")
      }
      onSynced && onSynced(data?.createdCount || 0)
      alert(`Created ${data?.createdCount || 0} calendar events`)
      window.open("https://calendar.google.com/calendar/u/0/r", "_blank")
      onOpenChange(false)
    } catch (e: any) {
      alert(e?.message || "Calendar sync failed")
    } finally {
      setPushing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] md:max-w-[1600px] h-[95vh] p-0 overflow-hidden bg-background border-border">
        <DialogHeader className="glass-effect sticky top-0 z-20">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <CalendarIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-foreground">Sync to Google Calendar</DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">Connect your plan to your calendar seamlessly</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Close
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-auto p-6">
          <div className="flex gap-10 min-h-full">
            {/* Left side - Connection and Calendar controls */}
            <div className="flex-shrink-0 w-96 space-y-6">
              <Card className={`enhanced-card status-indicator ${connected?.connected ? "connected" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${connected?.connected ? "bg-success" : "bg-muted-foreground"} ${connected?.connected ? "animate-pulse" : ""}`}
                      />
                      <div>
                        <CardTitle className="text-base font-medium">
                          {connected?.connected ? "Connected" : "Not Connected"}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {connected?.connected ? connected.email || "Google Calendar" : "Connect to sync your plan"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {!connected?.connected && (
                  <CardContent className="pt-0">
                    <Button
                      onClick={connectGoogle}
                      disabled={connecting}
                      className="w-full connection-pulse text-white font-medium"
                    >
                      {connecting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Connecting...
                        </div>
                      ) : (
                        "Connect Google Calendar"
                      )}
                    </Button>
                  </CardContent>
                )}
              </Card>

              <Card className="enhanced-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                        Start Date
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-0.5">Choose when your plan begins</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-primary/20 hover:border-primary/40 hover:bg-primary/5 bg-transparent"
                      onClick={() => setStartDate(formatDateLocal(new Date()))}
                    >
                      Today
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-border bg-muted/20 p-3">
                    <CalendarPicker
                      mode="single"
                      selected={startDate ? parseLocalDate(startDate) : undefined}
                      onSelect={(d) =>
                        setStartDate(
                          d
                            ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
                            : "",
                        )
                      }
                      initialFocus
                      numberOfMonths={1}
                      showOutsideDays
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="enhanced-card">
                <CardContent className="p-4">
                  <Button
                    onClick={pushToCalendar}
                    disabled={pushing || !connected?.connected}
                    className="w-full h-12 text-base font-medium bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    {pushing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Syncing to Calendar...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Add to Google Calendar
                      </div>
                    )}
                  </Button>
                  {!connected?.connected && (
                    <p className="text-xs text-muted-foreground text-center mt-2">Connect your Google Calendar first</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right side - Plan Preview */}
            <div className="flex-1 min-h-0">
              <Card className="enhanced-card h-full flex flex-col">
                <CardHeader className="flex-shrink-0 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-md bg-primary/10 border border-primary/20">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-medium">Plan Preview</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {plan?.days?.length || 0} days • {preview.reduce((acc, p) => acc + p.tasks.length, 0)} tasks
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={goToPrevDay}
                        disabled={currentDayIndex === 0}
                        className="h-8 w-8 p-0 hover:bg-muted/50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-md min-w-[110px] text-center whitespace-nowrap">
                        Day {currentDayIndex + 1} of {preview.length}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={goToNextDay}
                        disabled={currentDayIndex === preview.length - 1}
                        className="h-8 w-8 p-0 hover:bg-muted/50"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-6 overflow-auto custom-scrollbar">
                  {currentDay ? (
                    <div className="day-card p-5" data-jj-day-card={currentDay.day}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">{currentDay.day}</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">Day {currentDay.day}</h3>
                            <p className="text-sm text-muted-foreground">{currentDay.date}</p>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                          {currentDay.tasks.length} {currentDay.tasks.length === 1 ? "task" : "tasks"}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {currentDay.tasks.length > 0 ? (
                          currentDay.tasks.map((t, j) => (
                            <div
                              key={j}
                              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground text-pretty">{t.title}</p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                  {t.type && (
                                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/20">
                                      {t.type}
                                    </span>
                                  )}
                                  {Number.isFinite(Number(t.duration)) && (
                                    <span className="bg-accent/10 text-accent px-2 py-0.5 rounded-md border border-accent/20">
                                      {Math.round(Number(t.duration))}m
                                    </span>
                                  )}
                                  {t.gap && (
                                    <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-md border border-border">
                                      Gap: {t.gap}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                              <CalendarIcon className="h-5 w-5" />
                            </div>
                            <p className="text-sm">No tasks scheduled for this day</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <CalendarIcon className="h-6 w-6" />
                      </div>
                      <p className="text-sm">No plan data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
