/*
 * GET home page.
 */
exports.get_url = "/";
exports.get = function(req, res){
  res.render('index', { title: 'Markdown Chat' });
};
