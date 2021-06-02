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



export const playWord = (inputText) => {
  const synth = window.speechSynthesis; 
  const voices = synth.getVoices(); 
  const chosenVoice = voices.filter(vox => vox.lang === 'en-US')[0]; 
  const utterance = new SpeechSynthesisUtterance(inputText);
  
  utterance.voice = chosenVoice; 
  
  synth.speak(utterance); 
}

export const playAudio = (audio) => {

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
export async function loadSyllableSound(syllable, audioContext) {
  meSpeak.loadVoice('en/en-us', async () => {
    await meSpeak.speak(syllable, {rawdata: true}, async (success, id, stream) => {
      if (success) {
        return await getAudioBuffer(stream, audioContext); 
      }
    });  
  });
}

function getAudioBuffer(data, audioContext) {
  return audioContext.decodeAudioData(data); 
}



export const handleClick = (e) => {
  console.log("you're in the handleClick method");

  // turns some boolean to true so the node can be played
  debugger // what is e? 
}

export const play = () => {


  const audioSource = ctx.createBufferSource();
  audioSource.connect( ctx.destination );

  audioSource.buffer = //audio buffer
  audioSource.start(); 
}