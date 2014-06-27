function baseService($http, $location, onlineRegistryContext) {
    this.$http = $http;
    this.$location = $location;
    this.context = onlineRegistryContext;
}

baseService.prototype.processSuccessResponse = function (res) {
    if (res && res.redirectUrl) {
        document.location.href = res.redirectUrl;
        return;
    }
};

baseService.prototype.processErrorResponse = function (res) {

};

baseService.prototype.serialize = function (data) {
    return $.param(this.AddAntiForgeryToken(data))
};

baseService.prototype.AddAntiForgeryToken = function (data) {
    data.__RequestVerificationToken = $('input[name=__RequestVerificationToken]').val();
    return data;
};

baseService.prototype.action = function (action, controller, extra) {
    return '/dashboard/site/' + window.DMGEventId + '/' + controller + '/' + action + (extra != undefined ? '/' + extra : '');
};

baseService.prototype.ajax = function (method, url, params, data, dataType, successCallback, errorCallback, unauthorizeCallback) {
    var that = this;
    var options = {
        method: method,
        url: url,
        params: params,
        data: data,
        responseType: dataType
    };

    if (dataType && dataType == 'form') {
        options.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    }

    that.$http(options)
        .success(function (res) {
            that.processSuccessResponse(res);

            /*// todo need move to error handler
            if(res && res.status == 403){
                that.context.isAuthentificate = false;
            }
            else{
                that.context.isAuthentificate = true;
            }*/

            if (successCallback)
                successCallback(res);
        })
        .error(function (res) {
            that.processErrorResponse(res);

            var errors = '' || ['Server error. Please try again.'];
            if(res){
                if(res.status == 403){
                    /*that.context.isAuthentificate = false;*/
                    that.$location.path(res.redirectUrl);
                }
                if(res.status == 404){
                    that.$location.path('/');
                    //that.$location.path(res.redirectUrl);
                }

                errors = res.error || errors;
            }
            if (errorCallback)
                errorCallback({ errors: errors });
        });
};