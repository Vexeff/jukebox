'use client'

import { BuildPlaylistCard, getPlaylist, getPlaylists, playlistData, playlistsData, SpotifyPlaylist, tracklistData } from '@/app/utils/playlist';
import { useSession } from 'next-auth/react'
import { stringify } from 'querystring';
import { useEffect, useState } from "react";
import styles from '../../styles/Home.module.css';
import { Button } from "../ui/components";
import JukeboxPlayer from './jukeboxPlayer';


export default function Jukebox(){

    const { data: session, status } = useSession()
    const token = session?.accessToken

    

    return (
      <div className={styles.container}>
          {JukeboxPlayer(token)}
      </div>
    );
}
