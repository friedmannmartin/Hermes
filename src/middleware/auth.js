export default (req, res, next) => {
    if (res.locals.user) {
        next();
    } else {
        console.log("401", req.method, req.url);
        res.status(401).render("401");
    }
};
