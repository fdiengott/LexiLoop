
import { 
  handleClick, 
  handlePitchChange, 
  handlePanChange,
  handleFilterChange,
} from './audio';


export const setupTracks = (syllables, parentNode) => {
  syllables.forEach((syl, i) => {
    parentNode.appendChild(trackTemplate(syl, i))
  });
}

const trackTemplate = (displayText, idx) => {
  // this is the container for each track
  const section = document.createElement('section');
  section.classList = 'track-section'; 

  const aside = document.createElement('aside'); 
  const h3 = document.createElement('h3'); 
  h3.innerText = displayText; 

  aside.appendChild(h3); 
  section.appendChild(aside); 
  section.appendChild(createButtonDiv(idx)); 
  
  // LOCAL CONTROLS CONTAINER
  const controlsDiv = document.createElement('div');
  controlsDiv.classList.add('controls-container'); 
  
  controlsDiv.appendChild(createPitchKnob(idx)); 
  controlsDiv.appendChild(createPanSlider(idx)); 
  controlsDiv.appendChild(createFilterKnobs(idx)); 

  section.appendChild(controlsDiv); 

  return section; 
}

export const removeTracks = (parentNode) => {
  while (parentNode.firstChild) {
    parentNode.removeChild(parentNode.firstChild)
  }

}

const createButtonDiv = (idx) => {
  const buttonDiv = document.createElement('div'); 
  buttonDiv.classList.add(`track`); 
  buttonDiv.classList.add(`track-${idx}`); 

  for (let i = 0; i < 8; i++) {
    let button = document.createElement('button'); 
    
    button.classList.add(`beat-btn`); 
    button.classList.add(`btn-${i}`); 
    if (i % 4 === 0) {
      button.classList.add(`downbeat`); 
    }

    button.dataset.beatNum = i; 
    button.dataset.active = false; 
    buttonDiv.appendChild(button); 
  }

  // BUTTONS LISTENERS
  buttonDiv.addEventListener("click", handleClick, false); 
  return buttonDiv; 
}

const createPitchKnob = (idx) => {
  const pitchKnob = document.createElement('input'); 
  pitchKnob.type = "range"; 
  pitchKnob.min = "-0.4";   // this is 1.0 less than the final value because it'll be added to the global default
  pitchKnob.max = "0.8";    // this is 1.0 less than the final value because it'll be added to the global default
  pitchKnob.step = "0.1"; 
  pitchKnob.value = "0"; 
  pitchKnob.dataset.trackNum = idx; 

  // USING INPUT KNOBS LIBRARY https://g200kg.github.io/input-knobs/
  pitchKnob.classList.add('input-knob'); 
  pitchKnob.dataset.diameter = "32"
  pitchKnob.dataset.fgcolor = "#f3ea5f" // yellow

  pitchKnob.addEventListener("input", handlePitchChange, false);

  return pitchKnob; 
}

const createPanSlider = (idx) => {
  const panSlider = document.createElement('input'); 
  panSlider.type = "range"; 
  panSlider.min = "-1";
  panSlider.max = "1";
  panSlider.step = "0.1";
  panSlider.value = "0";
  panSlider.dataset.trackNum = idx; 

  panSlider.classList.add("slider"); 
  panSlider.classList.add("pan"); 

  panSlider.addEventListener("input", handlePanChange, false); 

  return panSlider; 
}

const createFilterKnobs = (idx) => {
  const filterInputContainer = document.createElement('div'); 
  filterInputContainer.dataset.trackNum = idx; 


  const filterOnOffSwitch = document.createElement('input'); 
  filterOnOffSwitch.type = "checkbox"; 
  filterOnOffSwitch.classList.add("input-switch");
  filterOnOffSwitch.dataset.src = "./vendor/input-knobs/images/switch_offon.png"; 
  filterOnOffSwitch.dataset.diameter = "50"; 
  filterOnOffSwitch.id = "onOff";


  const filterFreqKnob = document.createElement('input'); 
  filterFreqKnob.classList.add('input-knob'); 
  filterFreqKnob.type = "range"; 
  filterFreqKnob.min = "300";
  filterFreqKnob.max = "5000";
  filterFreqKnob.step = "100";
  filterFreqKnob.value = "400";
  filterFreqKnob.dataset.fgcolor = "#f3ea5f"; // yellow
  filterFreqKnob.dataset.diameter = "32"
  filterFreqKnob.id = "filterFreq"; 
  
  // the higher the value, the smaller the sound band
  const filterQKnob = document.createElement('input'); 
  filterQKnob.classList.add('input-knob'); 
  filterQKnob.type = "range"; 
  filterQKnob.min = "1";
  filterQKnob.max = "1000";
  filterQKnob.step = "50";
  filterQKnob.value = "500";
  filterQKnob.dataset.diameter = "32"
  filterQKnob.id = "filterQ"; 

  filterInputContainer.appendChild(filterOnOffSwitch); 
  filterInputContainer.appendChild(filterFreqKnob); 
  filterInputContainer.appendChild(filterQKnob); 

  // filterInputContainer.addEventListener("click", handleFilterChange, false); 

  return filterInputContainer; 
}

