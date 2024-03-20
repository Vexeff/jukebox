'use client'

import styles from '../styles/Home.module.css';
import { useSession } from 'next-auth/react'
import Myheader from "../components/ui/components";
import JukeboxPlayer from '../components/jukeboxPlayer';

export default function Page(){

  const { data: session } = useSession()
  const token = session?.accessToken

  return (
    <main>
        {Myheader()}
      <div className={styles.container}>
          {JukeboxPlayer(token)}
      </div>
    </main>
  );
}