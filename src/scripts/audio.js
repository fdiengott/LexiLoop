import { start } from '../index'; 

export const currentStateObj = {
  audioContext: null, 
  isPlaying: false, 
  globalInputs: { tempo: 100.0, sampleRate: 1.0, volume: 0 }, // tempo measured in bpm
  lookAhead: 25.0,          // how frequently to call the scheduling function
  scheduleAheadTime: 0.1,   // how far ahead to schedule notes
  timeToNextNote: 0, 
  currentNote: 0, 
  syllableSamples: {},
  syllables: [], 
  noteQueue: [],
  timerID: null, 
  lastNoteDrawn: 7,         // one less than the total number of beats
  firstWord: true, 
  isPlaying: false,
  localTrackData: {},
};

// ME_SPEAK
export async function loadSyllableSound(syllable, audioContext, trackIdx, vox) {
  currentStateObj.audioContext  ||= audioContext; 

  let options = { rawdata: true }; 
  
  if (vox) {
    options['variant'] = vox; 
  }

  await meSpeak.speak( syllable, options, async (success, id, stream) => {
    if (success) {
      let audio = await audioContext.decodeAudioData(stream); 
      currentStateObj.syllableSamples[trackIdx] = audio; 
    }
    // THIS WILL ENABLE THE PLAY BUTTON AND SETUP THE CLICK HANDLER
    start(); 
  });  
}


export const handleClick = (e) => { 
  const button = e.target; 

  // SET THE CLASS FOR STYLING AND DATA FOR PLAYBACK
  button.classList.toggle('active');   
  button.dataset.active = button.dataset.active === "true" ? false : true; 
}

export const handlePitchChange = e => {
  const sampleRate = e.currentTarget.value; 
  const trackNum = e.currentTarget.dataset.trackNum; 
  if (trackNum in currentStateObj.localTrackData) {
    currentStateObj.localTrackData[trackNum]['pitch'] = sampleRate; 
  } else {
    currentStateObj.localTrackData[trackNum] = { pitch: sampleRate }; 
  }
}

export const handlePanChange = e => {
  const panAmt = e.currentTarget.value; 
  const trackNum = e.currentTarget.dataset.trackNum; 
  if (trackNum in currentStateObj.localTrackData) {
    currentStateObj.localTrackData[trackNum]['pan'] = panAmt; 
  } else {
    currentStateObj.localTrackData[trackNum] = { pan: panAmt }; 
  }
}

export const handleFilterChange = e => {
  const trackNum = e.currentTarget.dataset.trackNum; 
  const newTrackData = !(trackNum in currentStateObj.localTrackData); 
  // debugger
  
  switch (e.target.id) {
    case "filterOn":
      newTrackData ? currentStateObj.localTrackData[trackNum] = { filterOn: e.target.checked } : 
        currentStateObj.localTrackData[trackNum]["filterOn"] = e.target.value; 
      break;
    case "filterFreq":
      newTrackData ? currentStateObj.localTrackData[trackNum] = { filterFreq: e.target.value } : 
        currentStateObj.localTrackData[trackNum]["filterFreq"] = e.target.value; 
      break;
    case "filterQ":
      newTrackData ? currentStateObj.localTrackData[trackNum] = { filterQ: e.target.value } : 
        currentStateObj.localTrackData[trackNum]["filterQ"] = e.target.value; 
      break;
    default:
      break;
  }
}

export const playSyllable = (audioBuffer, time, trackNum) => {
  const ctx = currentStateObj.audioContext; 

  const audioSource = ctx.createBufferSource();
  audioSource.connect( ctx.destination );

  audioSource.buffer = audioBuffer; 

  // CHANGE PITCH/SAMPLE_RATE
  audioSource.playbackRate.value = getSampleRate(trackNum); 

  getPanning(trackNum, audioSource); 
  getVolume(audioSource, time); 
  getFiltering(trackNum); 

  if (ctx.currentTime < time) {
    audioSource.start(time); 
  }

  return audioSource; 
}

const getSampleRate = (trackNum) => {
  const localSampleRate = Number(currentStateObj.localTrackData[trackNum]?.pitch); 
  
  let sampleRate = (localSampleRate || 0) + currentStateObj.globalInputs.sampleRate; 

  // SAMPLE RATE NEEDS A MINIMUM OR IT GETS TOO MUDDY 
  if (sampleRate < 0.6) sampleRate = 0.6; 

  return sampleRate; 
}

const getPanning = (trackNum, audioSource) => {
  if (currentStateObj.localTrackData[trackNum]?.pan) { 
    const ctx = currentStateObj.audioContext; 
    
    const panNode = ctx.createStereoPanner(); 
    panNode.pan.setValueAtTime( currentStateObj.localTrackData[trackNum].pan , ctx.currentTime); 
    
    audioSource.connect(panNode); 
    panNode.connect(ctx.destination); 
  }
}

const getVolume = (audioSource, time) => {
  const gainNode = currentStateObj.audioContext.createGain(); 

  audioSource.connect(gainNode); 
  gainNode.connect(currentStateObj.audioContext.destination); 

  gainNode.gain.setValueAtTime(currentStateObj.globalInputs.volume, time); 
}

const getFiltering = (trackNum) => {
  const biquadFilter = currentStateObj.audioContext.createBiquadFilter(); 

  biquadFilter.connect(currentStateObj.audioContext.destination); 

  if (currentStateObj.localTrackData?.[trackNum]?.filterOn) { 
    biquadFilter.type = "bandpass"; 
    debugger // check if below needs to be cast into a number
    biquadFilter.frequency.value = Number(currentStateObj.localTrackData[trackNum].filterFreq) || 400; 
    biquadFilter.Q.value = Number(currentStateObj.localTrackData[trackNum].filterQ) || 500; 
  }

}

const nextNote = () => {
  const secondsPerBeat = 60.0 / currentStateObj.globalInputs.tempo; 

  currentStateObj.timeToNextNote += secondsPerBeat; 
  currentStateObj.currentNote++; 

  // THIS IS WHAT LIMITS THE NUM OF BEATS FOR THE AUDIO
  if (currentStateObj.currentNote === 8) {
    currentStateObj.currentNote = 0; 
  }
}

const scheduleNotes = (beatNum, time) => {
  const tracks = document.querySelectorAll('.track'); 

  currentStateObj.noteQueue.push({ note: beatNum, time }); 

  for (let trackNum = 0; trackNum < tracks.length; trackNum++) { 
    if (tracks[trackNum].children[beatNum].dataset.active === 'true') {  
      const buffer = currentStateObj.syllableSamples[trackNum]; 

      playSyllable(buffer, time, trackNum); 
    }
  }


}

// from MDN docs on web audio api advanced techniques and Chris Wilson's A Tale Of Two Clocks article which MDN references
export const scheduler = () => {  
  while (currentStateObj.timeToNextNote < currentStateObj.audioContext.currentTime + currentStateObj.scheduleAheadTime ) {
    // console.log(`Scheduling notes at ${currentStateObj.timeToNextNote}`);
    scheduleNotes(currentStateObj.currentNote, currentStateObj.timeToNextNote);
    nextNote();
  }
  currentStateObj.timerID = window.setTimeout(scheduler, currentStateObj.lookahead);
}
