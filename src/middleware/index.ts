import { defineMiddleware } from 'astro:middleware'
import { supabase } from '../lib/supabase'

const PROTECTED_ROUTES = ['/app']
const AUTH_ROUTES = ['/login', '/register']

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context

  const accessToken  = cookies.get('sb-access-token')?.value
  const refreshToken = cookies.get('sb-refresh-token')?.value

  const isProtected = PROTECTED_ROUTES.some(route => url.pathname.startsWith(route))
  const isAuthRoute = AUTH_ROUTES.includes(url.pathname)

  if (accessToken && refreshToken) {
    const { data: { session }, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (!error && session) {
      // @ts-ignore
      context.locals.user = session.user
      // @ts-ignore
      context.locals.session = session

      cookies.set('sb-access-token', session.access_token, {
        path: '/',
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
      })

      if (isAuthRoute) return redirect('/app')
      return next()
    }
  }

  cookies.delete('sb-access-token', { path: '/' })
  cookies.delete('sb-refresh-token', { path: '/' })
  // @ts-ignore
  context.locals.user = null
  // @ts-ignore
  context.locals.session = null

  if (isProtected) return redirect('/login')

  return next()
})