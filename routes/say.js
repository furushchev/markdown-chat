// routes/say.js

var mongoose = require('mongoose');

exports.get_url = '/say/:id';

exports.get = function(req, res) {
    var Say = mongoose.model('Say');
    var id = req.params.id;
    Say.find({_id: id}).populate('user').exec(function(err, says) {
      if (err !== null) {
        res.send('404', 404);
      }
      else if (says === null || says.length === 0) {
        res.send('404', 404);
      }
      else {
        var say = says[0];
        var user_id = null;
        if (req.isAuthenticated()) {
          user_id = req.user._id;
        }
        say.renderMarkdown(user_id)
          .then(function(rendered_html) {
            res.render('say', {
              logged_in: req.isAuthenticated(),
              user_id: user_id,
              nickname: (req.user || {}).nickname,
              title: process.env.MD_TITLE || 'Markdown Chat',
              date: say.date,
              html: rendered_html,
              date_str: say.readableDateStr(),
              _id: say._id,
              raw_markdown: (say.raw_markdown || '')
                .replace(/(^\s+)|(\s+$)/g, '')
            });
          });
      }
    });
};
