var fs = require('fs'),
    util = require('util'),
    _ = require('underscore'),
    async = require('async'),
    path = require('path'),
    config = require('config'),
    validator = require('validator'),
    User = require('../models/user'),
    UserService = require('../services/userService'),
    EmailService = require('../services/emailService');

var ProfileImageRoutes = {
    ImageUrl: '/api/user/current/image',
    BackgroundImageUrl: '/api/user/current/background'
}

exports.validateUser = function (email, password, callback) {
    User.findOne({ email: email }, function (err, user) {
        if (err) {
            return callback(err);
        }
        if (!user) {
            return callback(null, false, { message: 'Incorrect username.' });
        }
        user.checkPassword(password, function (passwordValid) {
            if (passwordValid)
                return callback(null, user);
            else
                return callback(null, false, { message: 'Incorrect password.' });
        });
    });
};

var validateUserByEmail = function (email, userId, callback) {
    var query = {email: email};
    if (userId) query._id = {$ne: userId};
    User.findOne(query, function (err, user) {
        var message = user ? util.format("User with email: %s already exists.", email) : null;
        if (err) callback(err);
        if (message) callback({message: message});
        else callback();
    });
};

var getAvatarImage = function (profile) {
    switch (profile.provider) {
        case "facebook":
            return util.format("http://graph.facebook.com/%s/picture?height=200&width=200", profile.id);
        case "twitter":
            var url = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;
            return url ? url.replace(/_normal./, '.') : null; // Remove _normal part of file name to get fullsized image
        case "linkedin":
            //return util.format("http://api.linkedin.com/v1/people/%s/picture-url?accessToken=%s", profile.id, profile.getAccessToken('linkedin'));
            return "";
        default:
            throw new Error({message: util.format("can`t get image from %s provider.", profile.provider)});
    }
}

var createUserByToken = function (accessToken, tokenSecret, profile, callback) {
    var email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
    var firstName = profile.name ? profile.name.givenName : null;
    firstName = firstName ? firstName : profile.displayName;
    User.create({
        email: email || "",
        profileImageUrl: getAvatarImage(profile),
        firstName: firstName || "",
        lastName: profile.name ? profile.name.familyName : "",
        tokens: [
            {
                provider: profile.provider,
                socialId: profile.id,
                accessToken: accessToken,
                tokenSecret: tokenSecret
            }
        ],
        "createdAt": new Date(),
        "updatedAt": new Date(),
        role: roleEnum.speaker
    }, function (err, user) {
        callback(err, user);
    })
};

var updateUserByToken = function (accessToken, tokenSecret, profile, callback) {
    User.update({"tokens.socialId": profile.id, "tokens.provider": profile.provider},
        {$set: {
            "profileImageUrl": getAvatarImage(profile),
            "tokens.$.accessToken": profile.accessToken,
            "tokens.$.tokenSecret": profile.tokenSecret,
            "updatedAt": new Date()}}
        , function (err, count) {
            if (count == 0) return callback(null, false, {message: "Cant update, token not found"});
            User.findOne({"tokens.socialId": profile.id, "tokens.provider": profile.provider}, callback);
        });
};

exports.getOrCreateUserByToken = function (accessToken, tokenSecret, profile, callback) {
    User.findOne({"tokens.socialId": profile.id, "tokens.provider": profile.provider}, function (err, user) {
        if (err) return callback(err);
        if (!user) return createUserByToken(accessToken, tokenSecret, profile, callback);
        else updateUserByToken(accessToken, tokenSecret, profile, callback);
    });
};

exports.getById = function (id, callback) {
    User.findById(id, callback);
}

exports.getByToken = function (token, callback) {
    User.findOne({ autoLoginHash: token }, callback);
}

exports.createByEmail = function (entity, callback) {
    validateUserByEmail(entity.email, null, function (err) {
        var user = new User({
            email: entity.email,
            firstName: entity.firstName,
            lastName: entity.lastName,
            role: entity.role
        });

        user.setPassword(entity.password, function () {
            user.updateInfo([
                { type: 'postalCode', value: entity.postalCode },
                { type: 'company', value: entity.company }
            ],
                function () {
                    user.save(function (err) {
                        callback(err, user);
                    });
                });
        });
    });
}

exports.getProfilePicturePathByUser = function (user, basePath, callback) {
    getProfilePicturePathForCreate(user._id, basePath, function (err, picturePath) {
        fs.exists(picturePath, function (isExists) {
            callback(null, isExists ? picturePath : null);
        });
    });
}

