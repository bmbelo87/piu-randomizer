const fs = require('fs');
const path = require('path');

const inputPath = 'C:\\Users\\bruno\\.local\\share\\opencode\\tool-output\\tool_03fe35eb9001gEp8mqcx3ovNKo';
const outputPath = 'C:\\Users\\bruno\\OneDrive\\Documentos\\GitHub\\piu-randomizer\\backend\\data\\piu_xx_songs.json';

try {
  const rawData = fs.readFileSync(inputPath, 'utf8');
  const data = JSON.parse(rawData);
  
  const songs = data.songs.map(song => ({
    piuId: song.songID,
    title: song.songTitle_en
  }));
  
  fs.writeFileSync(outputPath, JSON.stringify(songs, null, 2));
  
  console.log(`Total songs extracted: ${songs.length}`);
  console.log('Sample entries:');
  console.log(JSON.stringify(songs.slice(0, 5), null, 2));
} catch (error) {
  console.error('Error:', error.message);
}