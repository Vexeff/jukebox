'use client'

import Myheader from "../components/ui/components";
import Jukebox from '../components/jukebox_components/jukebox';


export default function Page(){

  return (
    <main>
      {Myheader()}
      {Jukebox()}
    </main>
  );
}