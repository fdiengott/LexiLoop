// import { fetchSyllables } from './util'; 
// import { fetchWordData, fetchIPA } from './hiddenApiKeyFunctions'; 


// export const getWordAudio = (searchWord) => {
//   let data = fetchWordData(searchWord); 

//   debugger
//   return data[0]?.hwi?.prs[0]?.sound?.audio; 
// }

// WORDS API
export async function getWordSyllables(searchWord) {
  let response = await fetch(`./syllables/${searchWord}`);
  let data = await response.json(); 

  // let data = await fetchSyllables(searchWord); 
  return data.syllables.list; 
}

export async function getRandomWord() {
  let response = await fetch(`./randomWord`);
  let data = await response.json(); 

  debugger
  return data; 
}