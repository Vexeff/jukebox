import { Knob } from "react-rotary-knob";
import knobSkin from '../ui/knobskin'
import styles from '../../styles/volumeKnob.css';

export default function VolumeKnob( Volume, handleVolume){


    return (
        <div className="knobBack flex items-center justify-center">
            <Knob
                min={0}
                max={100}
                value={Volume}
                preciseMode={false}
                onChange={handleVolume}
                skin={knobSkin}
            />
        </div>
       
    );
};