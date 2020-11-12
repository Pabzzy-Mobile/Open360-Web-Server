/**
 * Sends the new settings to the server
 * @return {Promise<Object>}
 */
let sendNewSettings = function (newSettings) {
    return new Promise((resolve, reject) => {
        let request = new XMLHttpRequest();
        request.open('POST', '/user/dashboard', true);
        request.setRequestHeader("Content-Type", "application/json");

        request.onreadystatechange = function(){
            if (request.status === 200) {
                let json = JSON.parse(request.responseText);
                console.log(json);
                resolve(json);
            } else {
                reject(request.responseText);
            }
        }

        request.onerror = function(err) {
            console.log("Could not connect to the web server")
            reject(err);
        };

        let data = JSON.stringify(newSettings);
        request.send(data);
    });
}

let sendNewStreamKeyRequest = function (){
    return new Promise((resolve, reject) => {
        let request = new XMLHttpRequest();
        request.open('POST', '/auth/nsk', true);

        request.onreadystatechange = function(){
            if (request.status === 200) {
                let json = JSON.parse(request.responseText);
                console.log(json);
                resolve(json);
            } else {
                reject(request.responseText);
            }
        }

        request.onerror = function(err) {
            console.log("Could not connect to the web server")
            reject(err);
        };

        request.send();
    });
}

let Settings = function () {
    this.type = SettingsType.UNDEFINED;
    this.channel = {
        title: "",
        description: "",
        tags: "",
        directory: ""
    }
    this.user = {
        displayName: ""
    }
}

const SettingsType = {
    UNDEFINED: 0,
    USER_DATA: 1,
    CHANNEL_DATA: 2
}

function sendUserSettings(){
    let newSettings = new Settings();
    newSettings.type = SettingsType.USER_DATA;

    newSettings.user.displayName = document.querySelector('.input-user-displayName').value;

    sendNewSettings(newSettings)
        .then((resp) => {
            alert(resp.message);
        })
        .catch((err) => {
            alert("An error happened\n" + err);
        })
}

function sendStreamSettings(){
    let newSettings = new Settings();
    newSettings.type = SettingsType.CHANNEL_DATA;

    newSettings.channel.title = document.querySelector('.input-stream-title').value;
    newSettings.channel.description = document.querySelector('.input-stream-description').value;
    newSettings.channel.tags = document.querySelector('.input-stream-tags').value;
    newSettings.channel.directory = document.querySelector('.input-stream-directory').value;

    sendNewSettings(newSettings)
        .then((resp) => {
            alert(resp.message);
        })
        .catch((err) => {
            alert("An error happened\n" + err);
        })
}

function requestNewStreamKey(){
    sendNewStreamKeyRequest()
        .then((resp) => {
            document.querySelector('.input-stream-streamKey').textContent = resp.streamKey;
        })
        .catch((err) => {
            alert("An error happened\n" + err);
        });
}

document.querySelector('.dashboard-stream-details-save')
    .addEventListener('mouseup', evt => {
        sendStreamSettings();
    });

document.querySelector('.dashboard-user-details-save')
    .addEventListener('mouseup', evt => {
        sendUserSettings();
    });

document.querySelector('.dashboard-stream-streamKey-gen')
    .addEventListener('mouseup', evt => {
        requestNewStreamKey();
    });