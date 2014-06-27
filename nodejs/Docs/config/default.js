module.exports = {
    app: {
        domain: "localhost:3000",
        cookieSecret: "FkmdYT@Txcm^g8-s",
        sessionUploadPath: "/data/sessionContent",
        version: "1.0.0.4",
        db: {
            server: 'localhost',
            port: 27017,
            database: 'SpeakerStackDb',
            options: {
                server: {
                    socketOptions: {
                        keepAlive: 1
                    }
                }
            }
        },
        social:{
            facebook: {
                callback: "/auth/facebook/callback",
                scope: ["email", "user_about_me", "user_work_history"]
            },
            twitter: {
                callback: "/auth/twitter/callback"
            },
            linkedIn: {
                appId: "75e19kmbtofy8h",
                appSecret: "QjsLhEbS1WkJdWv5",
                callback: "/auth/linkedIn/callback"
            }
        },
        profileImages: {
            path: 'data/profileImages',
            allowedFileTypes: ['png', 'jpg', 'jpeg', 'bmp', 'tiff'],
            maxFileSizeInBytes: 1819200
        },
        profileBackgroundImages: {
            path: 'data/profileBackgroundImages',
            allowedFileTypes: ['png', 'jpg', 'jpeg', 'bmp', 'tiff'],
            maxFileSizeInBytes: 1819200
        },
        email:{
            host: "smtp.mandrillapp.com",
            port: "587",
            secureConnection: false,
            user: "john.curtis@speakerstack.com",
            password: "cYm9F0PChGtK0w9b96i3cQ",
            from: "system@speakerstack.com"
        },
        forgotPassword: {
            expireTimeoutInHours: 12,
            minPasswordLength: 6,
            callbackUrl: '/password/reset/{token}',
            emailSubject: 'SpeakerStack password reset'
        },
        deniedAliases: ['profile', 'login', 'logout', 'showorg'],
        rememberPassword: {
            maxAgeInMilliseconds: 604800000, // 7 days
            cookieName: 'token'
        }
    }
};