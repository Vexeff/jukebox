'use client'

import { useState, useEffect, useRef } from 'react';
import styles from '../../styles/Jukebox.css';
import Image from "next/image"
import jukeboxImg from '/public/jukebox-main.png'
import Marquee from 'react-fast-marquee';
import { stringify } from 'querystring';
import { digitBoard, transferPlayback, findTrack, changeVolume } from './jukeboxUtils'
import { getPlaylists, BuildPlaylistCard } from '@/app/utils/playlist';
import VolumeKnob from './volumeKnob';

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

export const JukeboxPlayer = (token, playlistId) => {

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
    const leftBackRef = useRef();
    const rightBackRef = useRef();
    
    
    async function fetchPlaylists() {
        const data = await getPlaylists(token)
        let { 'total': total_res, 'playlists': playlists_res } = data
        
        setTotal(total_res)
        console.log('total is: ', total)
        setPlaylists(playlists_res)
    }

    function loadJukebox(){
        if (!is_active && is_paused && deviceId){
            transferPlayback(token, deviceId)
            fetchPlaylists()
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

    function volumeUp(){
        if (is_active && deviceId){
            setVolume((prevNumber) => prevNumber < 100 ? prevNumber + 1 : prevNumber)
        }
    }

    function volumeDown(){
        if (is_active && deviceId){
            setVolume((prevNumber) => prevNumber > 1 ? prevNumber - 1 : prevNumber)
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
        if (!playlists){
            setDigitData('Jukebox is disconnected.')
            setTimeout(() => {
                setDigitData('')
            }, 2000);
        }else{
            let playlistIndex = digitData.substring(0,2)
            let trackIndex = digitData.substring(2,5)

            if (playlistIndex.length != 2 || trackIndex.length != 3 || digitData.length != 5){
                setDigitData('Invalid request.')
                setTimeout(() => {
                    setDigitData('')
                }, 2000);
            }else{
            findTrack(playlists[Number(playlistIndex)].id, trackIndex, token)
            setDigitData('Queue successful.')
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
        }
    }

    function handleNumberChange(newNumber) {
        if ((digitData != 'Jukebox is disconnected.') && (digitData != 'Queue succesful.') && (digitData != 'Invalid request.'))
            setDigitData((prevNumber) => prevNumber + newNumber)
        };

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
            if (index == 0){
                setleftPlaylist(playlists[index])
                setleftbackPlaylist(playlists[index])
                setrightPlaylist(playlists[index+1])
                setrightbackPlaylist(playlists[index+1])
            }else{
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
        }
    }, [index, playlists])

    useEffect(() => {
        if (volume && is_active){
            player.setVolume(volume/100)
        }
    }, [volume])

    return (
        <>
            <div className='jukeboxcontainer'>
                <Image src={jukeboxImg} 
                            width="0"
                            height="0"
                            sizes="100vw"
                            className="w-full h-auto"
                            priority="true"
                            alt='jukebox'
                />
                <div className='jukeboxpanel'>
                    <div className='controlpanel align-baseline	flex flex-row'>
                        <div className='playlistcontrols flex flex-col basis-1/6'>
                            <div className='playlist-nav-btns flex flex-row place-items-center'>
                                <div className='playlist-nav-btn-back'>
                                    <button className='playlist-nav-btn' onClick={prevPlaylist}>
                                        &lt;
                                    </button>
                                </div>
                                <div className='playlist-nav-btn-back'>
                                    <button className='playlist-nav-btn' onClick={nextPlaylist}>
                                        &gt;
                                    </button>
                                </div>
                            </div>
                            <div className='control-buttons flex flex-row justify-items-center'>
                                <div className='flex song-nav-btn-back basis-2/5 justify-center'>
                                    <button className="song-nav-btn" onClick={prevTrack} >
                                        &lt;&lt;
                                    </button>
                                </div>
                                <div className='flex song-nav-btn-back basis-1/5 justify-center'>
                                    <button className="song-nav-btn" onClick={togglePlay} >
                                    { is_paused ? 
                                    <Image src={'/playbutton.jpeg'} 
                                    width="2"
                                    height="2"
                                    className="w-auto h-auto"
                                    priority="true"
                                    alt='play'
                                    /> : 
                                    <Image src={'/pausebutton.jpeg'} 
                                    width="4"
                                    height="4"
                                    className="w-auto h-auto"
                                    priority="true"
                                    alt='pause'
                                    /> }
                                </button>
                                </div>
                                <div className='flex song-nav-btn-back basis-2/5 justify-center'>
                                    <button className="song-nav-btn" onClick={nextTrack} >
                                        &gt;&gt;
                                    </button>
                                </div> 
                            </div>
                        
                        </div>
                       
                       {digitData ? 
                        <Marquee direction='right' className='flex-shrink-0 nowplaying basis-1/3'>
                            {digitData}
                        </Marquee> : 
                        <Marquee direction='right' className='flex-shrink-0 nowplaying basis-1/3'>
                            <div className='text-left flex flex-col'>
                                <div className='text-left flex flex-row now-playing'> 
                                    {is_active && <div>&nbsp;Now playing:&nbsp;</div>} { current_track.artists[0].name } 
                                    {is_active && <div>&nbsp;-&nbsp;</div>} 
                                    { current_track.name }
                                </div>
                                <div className='text-left instructions'>
                                {is_active && <div>To play songs, enter playlist number followed by track number&nbsp;&nbsp;</div>}
                                </div> 
                            </div>
                        </Marquee>}

                        <div className='jukeboxcontrols basis-1/3 flex flex-row items-center'>
                                {digitBoard(handleNumberChange)}
                            <div className='submit-track-back'>
                                <button className='submit-track' type="submit" onClick={handleQueue}>
                                </button>
                            </div>
                            <div className='clear-track-back'>
                                <button className='clear-track' type="submit" onClick={handleClearQueue}>
                                </button>
                            </div>
                        </div>
                        
                        <div className='songcontrols flex flex-col basis-1/6 justify-items-center justify-center'>
                            <div className='genButtons flex flex-row justify-items-center'>
                                <div className='flex basis-4/5 justify-center items-end'>
                                    {VolumeKnob(volume, handleVolume)}
                               </div>
                                <div className='flex power-button-back basis-1/5 justify-center items-end'>
                                    <div className='power-btn-bg justify-center items-center flex'>
                                        <button className='flex power-button justify-center align-middle' onClick={loadJukebox}>
                                            <Image src={'/powerbutton.png'} 
                                                width="20"
                                                height="20"
                                                className="w-auto h-auto"
                                                alt='powerbtn'
                                            />
                                        </button> 
                                    </div>
                                </div> 
                            </div>
                        </div>
                    </div>
                    <div className='trackselector flex flex-row text-xs'>
                        {BuildPlaylistCard(token, leftbackPlaylist, index, 'left-back', leftBackRef, ()=>{}, flipState)}
                        {BuildPlaylistCard(token, leftPlaylist, index, 'left', leftBackRef, handleScrollLeft, flipState)}
                        {BuildPlaylistCard(token, rightPlaylist, index+1, 'right', rightBackRef, handleScrollRight, flipState)}
                        {BuildPlaylistCard(token, rightbackPlaylist, index+1, 'right-back', rightBackRef, ()=>{}, flipState)}
                    </div>
                </div>
            </div>
         </>
    )
}

export default JukeboxPlayer;