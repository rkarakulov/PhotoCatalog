module.exports = {
    app: {
        domain: "speakerstack.231.quotient.net",
        social:{
            facebook: {
                appId: "293866780760717",
                appSecret: "52405baa299044c5775c02fbd16504a8"
            },
            twitter:{
                appId: "ABlbJQfNnD1nVzr9PLf3w",
                appSecret: "UtWZLW8aaoVit6MTBkWf2VaXioSAr1f3MkHHMSMFk"
            }
        },
        forgotPassword: {
            callbackUrl: 'http://speakerstack.231.quotient.net/password/reset/{token}'
        }
    }
};