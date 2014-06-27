module.exports = {
    app: {
        social:{
            facebook: {
                appId: "459143727548532",
                appSecret: "700cd415328b9e9915b84a8af9fdede0"
            },
            twitter: {
                appId: "e66lavvT1eYBYLX2WEsgA",
                appSecret: "U681Nxum1Kms92t7V5lICPWibvgHXly401CFZrfhBt8",
            }
        },
        forgotPassword: {
            callbackUrl: 'http://localhost:3000/password/reset/{token}'
        }
    }
};