let userCache = new Map();

let requestUserById = function (userId) {
    return new Promise((resolve, reject) => {
        let request = new XMLHttpRequest();
        request.open('GET', '/algo/users/id/' + userId, true);

        request.onload = function() {
            if (this.status >= 200 && this.status < 400) {
                let resp = this.response
                resolve(resp);
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