const fs = require( 'fs');
const yt = require("yt-converter");
const search = require('youtube-search');
const readline = require('readline-sync');

const userInput = {};
const jsonFullNameList = [];
var opts = {
    maxResults: 1,
    key: 'AIzaSyB_UXfXHV1NqOmyGDOegRDuSbidm4gEq9g'
};

const askForWayToInput = () => {
    const inputTypes = ['JSON file','Text input'];
    const selectedInputTypesIndex = readline.keyInSelect(inputTypes, 'Choose the way that you want to input data: ');
    const selectedInputTypesText = inputTypes[selectedInputTypesIndex]

    return selectedInputTypesText;
}

const askFoJsonPath = () => {
    return readline.question('Type a the path for JSON file: ')
}
const askFoTheMusicInfo = () => {
    userInput.musicName = readline.question('Type the name of the music: ').trim();
    userInput.authorName = readline.question('Type the name of author of the music: ').trim();

}

const getAndProcessInputs = async () => {
    userInput.type = askForWayToInput();
    if(userInput.type === 'JSON file'){
        const JsonFilePath = askFoJsonPath();
        const json = fs.readFile(JsonFilePath, 'utf8', function(err, data) {

            const parsedData = JSON.parse(data);
            parsedData.forEach(function (element) {
                jsonFullNameList.push((element.MusicName + " - " + element.ArtistName).toString());
            })
            console.log(jsonFullNameList);
            jsonFullNameList.forEach(function (element) {
                searchAndDownloadYoutubeMusic(element);
            })

          });
        return json;
    }else if(userInput.type === 'Text input'){
        askFoTheMusicInfo();
        userInput.fullNameFile = userInput.musicName + ' - ' + userInput.authorName;
        searchAndDownloadYoutubeMusic(userInput.fullNameFile);
    }
};


const searchAndDownloadYoutubeMusic = (input) => {
    search(input + ' lyrics', opts, function(err, results) {
             
        if(err) return console.log(err);
        userInput.link = results[0].link;

        try {
            return yt.convertAudio({
                    url: results[0].link,
                    itag: 140,
                    directoryDownload: __dirname + "/music/",
                    title: input
                },
                onData => console.log(onData),
                onClose =>console.log(onClose)
            );
        } catch (error) {
            console.error(error);
            return error;
        }
    })

;
}


const Main = async () => {
    getAndProcessInputs();
}

Main();