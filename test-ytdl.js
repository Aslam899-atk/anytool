const ytdl = require('@distube/ytdl-core');

async function test() {
    try {
        const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Rick roll
        console.log('Validating:', ytdl.validateURL(url));
        const info = await ytdl.getInfo(url);
        console.log('Title:', info.videoDetails.title);
    } catch (e) {
        console.error('Error:', e);
    }
}
test();
