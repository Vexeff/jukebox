'use client'

import { UIEventHandler, useEffect, useState } from "react";


export interface SpotifyPlaylist{
  id: string,
  name: string, 
  href: string,
  images: [{
    url: string
    height: number
    width: number
  }],
  tracks: {
    href: string
    total: number
  }
}

export interface playlistsData {
  total: number
  items: SpotifyPlaylist[]
}

export interface playlistData {
  id: string
  title: string
  trackCount: number
  artwork_url:  string
  tracks: trackData[]
}

export interface trackData {
  track:{
    id: string
    uri: string
    name: string
    artists: {
      name: string
      }
    album: {
      name: string
      images: [{
        url: string
      }]
      }
    }
}

export interface tracksData {
  href: string
  total: number
}

export interface tracklistData {
  href: string
  limit: number
  total: number
  items: trackData[]
}

export async function getPlaylist(token: string, playlistId: string){
  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}?fields=name,tracks(href,total,items),external_urls`, {                    
              headers: {
                  Authorization: `Bearer ${token}`
              }
          }).then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok'); // Handle non-200 responses
            }
            return response.json()}); // Parse JSON from response body
  return response
}

// using await
export default async function getPlaylists(token: string){
  const response = await fetch(`https://api.spotify.com/v1/me/playlists?limit=50`, {
      headers: {
          Authorization: `Bearer ${token}`
      }
  });
  if (!response.ok) {
    throw new Error('Network response was not ok'); // Handle non-200 responses
  }
  const data = await response.json();
  let { total, 'items': playlists } = data;
  
  return {total, playlists};
}

export function BuildPlaylistCard(
  token: string,
  playlist: SpotifyPlaylist,
  givenIndex: number, 
  identity: string,
  ref: string,
  scrollEvent: UIEventHandler<HTMLDivElement>, 
  flipState: string){


  const [tracklist, setTracklist ] = useState([] as trackData[])
  const [artworkUrl, setArtworkUrl ] = useState('')
  const [ playlistUrl, setPlaylisturl ] = useState('')
  const artworkPallette = '#191414'
  const [index, setIndex] = useState(0);
  
  const apiKey = 'acc_dca6cc13d468e41';
  const apiSecret = 'ddb670fbd24f5e1f598bfc39e4a3e888';

  /**
   * identity is left or right
   * flipstate is prev or next
   * 
   * We have four cases here: prev-left, prev-right, next-left, or next-right
   * 
   * 
   */

  useEffect(() => {
    // call getPlaylist inside useEffect to avoid calling it on every render
    async function fetchPlaylist() {
        // check the status and data of the response
        const { 'tracks': trackData, 'external_urls': playlist_url} = await getPlaylist(token, playlist.id);
        const tracks: trackData[] = trackData.items;

        let artwork_url = 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'

        if (playlist.images){
          artwork_url = playlist.images[0].url;
          }
        
        setPlaylisturl(playlist_url.spotify)
         // update the state with the tracks
        setTracklist(tracks);
        // update artworkUrl
        setArtworkUrl(artwork_url)
        setIndex(givenIndex)
    }

    // only call fetchPlaylist if playlist is not null or undefined
    if (playlist.id) {
      fetchPlaylist();
    }

  }, [token, playlist]);

  if (!(playlist.id && artworkUrl)){
    return <></>
  }


  return (
    <div 
    key={playlist.id+identity} 
    className={`${identity} ${identity}-${flipState} playlistcontainer bg-[${artworkPallette}] flex flex-col`}>
      <div className="playlistmetas flex flex-row">
        <div className="playlistname basis-2/3 text-wrap text-ellipsis overflow-hidden">
          {playlist.name}
        </div>
        <div className="playlistnumber basis-1/3 text-2xl">
          {index.toString().padStart(2, '0')}
        </div>
      </div>
      <div className={`flex flex-row playlistinfo`}>
        <div className={`tracklist ${identity}-tracklist`} ref={ref} onScroll={scrollEvent}>
          <ol className="list-decimal">
            {tracklist.map((item, index_) => ( item.track ? 
              <li key={item.track.id+index_} className="relative">
                {item.track.name ? item.track.name : 'Unknown'}      
              </li> : 
                <li key={index_} className="relative">
                Unknown     
              </li>
            ))}
          </ol>
        </div>
        <div className="playlistcover flex-col">
          <a href={playlistUrl} target='_blank' onClick={(e) => {!confirm(`Open ${playlistUrl} in new tab?`) ? e.preventDefault() : true}}>
          <img src={artworkUrl} alt="artwork" className="object-contain object-right-top" /></a>
        </div>
      </div>
    </div>
  );
}

export async function transferPlayback(token: string, deviceId: string) {
  fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
              Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
          'device_ids': [
              `${deviceId}`
          ]
      })
      }).then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok'); // Handle non-200 responses
          }
      })
}

export async function queueTrack(playlistId: string, trackIndex: string, token:string){

  let trackInd = Number(trackIndex)-1 //indexing correction
  const { 'tracks': trackData } = await getPlaylist(token, playlistId);
  const tracks: trackData[] = trackData.items;

  let trackUri: string = ''

  if (tracks[trackInd]){
    trackUri = tracks[trackInd].track.uri
  }else{
    return(false)
  }
  

  const response = await fetch(`https://api.spotify.com/v1/me/player/queue?uri=${trackUri}`, {
          method: 'POST',
          headers: {
              Authorization: `Bearer ${token}`
          }
      })
  
  if (!response.ok) {
    return(Promise.resolve(false))
  }else{
    return(Promise.resolve(true))
  }
}

export async function getCurrentUser(token: string) {
  const res = await fetch('https://api.spotify.com/v1/me', {
          method: 'GET',
          headers: {
              Authorization: `Bearer ${token}`
          }
      })
  
  const user = await res.json()
  return user
}
