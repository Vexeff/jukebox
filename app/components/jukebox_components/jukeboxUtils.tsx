'use client'

import { BuildPlaylistCard, getPlaylist, getPlaylists, playlistData, playlistsData, SpotifyPlaylist, tracklistData, trackData } from '@/app/utils/playlist';

export async function getPlaybackState(token: string) {
    fetch("https://api.spotify.com/v1/me/player", {                    
              headers: {
                  Authorization: `Bearer ${token}`
              }
          }).then(response => {
              if (!response.ok) {
                  throw new Error('Network response was not ok'); // Handle non-200 responses
              }
              if (response.status === 204){
                console.log('No live session')
                return
              }
              console.log('Response was okay. Got playback state', response.status)
              return response.json(); // Parse JSON from response body
          }).then(data => {
          console.log('Current device id: ', data.device.id)
          return data.device.id
          })
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
            console.log('Response was okay. Transferred playback.')
        })
}

async function queueTrack(trackUri: string, token:string){
    fetch(`https://api.spotify.com/v1/me/player/queue?uri=${trackUri}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok'); // Handle non-200 responses
            }
            console.log(`Response was okay. Queued ${trackUri}.`)
        })
}

export async function changeVolume(volume: number, token: string){
    console.log('Trying with volume: ', volume)
    fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok'); // Handle non-200 responses
            }
            console.log(`Response was okay. Adjusted volume.`)
        })
}

export async function findTrack(playlistId: string, trackIndex: string, token:string) {
    let trackInd = Number(trackIndex)-1 //indexing correction
    const { 'tracks': trackData } = await getPlaylist(token, playlistId);
    const tracks: trackData[] = trackData.items;
    const trackUri: string = tracks[trackInd].track.uri
    console.log('Got uri: ', trackUri)
    queueTrack(trackUri, token)
}

function digitButton(
    digit: number, 
    onClickFunction:  (digit:number)=> void){
    
    return(
        <div className='digit-btn-back'>
            <button className={`${digit}-btn digit-btn`} type='button' onClick={() => onClickFunction(digit)} >
                {digit}
            </button>
        </div>
    )
}


export function digitBoard(onNumberChange: (newNumber: string)=>{}){

    const handleDigitClick = (digit:number) => {
        onNumberChange(digit.toString())
    };

    return (
        <div className='digitboard flex flex-row'>
                {[...Array(10)].map((_, index) => (
                    <div key={index} className='digitboard-btn flex flex-col'>
                        <div className='flex button-val'>
                            {index}
                        </div>
                        {digitButton(index, handleDigitClick)}
                    </div>
                ))}
        </div>
    );
};