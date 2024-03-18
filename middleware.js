export { default } from 'next-auth/middleware';

export const config = {matcher: ['/playlists', '/jukebox/:path*']}