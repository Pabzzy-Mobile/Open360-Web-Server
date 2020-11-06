let userCache = new Map();

/**
 * @param userId
 * @return {Promise<Object>}
 */
let requestUserById = function (userId) {
    return new Promise((resolve, reject) => {
        let request = new XMLHttpRequest();
        request.open('GET', '/algo/users/id/' + userId, true);

        request.onload = function() {
            if (this.status >= 200 && this.status < 400) {
                let resp = this.response
                resolve(JSON.parse(resp));
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
 * @param {Object} userData
 * @param {string} userData.username
 * @param {string} userData.userId
 * @return {HTMLAnchorElement}
 */
let createUserCardElement = function (userData) {
    let userElement = document.createElement("a");
    userElement.setAttribute("href", "/" + userData.username);
    userElement.classList.add("channel-user");
    let userPic = document.createElement("div");
    userPic.style.backgroundImage = "url(\"/public/pp/" + userData.userId + "_pp.png\")";
    userElement.append(userPic);
    let usernameP = document.createElement("p");
    usernameP.innerText = userData.username;
    userElement.append(usernameP);
    let data = document.createElement("data");
    data.setAttribute("userId", userData.userId);
    userElement.dataset.userId = userData.userId;
    userElement.dataset.username = userData.username;

    userElement.addEventListener("mouseenter", function (e){
        console.log(e);
        onUserCardHover(e)
            .then(r => {});
    });

    userElement.addEventListener("mouseleave", function (e){
        if (popCard != null) {
            popCard.remove();
        }
    });

    return userElement;
}

/**
 *
 * @type {HTMLElement}
 */
let popCard = null;

/**
 * @param {Object} userData
 * @param {string} userData.userId
 * @param {string} userData.username
 * @param {string} userData.displayName
 * @return {HTMLElement}
 */
let createPopCardElement = function (userData) {
    let cardElement = document.createElement("div");
    cardElement.classList.add("pop-card");
    let cardUsername = document.createElement("p");
    cardUsername.classList.add("pop-card-username");
    cardUsername.innerText = userData.username;
    cardElement.append(cardUsername);
    let cardDisplayName = document.createElement("p");
    cardDisplayName.classList.add("pop-card-displayName");
    cardDisplayName.innerText = userData.displayName;
    cardElement.append(cardDisplayName);
    cardElement.dataset.userId = userData.userId;
    cardElement.dataset.username = userData.username;
    return cardElement;
}

/**
 *
 * @param {MouseEvent} e
 * @param {HTMLDivElement} e.target
 * @return {Promise}
 */
let onUserCardHover = function (e) {
    return new Promise((resolve, reject) => {
        let userId = e.target.dataset.userId;
        requestUserById(userId)
            .then((user) => {
                popCard = createPopCardElement(user);
                popCard.style.position = "absolute";
                let x = e.target.offsetLeft;
                let y = e.target.offsetTop;
                if (x > (window.innerWidth / 2)){
                    popCard.style.left = x - popCard.offsetWidth + "px";
                } else {
                    popCard.style.left = x + e.target.offsetWidth + "px";
                }
                popCard.style.top = y + "px";
                document.querySelector("body").append(popCard);
            })
            .catch((err) => {
                console.error(err);
            });
        resolve();
    });
}