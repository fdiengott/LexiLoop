import { start } from '../index'; 

export const currentStateObj = {
  audioContext: null, 
  isPlaying: false, 
  tempo: 80.0,              // measured in bpm
  lookAhead: 25.0,          // how frequently to call the scheduling function
  scheduleAheadTime: 0.1,   // how far ahead to schedule notes
  timeToNextNote: 0, 
  currentNote: 0, 
  syllableSamples: {},
  numSyllables: 0, 
  noteQueue: [],
  timerID: null, 
  lastNoteDrawn: 7,         // one less than the total number of beats
  firstWord: true, 
  isPlaying: false,
};

// ME_SPEAK
export async function loadSyllableSound(syllable, audioContext, trackIdx) {
  currentStateObj.audioContext  ||= audioContext; 

  await meSpeak.speak(syllable, {rawdata: true}, async (success, id, stream) => {
    if (success) {
      // let audio = await getAudioBuffer(stream, audioContext); 
      let audio = await audioContext.decodeAudioData(stream); 
      currentStateObj.syllableSamples[trackIdx] = audio; 
    }
    // THIS WILL ENABLE THE PLAY BUTTON AND SETUP THE CLICK HANDLER
    start(); 
  });  
}

// // helper method for LoadSyllableSound to dr
// function getAudioBuffer(data, audioContext) {
//   return audioContext.decodeAudioData(data); 
// }



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

const nextNote = () => {
  const secondsPerBeat = 60.0 / currentStateObj.tempo; 

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
      
      playSyllable(buffer, time); 
    }
  }


}

// from MDN docs on web audio api advanced techniques and Chris Wilson's A Tale Of Two Clocks article which MDN references
export const scheduler = () => {  
  while (currentStateObj.timeToNextNote < currentStateObj.audioContext.currentTime + currentStateObj.scheduleAheadTime ) {
    scheduleNotes(currentStateObj.currentNote, currentStateObj.timeToNextNote);
    nextNote();
  }
  currentStateObj.timerID = window.setTimeout(scheduler, currentStateObj.lookahead);
}


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
