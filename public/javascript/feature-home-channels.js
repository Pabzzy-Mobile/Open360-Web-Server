let requestAndCreateChannelElements = function (){
    return new Promise((resolve, reject) => {
        requestFeaturedChannels()
            .then((resp) => {
                console.log(resp);
                for (let i = 0; i < resp.channels.length; i++){
                    console.log(resp.channels);
                    let channel = resp.channels[i];
                    let channelElement = createChannelElement(channel);
                    document.querySelector(".channels-featured").append(channelElement);
                }
            })
            .catch((err) => console.error(err));
    });
}

/**
 * Requests the current online channels
 * @return {Promise<Object>}
 */
let requestFeaturedChannels = function () {
    return new Promise((resolve, reject) => {
        let request = new XMLHttpRequest();
        request.open('GET', '/algo/channels/featured', true);

        request.onload = function() {
            if (this.status >= 200 && this.status < 400) {
                let resp = this.response
                resolve(JSON.parse(resp));
            } else {
                reject("what")
            }
        };

        request.onerror = function(err) {
            console.log("Could not connect to the web server")
            reject(err);
        };

        request.send();
    });
}

let createChannelElement = function (channelData) {
    let channelRoot = document.createElement("div");
    channelRoot.classList.add("channel-container");

    let channelWindow = document.createElement("a");
    channelRoot.setAttribute("href", "/" + channelData.username);
    channelWindow.classList.add("channel-window");
    channelWindow.style.backgroundImage = "url(\"/public/thumbs/" + channelData.userId + "_stream_thumbnail.png\")";
    channelRoot.append(channelWindow);
    let channelTitle = document.createElement("p");
    channelTitle.classList.add("channel-title");
    channelTitle.innerText = channelData.title;
    channelRoot.append(channelTitle);

    let channelUserElement = document.createElement("a");
    channelUserElement.setAttribute("href", "/" + channelData.username);
    channelUserElement.classList.add("channel-user");
    let channelUserPic = document.createElement("div");
    channelUserPic.style.backgroundImage = "url(\"/public/pp/" + channelData.userId + "_pp.png\")";
    channelUserElement.append(channelUserPic);
    let channelUsername = document.createElement("p");
    channelUsername.innerText = channelData.username;
    channelUserElement.append(channelUsername);
    channelRoot.append(channelUserElement);

    let channelTagList = document.createElement("div");
    channelTagList.classList.add("channel-tag-list");
    channelData.tags.forEach((tag) => {
        let tagElement = document.createElement("p");
        tagElement.classList.add("channel-tag");
        tagElement.innerText = tag;
        channelTagList.append(tagElement);
    });
    channelRoot.append(channelTagList);
    return channelRoot;
}