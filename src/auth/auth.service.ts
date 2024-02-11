import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

export async function signInWithAzure() {
    dotenv.config()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
            scopes: 'email',
        }
    })

    if (error) {
        console.error('Error during sign in:', error)
    } else {
        console.log('Signed in:', data)
    }

    return { data, error }
}

export async function signOut() {
    dotenv.config()
    const supabaseUrl = process.env.SUPABASE_URL || ''
    const supabaseKey = process.env.SUPABASE_KEY || ''
  const supabase = createClient(supabaseUrl, supabaseKey)
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error during sign out:', error)
  } else {
    console.log('Signed out')
  }

  return { error }
}