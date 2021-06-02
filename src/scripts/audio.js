

export const currentStateObj = {
  audioContext: null, 
  isPlaying: false, 
  startTime: null, 
  current16thNote: null,     // last note that was scheduled to be played
  tempo: 50.0,              // measured in bpm
  lookAhead: 25.0,          // how frequently to call the scheduling function
  scheduleAheadTime: 0.1,   // how far ahead to schedule notes
  timeToNextNote: 0, 
  currentNote: 0, 
  syllableSamples: {},
  numSyllables: 0, 
  noteQueue: [],
  // currentEventListeners: [],
};

// ME_SPEAK
export const playIPA = (ipa) => {
  debugger  
  meSpeak.loadVoice('en/en-us');
  meSpeak.speak(ipa); 
  
  // const spoken = meSpeak.speak('[['+ipa+']]', { 'rawdata': 'mime' });
  // if (spoken == null) {
  //   alert("An error occurred: speaking failed.");
  // }

  // meSpeak.play(spoken);
}

export async function loadSyllableSound(syllable, audioContext, trackIdx) {
  currentStateObj.audioContext  ||= audioContext; 
  let audio; 

  await meSpeak.speak(syllable, {rawdata: true}, async (success, id, stream) => {
    if (success) {
      debugger
      audio = await getAudioBuffer(stream, audioContext); 
      currentStateObj.syllableSamples[trackIdx] = audio; 
    }
  });  
}
function getAudioBuffer(data, audioContext) {
  return audioContext.decodeAudioData(data); 
}



export const handleClick = (e) => { 
  const button = e.target; 

  // SET THE CLASS FOR STYLING AND DATA FOR PLAYBACK
  button.classList.toggle('active');   
  button.dataset.active = button.dataset.active === "true" ? false : true; 
}

export const playSyllable = (audioBuffer, time) => {
  const ctx = currentStateObj.audioContext; 

  const audioSource = ctx.createBufferSource();
  audioSource.connect( ctx.destination );

  audioSource.buffer = audioBuffer; 
  audioSource.start(time); 
  return audioSource; 
}

function nextNote() {
  const secondsPerBeat = 60.0 / currentStateObj.tempo; 

  currentStateObj.timeToNextNote += secondsPerBeat; 
  currentStateObj.currentNote++; 

  // THIS IS WHAT LIMITS THE NUM OF BEATS FOR THE AUDIO
  if (currentStateObj.currentNote === 8) {
    currentStateObj.currentNote = 0; 
  }
}

function scheduleNotes(beatNum, time){
  const tracks = document.querySelectorAll('track'); 

  currentStateObj.noteQueue.push({ note: beatNum, time }); 

  for (let i = 0; i < tracks.length; i++) {

    debugger // find the correct track and button at the right beatnum
    if (tracks[i]) {  
      const buffer = currentStateObj.syllableSamples[i]; 
      
      playSyllable(buffer, time)
    }
  }


}

// from MDN docs on web audio api advanced techniques and Chris Wilson's A Tale Of Two Clocks article which MDN references
function scheduler() {
  const { 
    timeToNextNote,
    scheduleAheadTime,
    audioContext,
    currentNote
  } = currentStateObj; 

  while (timeToNextNote < audioContext.currentTime + scheduleAheadTime ) {
      scheduleNotes(currentNote, timeToNextNote);
      nextNote();
  }
  timerID = window.setTimeout(scheduler, lookahead);
}

window.scheduler = scheduler; 


















// SPEECH_SYNTHESIS
{
  // // create synthesizer that will use speak()
  // const synth = window.speechSynthesis; 
  
  // // choose a voice
  // const voices = synth.getVoices(); 
  
  // // choose first US english by default for now
  // const chosenVoice = voices.filter(vox => vox.lang === 'en-US')[0]; 
  
  // // create a new utterance with inputted text
  // const utterance = new SpeechSynthesisUtterance("default"/* TEXT FROM THE INPUT */ );
  
  // utterance.voice = chosenVoice; 
  
  // setInterval(synth.speak(utterance), 1000); 
}

export const playWord = (inputText) => {
  const synth = window.speechSynthesis; 
  const voices = synth.getVoices(); 
  const chosenVoice = voices.filter(vox => vox.lang === 'en-US')[0]; 
  const utterance = new SpeechSynthesisUtterance(inputText);
  
  utterance.voice = chosenVoice; 
  
  synth.speak(utterance); 
}
