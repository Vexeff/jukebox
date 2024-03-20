import type { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import SpotifyProvider from "next-auth/providers/spotify";

declare module 'next-auth' {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
      accessToken?: string
    }
  }

declare module 'next-auth/jwt' {
    interface JWT {
        accessToken?: string
        refreshToken?: string
        accessTokenExpires?: number
    }
}

const scopes = [
    "user-read-private",
    "playlist-read-private",
    "playlist-read-collaborative",
    "user-read-currently-playing",
    "user-read-playback-state",
    "user-modify-playback-state",
    "streaming"
].join(",")

const params = {
    scope: scopes
}

const LOGIN_URL = "https://accounts.spotify.com/authorize?" + new URLSearchParams(params).toString();


async function refreshAccessToken(token: JWT) {
    const params = new URLSearchParams()
    params.append("grant_type", "refresh_token")
    params.append("refresh_token", token.refreshToken as string)
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            'Authorization': 'Basic ' + (new (Buffer as any).from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_SECRET).toString('base64'))
        },
        body: params
    })
    const data = await response.json()
    return {
        ...token,
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? token.refreshToken,
        accessTokenExpires: Date.now() + data.expires_in * 1000
    }
}

export const options: NextAuthOptions = {
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID as string,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
            authorization: LOGIN_URL
          }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/"
    },
    callbacks: {
        async jwt({ token, account }) {
          // Persist the OAuth access_token and or the user id to the token right after signin
            if (account) {
                token.accessToken = account.access_token
                token.refreshToken = account.refresh_token
                token.accessTokenExpires = account.expires_at
                return token
            }
          
            if (token.accessTokenExpires && (Date.now() < (token.accessTokenExpires * 1000))){
                return token
            }
            
            return await refreshAccessToken(token)
        },

        async session({ session, token}) {
            // Send properties to the client, like an access_token and user id from a provider.
            session.accessToken = token.accessToken

            return session
        }
      } 
}



