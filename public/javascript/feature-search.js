/**
 *
 * @param {string} str
 * @param {Object} [options]
 * @param {boolean} options.justChannels - Search only for channels
 * @param {boolean} options.justUsers - Search only for users
 * @param {boolean} options.popularity - Sort by popularity
 * @param {string} options.tags - Search by tag
 * @param {string} options.directory - Search by directory
 * @param {number} options.offset - Search offset
 */
let searchFor = function (
    str,
    {
        justChannels= true,
        justUsers= false,
        popularity = true,
        tags = "",
        directory = "universal",
        offset = 0
    })
{
    return new Promise((resolve, reject) => {
        let query = constructQuery({...str, ...options})

        let request = new XMLHttpRequest();
        request.open('GET', '/algo/search/query' + query, true);

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

let constructQuery = function (query) {
    return new Promise(resolve => {
        let str = "?";
        Object.keys(query)
            .forEach((key, index, keys)=>{
                str += `${key}=${obj[key]}&`;
                if (index >= keys.length - 1) {
                    str.substring(0, str.length - 1);
                    resolve(str);
                }
            });
    })
}