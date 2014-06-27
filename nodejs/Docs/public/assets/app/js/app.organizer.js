var responsiveHelper = undefined;
var breakpointDefinition = {
    tablet: 1024,
    phone: 480
};

var tableElement = $('#datatable');
tableElement.dataTable({
    sDom: "<'row'<'col-md-6'l T><'col-md-6'f>r>t<'row'<'col-md-12'p i>>",
    oTableTools: {
        aButtons: [
            {
                sExtends: "collection",
                sButtonText: "<i class='fa fa-cloud-download'></i>",
                aButtons: [ "csv", "xls", "pdf", "copy"]
            }
        ],
        sSwfPath: "/assets/others/media/swf/copy_csv_xls_pdf.swf"
    },
    sPaginationType: "bootstrap",
    aoColumnDefs: [ ],
    aaSorting: [
        [ 0, "asc" ]
    ],
    oLanguage: {
        "sLengthMenu": "_MENU_ ",
        "sInfo": "Showing <b>_START_ to _END_</b> of _TOTAL_ entries"
    },
    bAutoWidth: false,
    fnPreDrawCallback: function () {
        // Initialize the responsive datatables helper once.
        if (!responsiveHelper) {
            responsiveHelper = new ResponsiveDatatablesHelper(tableElement, breakpointDefinition);
        }
    },
    fnRowCallback: function (nRow) {
        responsiveHelper.createExpandIcon(nRow);
    },
    fnDrawCallback: function (oSettings) {
        responsiveHelper.respond();
    }
});

$('#events_wrapper .dataTables_filter input').addClass("input-medium "); // modify table search input
$('#events_wrapper .dataTables_length select').addClass("select2-wrapper span12"); // modify table per page dropdown

$(".select2-wrapper").select2({minimumResultsForSearch: -1});

