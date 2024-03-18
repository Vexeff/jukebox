'use client'

import Myheader from "../../components/ui/components";
import Jukebox from '../../components/jukebox_components/jukebox';

export default function Page({ params }: { params: { id: string } }){
  const playlistId = params.id;
  
    return (
              <main>
                {Myheader()}
                {Jukebox(playlistId)}
              </main>
    );
}