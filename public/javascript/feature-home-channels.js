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

    // Thumbnail
    let channelWindow = document.createElement("a");
    channelRoot.setAttribute("href", "/" + channelData.username);
    channelWindow.classList.add("channel-window");
    channelWindow.style.backgroundImage = "url(\"/public/thumbs/" + channelData.userId + "_stream_thumbnail.png\")";
    channelRoot.append(channelWindow);

    // Channel details Element
    let channelDetails = document.createElement("div");
    channelDetails.classList.add("channel-details");

    // Left/Right sides
    let leftSide = document.createElement("div");
    leftSide.classList.add("channel-left");
    let rightSide = document.createElement("div");
    rightSide.classList.add("channel-right");

    // User pic
    let userPicElement = document.createElement("a");
    userPicElement.setAttribute("href", "/" + channelData.username);
    userPicElement.classList.add("channel-user");
    let userPic = document.createElement("div");
    userPic.style.backgroundImage = "url(\"/public/pp/" + channelData.userId + "_pp.png\")";
    userPic.classList.add("channel-user-pic");
    userPicElement.append(userPic);
    leftSide.append(userPicElement);

    // Channel Details Elements
    let channelTitle = document.createElement("p");
    channelTitle.classList.add("channel-title");
    channelTitle.innerText = channelData.title;
    rightSide.append(channelTitle);
    let channelDirectory = document.createElement("a");
    channelDirectory.classList.add("channel-directory");
    channelDirectory.innerText = channelData.directory;
    channelDirectory.setAttribute("href", "/directory/" + channelData.directory);
    rightSide.append(channelDirectory);

    //let channelUserCard = createUserCardElement({userId: channelData.userId, username: channelData.username});
    //channelRoot.append(channelUserCard);

    let userElement = document.createElement("a");
    userElement.setAttribute("href", "/" + channelData.username);
    userElement.classList.add("channel-user");
    let usernameP = document.createElement("p");
    usernameP.classList.add("channel-user-name");
    usernameP.innerText = channelData.username;
    userElement.append(usernameP);
    let data = document.createElement("data");
    data.setAttribute("userId", channelData.userId);
    userElement.dataset.userId = channelData.userId;
    userElement.dataset.username = channelData.username;
    rightSide.append(userElement);

    let channelTagList = document.createElement("div");
    channelTagList.classList.add("tag-list");
    channelData.tags.forEach((tag) => {
        let tagElement = document.createElement("a");
        tagElement.classList.add("tag");
        tagElement.innerText = tag;
        tagElement.setAttribute("href", "/tags/" + tag);
        channelTagList.append(tagElement);
    });
    rightSide.append(channelTagList);

    channelDetails.append(leftSide);
    channelDetails.append(rightSide);

    channelRoot.append(channelDetails);

    return channelRoot;
}