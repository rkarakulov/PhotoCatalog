function Uploader(options, scope) {
    this.options = options;
    this.files = [];
    this.elementId = options.elementId || 'pickfiles';
    this.url = options.url;
    var that = this;
    this.init = function () {
        this.uploader = new plupload.Uploader({
            runtimes: 'html5, flash, silverlight',
            browse_button: this.elementId,
            max_file_size: '30mb',
            url: this.url,
            file_data_name: 'uploadData',
            //chunk_size: '1mb',
            max_retries: 3,
            flash_swf_url: '/public/lib/plupload/plupload.flash.swf',
            silverlight_xap_url: '/public/lib/plupload/plupload.silverlight.xap',
            multipart: true,
            unique_names: false,
            drop_element: 'upload-drop',
            filters: [
                { title: "Exel files", extensions: "xls,xlsx" }
            ]
        });

        this.uploader.bind('BeforeUpload', function (up, file) {
            /*
            up.settings.headers = {
                'chunk_size': up.settings.chunk_size,
                'file_size': file.size
            };
            */
        });

        this.uploader.bind('FilesAdded', function (up, files) {
            setTimeout(function () {
                if (that.options.filesAdded)
                    that.options.filesAdded(up, files);

                up.refresh();
                up.start();
            }, 500);
        });

        this.uploader.bind('QueueChanged', function (up) {
            if (scope.$$phase)
                that.files = up.files;
            else
                scope.$apply(function () {
                    that.files = up.files;
                });
        });

        this.uploader.bind('UploadFile', function (up, file) {

        });

        this.uploader.bind('UploadProgress', function (up, file) {
            if (scope.$$phase)
                file.percent = file.percent;
            else
                scope.$apply(function () {
                    file.percent = file.percent;
                });

            if (that.options.uploadProgress)
                that.options.uploadProgress(up, file);
        });

        this.uploader.bind('StateChanged', function (up) {
            if (scope.$$phase)
                $.each(that.files, function () {
                    this.status = this.status;
                });
            else
                scope.$apply(function () {
                    $.each(that.files, function () {
                        this.status = this.status;
                    });
                });
        });

        this.uploader.bind('Error', function (up) {
            if (scope.$$phase)
                $.each(that.files, function () {
                    this.status = 3;
                    if (that.options.error)
                        that.options.error(up);
                });
            else
                scope.$apply(function () {
                    $.each(that.files, function () {
                        this.status = 3;
                        if (that.options.error)
                            that.options.error(up);
                    });
                });
        });

        this.uploader.bind('FileUploaded', function (up, file, info) {
            if (that.options.fileUploaded)
                that.options.fileUploaded(up, file, info);

            if (that.files.length == 1) {
                if (that.options.filesUploaded)
                    that.options.filesUploaded(up, file, info);
            }

            up.removeFile(file);
        });

        this.uploader.init();
    };

    this.clear = function () {
        this.uploader.splice(0, this.uploader.files.length);
    };

    this.remove = function (file) {
        this.uploader.removeFile(file);
    };

    this.fileQueueAction = function (file) {
        if (file.status == 1)
            this.remove(file);
    };

    this.supportsDragDrop = function () {
        return this.uploader.runtime === 'html5';
    };

    this.start = function () {
        this.uploader.start();
    };
}