import { fetchWordData } from './util'; 


export const getWordAudio = (searchWord) => {
  let data = fetchWordData(searchWord); 

  debugger
  return data[0]?.hwi?.prs[0]?.sound?.audio; 
}

export const getWordSyllables = (searchWord) => {
  let data = fetchWordData(searchWord); 

  debugger
  return data[0]?.hwi?.prs[0]?.mw; 
}