exports.updateProfile = function (user, fields, files, callback) {
    // Fix info collection
    fields.info = JSON.parse(fields.info || []);

    var validationResult = {}
    if (!isProfileRequestValid(user, fields, validationResult)) {
        return callback(null, null, validationResult.errors);
    }

    var file = files ? files.file : null;
    if (file) {
        if (!isFileSizeValid(file.size, config.app.profileImages.maxFileSizeInBytes))
            return callback(null, null, ["File too large"]);

        if (!isFileExtentionValid(file.name, config.app.profileImages.allowedFileTypes))
            return callback(null, null, ["Unsupported files can`t be uploaded"]);
    }

    async.waterfall([
        function (next) {
            getProfilePicturePathForCreate(user._id, config.app.profileImages.path, next);
        },
        function (filePath, next) {
            file ? copyFile(file.path, filePath, next) : next();
        }],
        function (err) {
            if (err) return callback(err);

            //fields.info = JSON.parse(fields.info || []);
            fields.profileImageUrl = file ? preventBrowserCaching(ProfileImageRoutes.ImageUrl) : null;
            UserService.updateById(user._id, fields, function (err, user) {
                callback(err, user);
            });
        }
    );
}

var isProfileRequestValid = function (user, profile, /* out */ results) {
    var errors = [];

    var getInfoValue = function(typeName){
        var info = _.filter(profile.info || [], function (item) {
            return item.type == typeName;
        })[0];

        return info ? info.value : null;
    };

    if (!validator.isEmail(profile.email))
        errors.push('Invalid Email');

    if (validator.isNull(profile.firstName))
        errors.push('Missing required First Name field');

    if (validator.isNull(profile.lastName))
        errors.push('Missing required Last Name field');

    if (user.isInRole(roleEnum.speaker) && !getInfoValue(infoTypeEnum.postalCode))
        errors.push('Missing required Postal Code field');

    if (user.isInRole(roleEnum.organizer) && !getInfoValue(infoTypeEnum.company))
        errors.push('Missing required Company field');

    results.errors = errors.length > 0 ? errors : null;

    return results.errors == null;
}

exports.updateProfileImage = function (user, file, callback) {
    if (!isFileSizeValid(file.size, config.app.profileImages.maxFileSizeInBytes))
        return callback({ message: "File too large" });

    if (!isFileExtentionValid(file.name, config.app.profileImages.allowedFileTypes))
        return callback({ message: "Unsupported file can`t be uploaded" });

    var url = preventBrowserCaching(ProfileImageRoutes.ImageUrl);
    async.waterfall([
        function (next) {
            getProfilePicturePathForCreate(user._id, config.app.profileImages.path,
                function (err, picturePath) {
                    copyFile(file.path, picturePath, next);
                }
            );
        },
        function (next) {
            User.findOne({_id: user._id}, function (err, user) {
                if (err) return next(err);

                user.profileImageUrl = url;
                user.save(function (err) {
                    next(err);
                });
            })
        }],
        function (err) {
            callback(err, url);
        }
    );
}

exports.updateBackgroundImage = function (user, file, callback) {
    if (!isFileSizeValid(file.size, config.app.profileBackgroundImages.maxFileSizeInBytes))
        return callback({ message: "File too large" });

    if (!isFileExtentionValid(file.name, config.app.profileBackgroundImages.allowedFileTypes))
        return callback({ message: "Unsupported file can`t be uploaded" });

    var url = preventBrowserCaching(ProfileImageRoutes.BackgroundImageUrl);
    async.waterfall([
        function (next) {
            getProfilePicturePathForCreate(user._id, config.app.profileBackgroundImages.path,
                function (err, picturePath) {
                    copyFile(file.path, picturePath, next);
                }
            );

        },
        function (next) {
            User.findOne({_id: user._id}, function (err, user) {
                if (err) return next(err);

                user.backgroundImageUrl = url;
                user.save(function (err) {
                    next(err, user);
                });
            })
        }],
        function (err) {
            callback(err, url);
        }
    );
}

exports.updateById = function (id, entity, callback) {
    User.findOne({_id: id}, function (err, user) {
        if (err) return callback(err);

        async.parallel([
            function (next) {
                validateUserByEmail(entity.email, id, next);
            },
            function (next) {
                User.validateAlias(entity.alias, id, function (err, isValid) {
                    if (err) return next(err);
                    next(isValid ? null : {
                        message: util.format('User with alias "%s" already exists', entity.alias)
                    });
                })
            }],
            function (err) {
                if (err) return callback(err, user);

                user.email = entity.email;
                user.firstName = entity.firstName;
                user.lastName = entity.lastName;
                user.bio = entity.bio;
                user.alias = entity.alias;

                if (entity.profileImageUrl)
                    user.profileImageUrl = entity.profileImageUrl;

                user.updateInfo(entity.info, function () {
                    user.save(function (err, user) {
                        callback(err, user);
                    });
                });
            }
        )
    })
}

