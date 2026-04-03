import { createBrowserClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && session?.user) {
      // Check if user has a COMPLETE profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, first_name')
        .eq('id', session.user.id)
        .single()

      // Redirect if no profile or if core details are missing
      if (!profile || !profile.username || !profile.first_name) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }
      
      return NextResponse.redirect(`${origin}${next}`)

    }

    // Handle the specific "email already exists" case during exchange
    if (error?.message.includes('Account already exists')) {
      return NextResponse.redirect(`${origin}/login?error=This email is already registered. Please login with your password.`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}


