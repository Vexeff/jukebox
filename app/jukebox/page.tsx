'use client'

import Myheader from "../components/ui/components";
import Jukebox from '../components/jukebox_components/jukebox';


export default function Page(){

  const ELYSSE_playlistId: string = '2FzgJi6mSI8IKdTkqLkN9C';

  return (
    <main>
      {Myheader()}
      {Jukebox(ELYSSE_playlistId)}
    </main>
  );
}