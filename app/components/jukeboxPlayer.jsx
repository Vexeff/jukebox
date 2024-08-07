'use client'

import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Jukebox.css';
import Image from "next/image"
import jukeboxImg from '/public/jukebox-main.png'
import Marquee from 'react-fast-marquee';
import digitBoard from '../utils/jukeboxUtils'
import  getPlaylists, { BuildPlaylistCard, transferPlayback, queueTrack, getCurrentUser } from '@/app/utils/spotifyUtils';
import { Knob } from "react-rotary-knob";
import knobSkin from './ui/knobskin'
import { useSession } from 'next-auth/react'

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

const elysse_id = '31s5fyehts6lzcppaev5jxv6mxc4'
// elysse_id = 'elysse.davega'


export const JukeboxPlayer = () => {

    const { data: session } = useSession()
    const token = session?.accessToken
    

    const [user, setUser] = useState('')
    const [isElysse, setIsElysse] = useState(false)
    const [premium, setPremium] = useState(false)
    const [player, setPlayer] = useState(undefined);
    const [is_paused, setPaused] = useState(true);
    const [is_active, setActive] = useState(false);
    const [current_track, setTrack] = useState(track);
    const [trackUrl, setTrackUrl] = useState('')
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
    const [infoHover, setInfoHover] = useState(false)
    const leftBackRef = useRef();
    const rightBackRef = useRef();
    
    async function fetchPlaylists() {
        const data = await getPlaylists(token)
        let { 'total': total_res, 'playlists': playlists_res } = data
        
        setTotal(total_res)
        setPlaylists(playlists_res)
    }

    function handleCoinButton(){
        if (is_active){
            setCoins((prevCoins) => prevCoins + 1)
        }
    }

    function nextPlaylist() {
        if (total < 3){
            setDigitData(`You only have ${total} playlists.`)
            setTimeout(() => {
                setDigitData('')
            }, 2000);
            return
        }
        if (index < total + 1){
            setFlipstate('next')
            setIndex(Math.min((index + 2), total-2));
        }   
    }
    
    function prevPlaylist() {
        if (total < 3){
            setDigitData(`You only have ${total} playlists.`)
            setTimeout(() => {
                setDigitData('')
            }, 2000);
            return
        }
        if (index > 0){
            setFlipstate('prev')
            setIndex(Math.max((index - 2), 0));
        }   
    }

    function nextTrack(){
        if (is_active){
            player.nextTrack()
        }
    }

    function prevTrack(){
        if (is_active){
            player.previousTrack()
        }
    }

    function togglePlay(){
        if (is_active){
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

            if (playlistIndex.length != 2 || digitData.length < 3 || digitData.length > 5){
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
                queueTrack(playlists[Number(playlistIndex)].id, trackIndex, token).then(response => 
                {   if (response){
                        setDigitData('Queue successful. You have ' + (coins-1) + ' requests left.')
                        setCoins((prevCoins) => prevCoins - 1)
                        setTimeout(() => {
                            setDigitData('')
                        }, 2000);
                    }else{
                        setDigitData('Queue unsuccessful. Try Again.')
                        setTimeout(() => {
                            setDigitData('')
                        }, 2000);
                    }
                })   
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
        }
    }

    function handleNumberChange(newNumber) {
        if (deviceId && !digitData.includes('.')){
            setDigitData((prevNumber) => prevNumber + newNumber)
        }
    }

    useEffect(() => {

        async function checkUserStat(token){
            const { product } = await getCurrentUser(token)
            return (product === 'free') ? false : true
        }

        if (token && !premium){
            checkUserStat(token).then( (res) => {
                if (res){
                    setPremium(true)
                }else{ 
                    setPremium(false)
                    setDigitData('This product is only available for Spotify Premium users.')
        }})
        }
    }, [token, premium])

    useEffect(() => {
        if (token && premium){
            
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
                    
                    
                    // get track
                    let curr_track = state.track_window.current_track
                    // get track url
                    let track_url = `https://open.spotify.com/${curr_track.uri.split(':')[1]}/${curr_track.uri.split(':')[2]}`
                    setTrackUrl(track_url)

                    setTrack(curr_track);
                    
                    setPaused(state.paused);
                
                
                player.getCurrentState().then( state => { 
                    (state)? setActive(true) : setActive(false) 
                    });
                }));
                
                if (is_active){
                    player.getVolume().then(currVolume => {
                        setVolume(currVolume*100)
                    });
                }

                player.connect();

            };
        }

    }, [token, premium]);

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
            let timeoutId = setTimeout(() => {
                setCoinsDisplay('')
            }, 1000);

            return () => {
                clearTimeout(timeoutId);
            };
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

    useEffect(() => {

        async function get_user(token){
            const user = await getCurrentUser(token)
            setUser(user.id)
            console.log('user: ', user.id)
        }

        if (token){
            get_user(token)
            
        }
    }, [token])

    useEffect(() => {

        if (user == elysse_id){
            setIsElysse(true)
        }

    }, [user])

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
                {/* {isElysse && <div className='absolute top bg-yellow z-50'> hi elysse </div>} */}
                    <div className='controlpanel flex flex-row'>
                        <div className='playlistcontrols flex flex-col basis-1/6 place-content-end'>
                            <div 
                            onMouseEnter={() => setInfoHover(true)}
                            onMouseLeave={() => setInfoHover(false)}
                            className='place-self-start absolute top-1 left-2 info-button flex'>
                                &#9432;
                                {infoHover && 
                                <div className=' bg-orange-300 z-50 text-sm p-2 min-w-10 absolute w-48 text-left'> 
                                    Click on Spotify logo to play track on Spotify. <br />
                                    Click on playlist artwork to play currently playing track on Spotify. <br />
                                    Follow instructions on Marquee to queue songs from your playlists. Tip: playlist numbers should be zero-padded. <br />
                                    Max. limit of 50 playlists and 100 tracks per playlists. <br />
                                    Don&apos;t forget the coins!
                                </div>}
                            </div>
                            <div className='playlist-nav-btns h-full flex flex-row place-content-center self-center'>
                                <div className='playlist-nav-btn-back self-center'>
                                    <button className='playlist-nav-btn' onClick={prevPlaylist}>
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
                       
                       
                        <div className='nowplaying-container bg-[#191414] flex flex-shrink-0 basis-1/3 justify-center items-center'>
                            {
                                (digitData || volumeDisplay || coinsDisplay) ? 
                                (volumeDisplay) ?  
                                'Volume: '+Math.round(volumeDisplay)+'%' :
                                (coinsDisplay) ? 
                                'Coins: '+coinsDisplay :
                                digitData :
                                <Marquee direction='left' className='nowplaying flex-shrink-0 basis-1/3'>
                                    <div className='nowplaying text-left flex flex-col'>
                                        <div className='nowplaying text-left flex flex-row'> 
                                            {is_active && <div>&nbsp;{is_paused ? 'Paused' : "Now playing"}:&nbsp;</div>} { current_track.artists[0].name } 
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

                        <div className='jukeboxcontrols basis-1/3 flex flex-row place-content-center items-center'>
                                {digitBoard(handleNumberChange)}
                            <div className='queue-buttons flex flex-col items-center'>
                                <div className='queue-btn flex place-content-center items-end'>
                                    <div className='submit-track-back flex place-content-center'>
                                        <button className='flex submit-track place-content-center text-[12px] items-center' type="submit" onClick={handleQueue}>
                                            OK
                                        </button>
                                    </div>
                                </div>
                                <div className='queue-btn flex place-content-center items-start'>
                                    <div className='clear-track-back flex place-content-center'>
                                        <button className='flex clear-track place-content-center text-[12px] items-center' type="submit" onClick={handleClearQueue}>
                                            RESET
                                        </button>
                                    </div>
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
                                onEnd={()=>{setTimeout(() => {setVolumeDisplay('')}, 500);}}
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
                            <button className='coinslot-btn flex self-center'>
                            </button>
                        </div>
                </div>
                <div className='spotify-logo-cont rounded-3xl'>
                    <a href={trackUrl} target='_blank' onClick={(e) => {!confirm(`Open ${trackUrl} in new tab?`) ? e.preventDefault() : true}}>
                    <img src={'/spotify.png'} 
                    alt='spotify-logo' 
                    className="spotify-logo min-w-[26] bg-yellow-300 rounded-full bg-opacity-80"/></a>
                </div>
            </div>
         </>
    )
}

export default JukeboxPlayer;