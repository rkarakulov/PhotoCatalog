$("form[parsley-validate]").submit(function (e) {
    var isValid = $(this).parsley('validate');
    if (!isValid) e.preventDefault();
    return isValid;
});
