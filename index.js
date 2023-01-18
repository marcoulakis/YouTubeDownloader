const fs = require( 'fs');
const yt = require("yt-converter");
const search = require('youtube-search');
const readline = require('readline-sync');
const cliProgress = require('cli-progress');
require('colors');
require('dotenv').config()
const process = require('process');


const userInput = {};
const jsonFullNameList = [];
var opts = {
    maxResults: 1,
    key: process.env.API_KEY || undefined
};

let processedFiles = 0;

const askForKey = () =>{
    opts.key = readline.question('\nType your YouTube API key: '.cyan).trim();
    if(opts.key == ""){
        console.log('No YouTube API key value!'.underline.red);
        process.exit(9);
    }
}

const askForWayToInput = () => {
    const inputTypes = ['JSON file'.cyan,'Text input'.cyan];
    const selectedInputTypesIndex = readline.keyInSelect(inputTypes, 'Choose the way that you want to input data: '.cyan, {cancel: "CANCEL".magenta, guide: false});

    return selectedInputTypesIndex;
}

const askFoJsonPath = () => {
    return readline.question('Type a the path for JSON file: '.cyan)
}
const askFoTheMusicInfo = () => {
    userInput.musicName = readline.question('Type the name of the music: '.cyan).trim();
    userInput.authorName = readline.question('Type the name of author of the music: '.cyan).trim();
    console.log("")
}

const getAndProcessInputs = async () => {
    if(opts.key === undefined){
        askForKey()
    }
    userInput.type = askForWayToInput()
    if(userInput.type === 0){
        const JsonFilePath = askFoJsonPath();
        console.log("")
        if(!JsonFilePath){
            console.log('No JSON file selected!'.underline.red);
            process.exit(9);
        }
        const json = fs.readFile(JsonFilePath, 'utf8', function(err, data) {
            if(err) return console.log(`${err.message}\n`.red);

            const parsedData = JSON.parse(data);
            parsedData.forEach(function (element) {
                jsonFullNameList.push((element.MusicName + " - " + element.ArtistName).toString());
            })
            
            userInput.size = jsonFullNameList.length;
            jsonFullNameList.forEach(function (element) {
                searchAndDownloadYoutubeMusic(element);
            })
          });
        return json;
    }else if(userInput.type === 1){
        askFoTheMusicInfo();
        userInput.fullNameFile = userInput.musicName + ' - ' + userInput.authorName;
        userInput.size = 1;
        searchAndDownloadYoutubeMusic(userInput.fullNameFile);
    }
};

const checkAndCreateMusicFolder = () => {
    if (!fs.existsSync(process.cwd() + "/music/")) {
        fs.mkdirSync(process.cwd() + "/music/");
    }
}

const multiBar = new cliProgress.MultiBar({
    clearOnComplete: false,
    hideCursor: true
}, cliProgress.Presets.shades_grey);

const singleBar = new cliProgress.SingleBar({
    clearOnComplete: false,
    hideCursor: true
}, cliProgress.Presets.shades_grey);


const updateDownloadProgressBar = (value, bar) => {
    bar.increment();
    bar.update(Math.floor(value));
}

const finishedDownload = (singleBar, fileName) => {
    processedFiles++;
    if(userInput.size === 1){
        singleBar.stop();
        console.log(`\n${fileName}.mp3 downloaded.`.green );
    }else{
        if(userInput.size != undefined && processedFiles == userInput.size){
            jsonFullNameList.forEach(eachFileName => {
                multiBar.stop();
                console.log(`\n${eachFileName}.mp3 downloaded.`.green );
            });
        }
    }
    console.log("");
}


const searchAndDownloadYoutubeMusic = (input) => {
    checkAndCreateMusicFolder();
    search(input + ' lyrics', opts, function(err, results) {
        if(err) return console.log(err);
        userInput.link = results[0].link;
    
        try {
            let b1;
            if(userInput.size === 1){
                b1 = singleBar;
                b1.start()
            }else{
                b1 = multiBar.create(100, 0);
            }

            return yt.convertAudio({
                    url: results[0].link,
                    itag: 140,
                    directoryDownload: process.cwd() + "/music/",
                    title: input
                },
                onData => updateDownloadProgressBar(onData, b1),
                onClose => finishedDownload(b1, input)
            );
        } catch (error) {
            console.error(error);
            return error;
        }
    });
}

const Main = async () => {
    await getAndProcessInputs();
}

Main();