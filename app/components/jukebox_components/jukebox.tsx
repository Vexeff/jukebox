'use client'

import { useSession } from 'next-auth/react'
import styles from '../../styles/Home.module.css';
import JukeboxPlayer from './jukeboxPlayer';

export default function Jukebox(){

    const { data: session } = useSession()
    const token = session?.accessToken
    
    return (
      <div className={styles.container}>
          {JukeboxPlayer(token)}
      </div>
    );
}
