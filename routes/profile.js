// routes/profile.js

exports.get_url = "/profile";

exports.get = function(req, res) {
  if (!req.isAuthenticated()) {
    res.redirect("/");
  }
  else {
    res.render("profile", {
      title: process.env.MD_TITLE || "Markdown Chat",
      logged_in: req.isAuthenticated(),
      nickname: req.user.nickname,
      user_id: req.user._id,
      gravatar_url: req.user.getIconURL(),
      user: req.user,
      error: req.flash('error')
    });
  }
};

exports.post_url = "/profile";

exports.post = function(req, res) {
  if (!req.isAuthenticated()) {
    res.redirect("/profile");
  }
  else {
    var nickname = req.param('nickname');
    var email = req.param('email');
    var old_pass = req.param('old-password-input');
    var pass = req.param('password-input');
    var repass = req.param('re-password-input');
    if (!nickname) {
      req.flash("error", "You need to fill nickname");
      res.redirect("/profile")
    }
    else {
      // check we need to update pass/repass
      req.user.nickname = nickname;
      req.user.email = email;
      if (pass && repass && pass.length > 0 && repass.length > 0) {
        // changing pass
        req.user.comparePassword(old_pass, function(err, matchp) {
          if (err) {
            req.flash("error", err.message);
            res.redirect("/profile");
          }
          if (!matchp) {
            req.flash("error", "password(old) does not match with current password");
            res.redirect("/profile");            
          }
          else {
            if (pass.toString() !== repass.toString()) {
              req.flash("error", "does not match password and reentered password");
              res.redirect("/profile");
            }
            else {
              req.user.password = pass;
              req.user.save(function(err) {
                if (err) {
                  req.flash("error", err.message);
                  res.redirect("/profile");
                }
                else {
                  res.redirect("/profile");
                }
              });
            }
          }
        });
      }
      else {
        req.user.save(function(err) {
          if (err) {
            req.flash("error", err.message);
            res.redirect("/profile");
          }
          else {
            res.redirect("/profile");
          }
        });
      }
    }
  }
};
