'use client'

import styles from '../styles/Home.module.css';
import Myheader from "../components/ui/components";
import JukeboxPlayer from '../components/jukeboxPlayer';

export default function Page(){

  return (
    <main>
      <div className={styles.container}>
        <Myheader />
        <JukeboxPlayer />
      </div>
    </main>
  );
}