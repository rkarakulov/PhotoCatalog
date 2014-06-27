function dmgUploader(options, scope) {
    this.options = options;
    this.files = [];
    this.elementId = options.elementId || 'pickfiles';
    this.url = options.url;
    var that = this;
    this.init = function() {
        this.uploader = new plupload.Uploader({
            runtimes: 'html5,flash,silverlight',
            browse_button: this.elementId,
            max_file_size: '2048mb',
            url: this.url,
            flash_swf_url: '/content/lib/plupload/plupload.flash.swf',
            silverlight_xap_url: '/content/lib/plupload/plupload.silverlight.xap',
            multipart: true,
            unique_names: false,
            drop_element:'upload-queue_filelist'
        });

        this.uploader.bind('FilesAdded', function (up, files) {

        });

        this.uploader.bind('QueueChanged', function (up) {
            if (scope.$$phase)
                that.files = up.files;
            else
                scope.$apply(function() {
                    that.files = up.files;
                });
        });

        this.uploader.bind('UploadFile', function(up, file) {

        });

        this.uploader.bind('UploadProgress', function (up, file) {
            if (scope.$$phase)
                file.percent = file.percent;
            else
                scope.$apply(function() {
                    file.percent = file.percent;
                });
        });

        this.uploader.bind('StateChanged', function(up) {
            if (scope.$$phase)
                $.each(that.files, function () {
                    this.status = this.status;
                });
            else
                scope.$apply(function () {
                    $.each(that.files, function() {
                        this.status = this.status;
                    });
                });
        });

        this.uploader.bind('Error', function (up) {
            if (scope.$$phase)
                $.each(that.files, function () {
                    this.status = 3;
                });
            else
                scope.$apply(function () {
                    $.each(that.files, function() {
                        this.status = 3;
                    });
                });
        });

        this.uploader.bind('FileUploaded', function(up, file, info) {
            if (that.options.fileUploaded)
                that.options.fileUploaded(file);
            
            if (that.files.length == 1) {
                if (that.options.filesUploaded)
                    that.options.filesUploaded();
            }
            
            up.removeFile(file);
        });

        this.uploader.init();
    };

    this.clear = function() {
        this.uploader.splice(0, this.uploader.files.length);
    };

    this.remove = function(file) {
        this.uploader.removeFile(file);
    };

    this.fileQueueAction = function(file) {
        if (file.status == 1)
            this.remove(file);
    };

    this.supportsDragDrop = function() {
        return this.uploader.runtime === 'html5';
    };
    
    this.start = function () {
        this.uploader.start();
    };
}