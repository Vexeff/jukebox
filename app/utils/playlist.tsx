'use client'

import Link from "next/link";
import Image from "next/image"
import { stringify } from 'querystring';
import { UIEventHandler, useEffect, useState } from "react";
import { useSpring, animated } from '@react-spring/web';

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
  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}?fields=name,tracks(href,total,items)`, {                    
              headers: {
                  Authorization: `Bearer ${token}`
              }
          }).then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok'); // Handle non-200 responses
            }
            console.log(`Response was okay. Got playlist with id: ${playlistId}`)
            return response.json()}); // Parse JSON from response body
  return response
}

// using await
export async function getPlaylists(token: string){
  const response = await fetch(`https://api.spotify.com/v1/me/playlists?limit=50`, {
      headers: {
          Authorization: `Bearer ${token}`
      }
  });
  if (!response.ok) {
    throw new Error('Network response was not ok'); // Handle non-200 responses
  }
  console.log('Response was okay. Got max 50 user playlists.');
  const data = await response.json();
  let { total, 'items': playlists } = data;
  
  return {total, playlists};
}

/**
 * 
 * @param {*} playlistdata 
 * 
 * Returns array of data converted into array of playlistData format as defined
 * in components.tsx
 * 
 */
export function convertPlaylistsData(playlistsdata: SpotifyPlaylist[]){
    if (playlistsdata.length === 0){
      return [] as playlistData[]
    }
    console.log('IMPLEMENT MULTI-PAGE SCROLL OPTION FOR PLAYLISTS.')
    
    const newPlaylistsdata = playlistsdata.map((item) => {

        let { 'id': id, 'images': artwork, 'name': title, 'tracks': tracks} = item
        let { 'total': trackCount } = tracks
        let artwork_url = artwork[0].url

        return {id, title, trackCount, artwork_url}
    })
    
    return newPlaylistsdata
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
  const [index, setIndex] = useState(0);

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
        const { 'tracks': trackData } = await getPlaylist(token, playlist.id);
        const tracks: trackData[] = trackData.items;
        const artwork_url = playlist.images[0].url;

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

  if (!(playlist.id && artworkUrl && (tracklist.length != 0))){
    return <></>
  }

  return (
    <div 
    key={playlist.id+identity} 
    className={`${identity} ${identity}-${flipState} playlistcontainer flex flex-col`}>
      <div className="playlistmetas flex flex-row">
        <div className="playlistname basis-2/3">
          {playlist.name}
        </div>
        <div className="playlistnumber basis-1/3 text-2xl">
          {index.toString().padStart(2, '0')}
        </div>
      </div>
      <div className="flex flex-row playlistinfo">
        <div className={`tracklist ${identity}-tracklist`} ref={ref} onScroll={scrollEvent}>
          <ol className="list-decimal">
            {tracklist.map((item, index_) => (
              <li key={item.track.id+index_} className="relative">
                {item.track.name}      
              </li>
            ))}
          </ol>
        </div>
        <div className="playlistcover">
          <img src={artworkUrl} alt="" className="object-contain object-right-top" />
        </div>
      </div>
    </div>
  );
}

export function PlaylistView(files: playlistData[]){
  if (files.length === 0){
    return <></>
  }
  return (
    <ul role="list" className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
      {files.map((file) => (
        <li key={file.id} className="relative">
          <div className="group aspect-h-7 aspect-w-10 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
            <Link href = {`/jukebox/${file.id}`}>
            <img src={file.artwork_url} alt="" className="pointer-events-none object-cover group-hover:opacity-75" />
            </Link>
          </div>
          <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">{file.title}</p>
          <p className="pointer-events-none block text-sm font-medium text-gray-500">{file.trackCount}</p>
        </li>
      ))}
    </ul>
  )
}

export default convertPlaylistsData;