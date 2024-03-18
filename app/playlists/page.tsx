'use client'

import Myheader, { Button } from "../components/ui/components";
import {  } from "next-auth/react"
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from "react";
import styles from '../styles/Home.module.css';
import convertPlaylistsData , {playlistData, PlaylistView } from '../utils/playlist'

export default function Playlists(){

  const { data: session, status } = useSession()
  const [playlistText, setPlaylisttext] = useState('Your library is loading...')
  const [playlistsData, setPlaylistsData] = useState([] as playlistData[])
  const token = session?.accessToken

  useEffect(() => {
    if (status != 'loading'){
      fetch(`https://api.spotify.com/v1/me/playlists?limit=50`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok'); // Handle non-200 responses
          }
          console.log('Response was okay.')
          return response.json(); // Parse JSON from response body
        }).then(data => {
        setPlaylistsData(convertPlaylistsData(data.items))
        setPlaylisttext('Pick a playlist to jukeboxify!')
        })
    }

  }, [token, status])
  
  return (
            <main>  
              <div>       
                {Myheader()} 
              </div>
                <div className={styles.container}>
                <div className={styles.container_smaller}>
                  <div>
                  {playlistText}
                  </div>
                   
                  </div>
                  <div className={styles.container_smaller}>
                    {PlaylistView(playlistsData)}
                  </div>
                </div>
            </main>
  );
}