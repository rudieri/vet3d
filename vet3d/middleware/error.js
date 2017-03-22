exports.notFound = function (req, res, error) {
	res.status(404);
	res.render('erros/not-found');
};