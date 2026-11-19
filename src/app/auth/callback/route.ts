import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Validates that redirect paths are strictly internal relative destinations.
 * Protects against open-redirect attacks.
 */
function sanitizeRedirect(target: string | null | undefined, fallback: string = '/'): string {
  if (!target) return fallback;
  const trimmed = target.trim();

  // Must begin with a single '/' and not with '//' or contain backslashes
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return fallback;
  }

  try {
    const dummyOrigin = 'http://localhost';
    const parsed = new URL(trimmed, dummyOrigin);
    if (parsed.origin !== dummyOrigin) {
      return fallback;
    }
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return fallback;
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');
  const safeNext = sanitizeRedirect(next, '/');

  if (code) {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session?.user) {
      // Check if user has a COMPLETE profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, first_name')
        .eq('id', session.user.id)
        .single();

      // Redirect if no profile or if core details are missing
      if (!profile || !profile.username || !profile.first_name) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      return NextResponse.redirect(`${origin}${safeNext}`);
    }

    // Handle the specific "email already exists" case during exchange
    if (error?.message.includes('Account already exists')) {
      return NextResponse.redirect(
        `${origin}/login?error=This email is already registered. Please login with your password.`
      );
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}
