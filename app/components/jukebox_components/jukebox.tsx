'use client'

import { BuildPlaylistCard, getPlaylist, getPlaylists, playlistData, playlistsData, SpotifyPlaylist, tracklistData } from '@/app/utils/playlist';
import { useSession } from 'next-auth/react'
import { stringify } from 'querystring';
import { useEffect, useState } from "react";
import styles from '../../styles/Home.module.css';
import { Button } from "../ui/components";
import JukeboxPlayer from './jukeboxPlayer';


export default function Jukebox(playlistId: string){

    const { data: session, status } = useSession()
    const token = session?.accessToken
  
    // get playlists data
    /* useEffect(() => {

      const fetchPlaylists = async () => {
        if (token ){
          const data = await getPlaylists(token)
          setPlaylistsData(data)
        }
      }

      if ((status != 'loading') && token){
       fetchPlaylists()
      }
    }, [status, token]); */
/* 
    useEffect(() => {

      const fetchTrackdata = async () => {
        if (token ){
          const { total, convertedData } = await trackDatabuilder(token, playlistsData)
          setTracksdata(convertedData)
          setTotal(total)
        }
      }
      if (token && playlistsData.total){
        fetchTrackdata()
      }

    }, [playlistsData, token]) */

    //const trackView = buildTrackview(total, convertedData)

    return (
      <div className={styles.container}>
          {JukeboxPlayer(token, playlistId)}
      </div>
    );
}