exports.authorized = function (req, res, next) {
    return function (err, user, info) {
        var redirectUrl = '/';

        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/');
        }

        // If we have previously stored a redirectUrl, use that,
        // otherwise, use the default.
        if (req.session.redirectUrl) {
            redirectUrl = req.session.redirectUrl;
            req.session.redirectUrl = null;
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
        });
        res.redirect(redirectUrl);
    }
};

var getLoginUrl = function (req, defaultRoute) {
    defaultRoute = defaultRoute || '/login';
    return defaultRoute + '?redirectUrl=' + req.url;
}

exports.authorizedOnly = function(defaultRoute){
    return function (req, res, next) {
        if (req.isAuthenticated()) return next();
        req.session.redirectUrl = req.url;
        res.redirect(getLoginUrl(req, defaultRoute));
    };
}

exports.ajaxAuthorizedOnly = function(defaultRoute){
    return function (req, res, next) {
        if (req.isAuthenticated()) return next();
        req.session.redirectUrl = req.url;
        res.status(403).send({redirectUrl: getLoginUrl(req, defaultRoute)});
    };
}

exports.completeStatusOnly = function (req, res, next) {
    UserService.getById(req.user._id, function (err, user) {
        if (err) return next(err);

        return user.isComplete()
            ? next()
            : res.redirect('/auth/complete');
    });
}

exports.ajaxCompleteStatusOnly = function (req, res, next) {
    UserService.getById(req.user._id, function (err, user) {
        if (err) return next(err);

        return user.isComplete()
            ? next()
            : res.status(403).send({redirectUrl: '/auth/complete'});
    });
}

exports.speakerOnly = function (req, res, next) {
    UserService.getById(req.user._id, function (err, user) {
        if (err) return next(err);

        return !user.isShowOrganizer()
            ? next()
            : res.redirect('/login');
    });
}

exports.ajaxSpeakerOnly = function (req, res, next) {
    UserService.getById(req.user._id, function (err, user) {
        if (err) return next(err);

        return !user.isShowOrganizer()
            ? next()
            : res.status(403).send({redirectUrl: '/login'});
    });
}

exports.showOrganizerOnly = function (req, res, next) {
    UserService.getById(req.user._id, function (err, user) {
        if (err) return next(err);

        return user.isShowOrganizer()
            ? next()
            : res.redirect('/showorg/login');
    });
}

exports.ajaxShowOrganizerOnly = function (req, res, next) {
    UserService.getById(req.user._id, function (err, user) {
        if (err) return next(err);

        return user.isShowOrganizer()
            ? next()
            : res.status(403).send({redirectUrl: '/showorg/login'});
    });
}

exports.getByAlias = function (alias, callback) {
    User.findOne({alias: alias}, callback);
}

exports.sendMessage = function (currentUser, userId, message, callback) {
    User.findOne({_id: userId}, function (err, user) {
        if (err) return callback(err);
        if (!user.email) return callback({message: "Can`t send message: User haven`t specified email."})

        EmailService.send(
            user.email,
            "SpeakerStack Message",
            "views/templates/emails/userMessage",
            {
                user: currentUser,
                message: message
            }, callback);
    })
}

var copyFile = function (sourcePath, destinationPath, callback) {
    var fileStream = fs.createReadStream(sourcePath);
    fileStream.pipe(fs.createWriteStream(destinationPath));
    fileStream.on('end', function (err) {
        callback(err);
    });
}

var preventBrowserCaching = function (url) {
    return url + '?r=' + (new Date()).getTime();
}

var ensurePathExistsOrCreate = function (path, callback) {
    fs.exists(path, function (exists) {
        !exists ? fs.mkdirParent(path, callback) : callback();
    });
}

var getProfilePicturePathForCreate = function (userId, basePath, callback) {
    ensurePathExistsOrCreate(basePath, function () {
        callback(null, path.join(basePath, userId.toString()));
    });
}

var isFileExtentionValid = function (fileName, allowedFileTypes) {
    var fileNameParts = fileName.toLowerCase().split('.');
    var fileType = fileNameParts[fileNameParts.length - 1];

    return allowedFileTypes.indexOf(fileType) > -1;
}

var isFileSizeValid = function (fileSize, maxFileSizeInBytes) {
    return fileSize <= maxFileSizeInBytes;
}