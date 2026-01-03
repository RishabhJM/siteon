import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)','/sign-up(.*)','/','/api(.*)'])

export default clerkMiddleware(async (auth, req) => {
  console.log("MIDDLEWARE - URL:", req.url);
  if (!isPublicRoute(req)) {
    console.log("PROTECTING ROUTE:", req.url);
    await auth.protect()
  }
})

// export default function middleware(req: NextRequest) {
//   console.log("MIDDLEWARE - URL:", req.url);
//   return NextResponse.next();
// }



export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};