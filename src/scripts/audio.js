import { start } from '../index'; 

// const BASE_TEMPO = { tempo: 100.0, sampleRate: 1.0, volume: 0 }; 
const BASE_TEMPO = 100.0; 
const BASE_SAMPLE_RATE = 1.0; 
const BASE_VOLUME = 0;

export const currentStateObj = {
  audioContext: null, 
  isPlaying: false, 
  globalInputs: { tempo: BASE_TEMPO, sampleRate: BASE_SAMPLE_RATE, volume: BASE_VOLUME }, // tempo measured in bpm
  // globalInputs: { tempo: 100.0, sampleRate: 1.0, volume: 0 }; 
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
  
  switch (e.target.id) {
    case "filterOn":
      newTrackData ? currentStateObj.localTrackData[trackNum] = { filterOn: e.target.checked } : 
        currentStateObj.localTrackData[trackNum]["filterOn"] = e.target.checked; 
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

  // getPanning(trackNum, audioSource, gainNode); 
  // getVolume(audioSource, time, biquadFilter); 
  // getFiltering(trackNum, ctx.destination); 


  const panNode = ctx.createStereoPanner(); 
  const gainNode = ctx.createGain(); 
  const biquadFilter = ctx.createBiquadFilter(); 


  // PANNING
  if (currentStateObj.localTrackData[trackNum]?.pan) { 
    panNode.pan.value = Number(currentStateObj.localTrackData[trackNum].pan); 
  }
  
  // FILTERING
  if (currentStateObj.localTrackData?.[trackNum]?.filterOn) { 
    getFiltering(biquadFilter, audioSource, panNode, trackNum); 
  } else {
    audioSource.connect(panNode); 
  }
  
  
  audioSource.connect(gainNode)
  gainNode.connect(ctx.destination); 
  panNode.connect(ctx.destination); 
  
  // VOLUME
  gainNode.gain.value = currentStateObj.globalInputs.volume;

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

const getPanning = (trackNum, audioSource, connector) => {
  if (currentStateObj.localTrackData[trackNum]?.pan) { 
    const ctx = currentStateObj.audioContext; 
    
    const panNode = ctx.createStereoPanner(); 
    panNode.pan.setValueAtTime( currentStateObj.localTrackData[trackNum].pan , ctx.currentTime); 
    
    audioSource.connect(panNode); 
    panNode.connect(ctx.destination); 
  }
}

const getVolume = (audioSource, time, connector) => {
  const gainNode = currentStateObj.audioContext.createGain(); 

  audioSource.connect(gainNode); 
  gainNode.connect(currentStateObj.audioContext.destination); 

  gainNode.gain.setValueAtTime(currentStateObj.globalInputs.volume, time); 
}

const getFiltering = (filterNode, source, nextNode, trackNum) => {
  filterNode.type = "bandpass"; 
  filterNode.frequency.value = Number(currentStateObj.localTrackData[trackNum].filterFreq) || 400; 

  source.connect(filterNode); 
  filterNode.connect(nextNode); 
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

export const resetEffects = () => {
  currentStateObj.globalInputs = { tempo: BASE_TEMPO, sampleRate: BASE_SAMPLE_RATE, volume: BASE_VOLUME };
  debugger
  document.querySelector('#volume').value = BASE_VOLUME; 
  document.querySelector('#tempo').value = BASE_TEMPO; 
  document.querySelector('#pitch').value = BASE_SAMPLE_RATE; 

  currentStateObj.localTrackData = {}; 
}