let shouldScroll = true;
let lastScrollWasAutoScroll = false;

let sendMessage = function () {
    let message = document.querySelector(".message-box input").value;
    if (message === "") return;
    message = message.trim();
    socket.emit("chat-message", { message: message });
    document.querySelector(".message-box input").value = "";
};

let createMessage = function (text, user, colour) {
    emojify(text)
        .then((emojifiedMessage) => {
            createMessageElement(emojifiedMessage, user, colour);
            if (shouldScroll){
                scrollToBottom();
            }
        });
}

let createLogElement = function (text) {
    let messageDiv = document.createElement("div");
    messageDiv.classList.add("log-message");
    let message = document.createElement("p");
    message.innerText = text;
    messageDiv.append(message);
    document.querySelector(".chat .messages").append(messageDiv);
}

let createMessageElement = function (text, user, colour) {
    let messageDiv = document.createElement("p");
    messageDiv.classList.add("chat-message");
    let from = document.createElement("a");
    from.innerText = user;
    from.classList.add("chat-message-user");
    from.style.color = colour;
    from.setAttribute("href", "/" + user);
    messageDiv.append(from);
    let message = document.createElement("span");
    message.innerHTML = text;
    message.classList.add("chat-message-text");
    messageDiv.append(message);
    document.querySelector(".chat .messages").append(messageDiv);
}

let scrollToBottom = function () {
    lastScrollWasAutoScroll = true;
    let messagesDiv = document.querySelector(".chat .messages");
    // Scroll to the bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

/**
 *
 * @type {Object} emojiListCache
 * @property {number} version - Version of the list
 * @property {emoji[]} emojis - Emojis and their paths
 */
let emojiListCache = null;

/**
 *
 * @type {Object} emoji
 * @property {string} name - Name of emoji to be replaced
 * @property {string} path - Path to where to get the file
 */
let emoji = function (){
    this.name = "";
    this.path = "";
}

/**
 *
 * @return {Promise<emojiListCache>}
 */
let requestEmojiList = function (){
    return new Promise((resolve, reject) => {
        // If the emoji list is already cached then just return it
        if(emojiListCache != null){
            resolve(emojiListCache);
            return;
        }

        let request = new XMLHttpRequest();
        // The emojis should be delivered by a CDN instead. But for now I'll use the server public folder
        request.open('GET', '/public/assets/emoji_list.json', true);

        request.onload = function() {
            if (this.status >= 200 && this.status < 400) {
                let resp = this.response
                emojiListCache = JSON.parse(resp);
                resolve(emojiListCache);
            } else {
                reject("what");
            }
        };

        request.onerror = function(err) {
            console.log("Could not connect to the web server");
            reject(err);
        };

        request.send();
    });
}

/**
 *
 * @param {string} str
 * @return {Promise<string>}
 */
let emojify = function (str){
    return new Promise(resolve => {
        requestEmojiList()
            .then((emojiList) => {
                let length = emojiList.emojis.length;
                for (let i = 1; i <= length; i++){
                    // Get the emoji to replace on the string
                    let currentEmoji = emojiList.emojis[i - 1];
                    // Create the replace pattern
                    let regex = new RegExp("\\b(" + currentEmoji.name + ")\\b", "g");
                    // Define the path to the emoji on the assets
                    let path = "/public/assets/" + currentEmoji.path;
                    // Replace using all of that
                    str = String(" " + str + " ").replace(regex, '<img src="' + path + '" alt="' + currentEmoji.name + '"/>');
                    if (i === length){
                        // Finished replacing all the emojis
                        str = str.trim();
                        resolve(str);
                    }
                }
            })
            .catch(err => {
                console.error(err);
            })
    });
}

document.querySelector('.chat .messages')
    .addEventListener("scroll", function () {
        if (lastScrollWasAutoScroll === false) {
            setAutoScroll(false);
        }
        lastScrollWasAutoScroll = false;
    });

document.querySelector('.message-box-autoscroll')
    .addEventListener('mouseup', function (e) {
        setAutoScroll(true);
    });

let setAutoScroll = function (active) {
    switch (active) {
        case true:
            shouldScroll = true;
            document.querySelector('.message-box-autoscroll')
                .style.visibility = 'hidden';
            scrollToBottom();
            break;
        case false:
            shouldScroll = false;
            document.querySelector('.message-box-autoscroll')
                .style.visibility = 'visible';
            break;
    }
}