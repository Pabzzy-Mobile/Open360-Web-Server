// HOME PAGES RESPONSES

function handleHomepageGET(req, res){
    res.render("index", {
        user: req.user,
        req: JSON.stringify(req.user)
    });
}

module.exports = {
    handleHomepageGET
}