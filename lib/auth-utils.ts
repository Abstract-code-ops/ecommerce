import { createClient } from "./supabase/server"


export async function getSession() {
  const supabase = await createClient()
  return await supabase.auth.getUser()
}

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) throw new Error("Authentication required")

  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(',').map(e => e.trim())
  const isAdmin = ADMIN_EMAILS.includes(user.email || '') || user.user_metadata?.role === 'admin'

  if (!isAdmin) throw new Error("Unauthorized: Admin access required")

  return { user, supabase } // Return the user and client to be reused
}