'use client'

import { useState, useEffect, useRef } from 'react';
import styles from '../../styles/Jukebox.css';
import Image from "next/image"
import jukeboxImg from '/public/jukebox-main.png'
import Marquee from 'react-fast-marquee';
import { digitBoard, transferPlayback, findTrack, changeVolume } from './jukeboxUtils'
import { getPlaylists, BuildPlaylistCard } from '@/app/utils/playlist';
import { Knob } from "react-rotary-knob";
import knobSkin from '../ui/knobskin'

const track = {
    name: "",
    album: {
        images: [
            { url: "" }
        ]
    },
    artists: [
        { name: "" }
    ]
}

export const JukeboxPlayer = (token) => {

    const [player, setPlayer] = useState(undefined);
    const [is_paused, setPaused] = useState(true);
    const [is_active, setActive] = useState(false);
    const [current_track, setTrack] = useState(track);
    const [deviceId, setDeviceid] = useState('')
    const [index, setIndex] = useState(0)
    const [total, setTotal] = useState(0)
    const [playlists, setPlaylists] = useState(null)
    const [leftPlaylist, setleftPlaylist ] = useState([])
    const [rightPlaylist, setrightPlaylist ] = useState([])
    const [leftbackPlaylist, setleftbackPlaylist ] = useState([])
    const [rightbackPlaylist, setrightbackPlaylist ] = useState([])
    const [flipState, setFlipstate ] = useState('')
    const [digitData, setDigitData] = useState('')
    const [volume, setVolume] = useState(0.2)
    const [volumeDisplay, setVolumeDisplay] = useState('')
    const [coins, setCoins] = useState(0)
    const [coinsDisplay, setCoinsDisplay] = useState(coins)
    const leftBackRef = useRef();
    const rightBackRef = useRef();
    
    async function fetchPlaylists() {
        const data = await getPlaylists(token)
        let { 'total': total_res, 'playlists': playlists_res } = data
        
        setTotal(total_res)
        console.log('total is: ', total)
        setPlaylists(playlists_res)
    }

    function handleCoinButton(){
        if (is_active){
            setCoins((prevCoins) => prevCoins + 1)
        }
    }

    function nextPlaylist() {
        if (index < total + 1){
            setFlipstate('next')
            setIndex(Math.min((index + 2), total-2));
        }
    }
    
    function prevPlaylist() {
        if (index > 1){
            setFlipstate('prev')
            setIndex(Math.max((index - 2), 0));
        }
    }

    function nextTrack(){
        if (!is_paused){
            player.nextTrack()
        }
    }

    function prevTrack(){
        if (!is_paused){
            player.previousTrack()
        }
    }

    function togglePlay(){
        if (is_active && deviceId){
            player.togglePlay()
        }
    }

    const handleScrollLeft = (scroll) => {
        leftBackRef.current.scrollTop = scroll.target.scrollTop;
    };

    const handleScrollRight = (scroll) => {
        rightBackRef.current.scrollTop = scroll.target.scrollTop;
    };

    function handleClearQueue(){
        setDigitData('')
    }

    function handleQueue(){
        if (digitData){
            let playlistIndex = digitData.substring(0,2)
            let trackIndex = digitData.substring(2,5)

            if (playlistIndex.length != 2 || trackIndex.length != 3 || digitData.length != 5){
                setDigitData('Invalid request.')
                setTimeout(() => {
                    setDigitData('')
                }, 2000);
            }else if (coins < 1){
                setDigitData('Insufficient funds.')
                setTimeout(() => {
                    setDigitData('')
                }, 2000);
            }else{
            findTrack(playlists[Number(playlistIndex)].id, trackIndex, token)
            setDigitData('Queue successful. You have ' + (coins-1) + ' requests left.')
            setCoins((prevCoins) => prevCoins - 1)
            setTimeout(() => {
                setDigitData('')
            }, 2000);
            }
        }
    }

    function handleVolume(newVol){
        // set max vol limit
        if (Math.abs(volume - newVol) > 20){
            return
        }else{
            setVolume(newVol)
            setVolumeDisplay(newVol)
            setTimeout(() => {
                setVolumeDisplay('')
            }, 1000);
        }
    }

    function handleNumberChange(newNumber) {
        if (deviceId && !digitData.includes('.')){
            setDigitData((prevNumber) => prevNumber + newNumber)
        }
    }

    useEffect(() => {
        if (token){

            const script = document.createElement("script");
            script.src = "https://sdk.scdn.co/spotify-player.js";
            script.async = true;
        
            document.body.appendChild(script);
        
            window.onSpotifyWebPlaybackSDKReady = () => {

                const player = new window.Spotify.Player({
                    name: 'My Jukebox',
                    getOAuthToken: cb => { cb(token); },
                    volume: volume
                });

                setPlayer(player);

                player.addListener('ready', ({ device_id }) => {
                    setDeviceid(device_id)
                    console.log('Ready with Device ID', device_id);
                });

                player.addListener('not_ready', ({ device_id }) => {
                    console.log('Device ID has gone offline', device_id);
                });


                player.addListener('player_state_changed', ( state => {

                    if (!state) {
                        return;
                    }
                
                    setTrack(state.track_window.current_track);
                    setPaused(state.paused);
                
                
                player.getCurrentState().then( state => { 
                    (state)? setActive(true) : setActive(false) 
                    });
                }));

                player.getVolume().then(currVolume => {
                    setVolume(currVolume*100)
                    console.log(`The volume of the player is ${currVolume}%`);
                  });
                

                player.connect();

            };
        }

    }, [token]);

    useEffect(() => {
        if (playlists){
            if (index >= 0 && index < total){
                setleftPlaylist(playlists[index])
                setTimeout(() => {
                    setleftbackPlaylist(playlists[index])
                }, 2000);
            }else{
                setleftPlaylist([])
                setleftbackPlaylist([])
            }
            if (index < total + 1){
                setrightPlaylist(playlists[index+1])
                setTimeout(() => {
                    setrightbackPlaylist(playlists[index+1])
                }, 2000);
                
            }else{
                setrightPlaylist([])
                setrightbackPlaylist([])
            } 
        }
    }, [index, playlists, total])

    useEffect(() => {
        if (volume && is_active){
            player.setVolume(volume/100)
        }
    }, [volume])

    useEffect(() => {
        if (!digitData){
            setCoinsDisplay(coins)
            setTimeout(() => {
                setCoinsDisplay('')
            }, 1000);
        }
    }, [coins])

    useEffect(() => {
        if (!deviceId){
            setDigitData('Loading your library...')
        }else{
            setDigitData('')
            transferPlayback(token, deviceId)
            fetchPlaylists()
        }
    }, [deviceId])

    return (
        <>
            <div className='jukeboxcontainer'>
                <Image 
                    src={jukeboxImg} 
                    width="0"
                    height="0"
                    sizes="100vw"
                    className="w-full h-auto"
                    priority="true"
                    loading='eager'
                    alt='jukebox'
                />
                <div className='jukeboxpanel'>
                    <div className='controlpanel flex flex-row'>
                        <div className='playlistcontrols flex flex-col basis-1/6 place-content-end'>
                            <div className='playlist-nav-btns h-full flex flex-row place-content-center self-center'>
                                <div className='playlist-nav-btn-back place-content-center self-center'>
                                    <button className='playlist-nav-btn place-content-center' onClick={prevPlaylist}>
                                        ◄
                                    </button>
                                </div>
                                <div className='playlist-nav-btn-back self-center'>
                                    <button className='playlist-nav-btn' onClick={nextPlaylist}>
                                        ►
                                    </button>
                                </div>
                            </div>

                            <div className='control-buttons flex flex-row'>
                                <div className='flex song-nav-btn-back basis-2/5 place-content-center'>
                                    <button className="flex song-nav-btn" onClick={prevTrack} >
                                        &#9198;
                                    </button>
                                </div>
                                <div className='flex song-nav-btn-back basis-1/5 place-content-center'>
                                    <button className="song-nav-btn" onClick={togglePlay} >
                                        ⏯
                                    </button>
                                </div>
                                <div className='flex song-nav-btn-back basis-2/5 place-content-center'>
                                    <button className="song-nav-btn" onClick={nextTrack} >
                                        ⏭
                                    </button>
                                </div> 
                            </div>
                        </div>
                       
                       
                        <div className='nowplaying-container flex flex-shrink-0 basis-1/3 justify-center items-center'>
                            {
                                (digitData || volumeDisplay || coinsDisplay) ? 
                                (volumeDisplay) ?  
                                'Volume: '+Math.round(volumeDisplay)+'%' :
                                (coinsDisplay) ? 
                                'Coins: '+coinsDisplay :
                                digitData :
                                <Marquee direction='right' className='nowplaying flex-shrink-0 basis-1/3'>
                                    <div className='nowplaying text-left flex flex-col'>
                                        <div className='nowplaying text-left flex flex-row'> 
                                            {is_active && <div>&nbsp;Now playing:&nbsp;</div>} { current_track.artists[0].name } 
                                            {is_active && <div>&nbsp;-&nbsp;</div>} 
                                            { current_track.name }
                                        </div>
                                        <div className='text-left instructions'>
                                            {is_active && <div>To play songs, enter playlist number followed by track number&nbsp;&nbsp;</div>}
                                        </div> 
                                    </div>
                                </Marquee>
                            }
                        </div>                      

                        <div className='jukeboxcontrols basis-1/3 flex flex-row items-center justify-center'>
                                {digitBoard(handleNumberChange)}
                            <div className='queue-buttons flex flex-row items-center justify-center'>
                                <div className='submit-track-back flex items-center justify-center'>
                                    <button className='submit-track items-center justify-center' type="submit" onClick={handleQueue}>
                                    </button>
                                </div>
                                <div className='clear-track-back flex items-center justify-center'>
                                    <button className='clear-track items-center justify-center' type="submit" onClick={handleClearQueue}>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex basis-1/6 knobBack place-items-center">
                            <Knob
                                style={{ width: "100%", height: "100%" }}
                                min={0}
                                max={100}
                                value={volume}
                                preciseMode={false}
                                onChange={handleVolume}
                                skin={knobSkin}
                            />
                        </div>
                    </div>

                    <div className='trackselector flex flex-row text-xs'>
                        {BuildPlaylistCard(token, leftbackPlaylist, index, 'left-back', leftBackRef, ()=>{}, flipState)}
                        {BuildPlaylistCard(token, leftPlaylist, index, 'left', leftBackRef, handleScrollLeft, flipState)}
                        {BuildPlaylistCard(token, rightPlaylist, index+1, 'right', rightBackRef, handleScrollRight, flipState)}
                        {BuildPlaylistCard(token, rightbackPlaylist, index+1, 'right-back', rightBackRef, ()=>{}, flipState)}
                    </div>
                </div>
                <div className='coinslotcontainer flex place-content-end'>
                        <Image 
                            src={'/coinslot.png'}
                            width="0"
                            height="0"
                            sizes="100vw"
                            className="w-8/12 h-auto"
                            priority="true"
                            alt='coinslot'
                        />
                        <div className='coinslot-btn-back flex place-content-center' onClick={handleCoinButton} >
                            <button className='coinslot-btn flex self-center'  onClick={handleCoinButton}>
                            </button>
                        </div>
                </div>
            </div>
         </>
    )
}

export default JukeboxPlayer;