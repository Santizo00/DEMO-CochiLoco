"use client"

import { useEffect, useState } from "react"

export type AdminSession = {
  token: string
  userId: string
  username: string
  expiresAt: string
}

const ADMIN_SESSION_STORAGE_KEY = "cochiloco-admin-session"
const ADMIN_SESSION_EVENT = "cochiloco-admin-session-change"

function isExpired(expiresAt: string) {
  const expiresAtMs = new Date(expiresAt).getTime()
  return Number.isNaN(expiresAtMs) || expiresAtMs <= Date.now()
}

function parseSession(value: string | null): AdminSession | null {
  if (!value) {
    return null
  }

  try {
    const parsed = JSON.parse(value) as Partial<AdminSession>

    if (
      !parsed.token ||
      !parsed.userId ||
      !parsed.username ||
      !parsed.expiresAt ||
      isExpired(parsed.expiresAt)
    ) {
      return null
    }

    return {
      token: parsed.token,
      userId: parsed.userId,
      username: parsed.username,
      expiresAt: parsed.expiresAt,
    }
  } catch {
    return null
  }
}

function emitSessionChange() {
  if (typeof window === "undefined") {
    return
  }

  window.dispatchEvent(new CustomEvent(ADMIN_SESSION_EVENT))
}

export function readAdminSession() {
  if (typeof window === "undefined") {
    return null
  }

  const session = parseSession(window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY))

  if (!session) {
    window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY)
  }

  return session
}

export function saveAdminSession(session: AdminSession) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session))
  emitSessionChange()
}

export function clearAdminSession() {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY)
  emitSessionChange()
}

export function useAdminSession() {
  const [session, setSession] = useState<AdminSession | null>(null)

  useEffect(() => {
    const syncSession = () => {
      setSession(readAdminSession())
    }

    syncSession()

    window.addEventListener(ADMIN_SESSION_EVENT, syncSession)
    window.addEventListener("storage", syncSession)

    return () => {
      window.removeEventListener(ADMIN_SESSION_EVENT, syncSession)
      window.removeEventListener("storage", syncSession)
    }
  }, [])

  return {
    session,
    isLoggedIn: Boolean(session),
    logout: clearAdminSession,
  }
}
