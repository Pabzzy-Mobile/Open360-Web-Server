const DatabaseAccess = require('../database/');

// ALGORITHM RESPONSES

function handleAlgoChannelsFeaturedGET(req, res){
    let data = {};
    // TODO
    //  Cache data from these methods
    DatabaseAccess.find.algoChannelsCurrentOnline()
        .then((results) => {
            data.channels = results;
            // Send the data back
            res.status(200).json(data);
        })
        .catch(err => {
            console.error(err);
            data.error = err.name;
            res.status(500).json(data);
        });
}

function handleAlgoUserByIdGET(req, res) {
    let data = {};
    // Get the userId
    let userId = req.params.id;
    DatabaseAccess.find.userDetailsByUserId(userId)
        .then((result) => {
            if (result == null){
                // Send 404 user not found
                res.status(404).json({message: "not found"});
            } else {
                data.userId = result.userId;
                data.username = result.username;
                data.displayName = result.displayName;
                // Send the data back
                res.status(200).json(data);
            }
        })
        .catch(err => {
            console.error(err);
            data.error = err.name;
            res.status(500).json(data);
        });
}

module.exports = {
    handleAlgoChannelsFeaturedGET,
    handleAlgoUserByIdGET
}