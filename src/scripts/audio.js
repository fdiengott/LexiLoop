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
  // meSpeak.speak('hello world'); 

  // const spoken = meSpeak.speak('[['+ipa+']]', { 'rawdata': 'mime' });
  // if (spoken == null) {
  //   alert("An error occurred: speaking failed.");
  // }

  // meSpeak.play(spoken);
}