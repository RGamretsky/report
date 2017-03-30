var app = angular.module('report', [
    'angularUtils.directives.dirPagination',
    'angularjs-dropdown-multiselect',
    'ngSanitize',
    'angular-bind-html-compile'
]);

app.controller('PaginationController', function($rootScope) {});

function unique() {
    var a = [];
    for (i = 0; i < this.length; i++) {
        var current = this[i];
        if (a.indexOf(current) < 0) a.push(current);
    }

    this.length = 0;
    for (i = 0; i < a.length; i++) {
        this.push(a[i]);
    }

    return this;
}
app.filter("trustSafe", ['$sce', function($sce) {
    return function(htmlCode) {
        return $sce.trustAsHtml("" + htmlCode);
    }
}])

app.filter('search', function($filter) {
    return function(input, search, multipleSearch) {
        var isEmpty = true;

        angular.forEach(search, function(value, key) {
            if (value != "") {
                isEmpty = false;
            }
        });
        var data = [];

        var tmp = [];
        if (multipleSearch) {

            var searchArray = multipleSearch.split(';');
            angular.forEach(searchArray, function(v, k) {

                if (v != '') {
                    angular.forEach(input, function(value) {
                        angular.forEach(value, function(prop, key) {
                            if (prop && prop.toLowerCase().indexOf(v.toLowerCase()) > -1) {
                                tmp.push(value);
                            }
                        });
                    });
                    input = tmp;
                    tmp = [];
                }
            });
        }

        if (input) {
            data = unique.apply(input);
        }
        data = $filter('filter')(data, search);


        return isEmpty ? input : data;
    }
});

app.filter('orderByHtml', function() {
    return function(input, order) {

        angular.forEach(input, function(value, key) {
            console.log(htmlToPlaintext(value[order]));
        });
    }
});

app.directive('reportTable', function($filter, $http) {
    'use strict';
    return {
        restrict: "E",
        replace: false,
        templateUrl: '/report/templates/report.html',
        scope: {
            headers: "=headers",
            loading: "=loading",
            rows: "=rows",
            paginationId: "=paginationId",
            reportName: "=reportName",
            config: "=config",
            remakeTable: "=?remakeTable",
            /////////////////////////////////////////////////////////////////////////////////////////////////
            addNewItemBtn: "=addNewItemBtn",
            errorOption: "=error",
            hidenSearch: "=?hidenSearch",
            sendEmail: "=?sendEmail",
            editModal: "=?editModal"
        },
        controller: function($scope) {
            $scope.selectSettings = {
                scrollableHeight: '300px',
                scrollable: true,
                enableSearch: true
            };
            $scope.selectTexts = {
                buttonDefaultText: 'Columns'
            };
        },
        link: function($scope, attr, $rootScope) {
            console.log('work');
            /////////////////////////////////////////////////////////////////////////////////////////////////
            $scope.widthFix = function() {
                //console.log(document.getElementById("contentRow").offsetWidth);
                return { "max-width": document.getElementById("contentRow").offsetWidth - 100 };
            }
            $scope.sendEmail = $scope.sendEmail;
            $scope.editModal = $scope.editModal;
            $scope.convertDate = convertDate;
            if (attr[0].attributes["search"]) $scope.searchOption = true;
            if (attr[0].attributes["total"]) $scope.totalOption = true;
            if (attr[0].attributes["fixed"]) $scope.fixedOption = true;
            if (attr[0].attributes["print-excel"]) $scope.printExcelOption = true;
            if (attr[0].attributes["print-pdf"]) $scope.printPdfOption = true;
            if (attr[0].attributes["title"]) $scope.titleOption = true;
            if (attr[0].attributes["select"]) $scope.selectOption = true;
            if (attr[0].attributes["remove"]) $scope.removeOption = true;
            $scope.setClassByOrder = function(index) {
                if ($scope.orderBy == (index.toString())) return "glyphicon-triangle-top arrov-fix";
                else if ($scope.orderBy == ((-index).toString())) return "glyphicon-triangle-bottom arrov-fix";
                else return "glyphicon-triangle-bottom";
            }

            $scope.selectSettings = {
                scrollableHeight: '300px',
                scrollable: true,
                enableSearch: true
            };
            $scope.selectTexts = {
                buttonDefaultText: 'Columns'
            };
            $scope.checkedCol = [];
            $scope.selectData = [];

            //Ajax Loading////////////////////////////////////////////////////////////////////////////////////////////////
            $scope.addLoadingClass = function() {
                    if ($scope.loading) return "loading";
                    else return "";
                }
                /////////////////////////////////////////////////////////////////////////////////////////////////
            $scope.currentPage = 1;
            $scope.searchString = {};
            $scope.orderBy = '';

            $scope.getDisplay = function(item) {
                for (var i = 0; i < $scope.checkedCol.length; i++) {
                    if (item == $scope.checkedCol[i].id) return true;
                }
                return false;
            }

            $scope.setOrderBy = function(index) {
                if ($scope.orderBy == index.toString()) {
                    $scope.orderBy = "-" + index;
                } else {
                    $scope.orderBy = index.toString();
                }
            }

            var searchString = function() {
                $scope.tableData = $filter('search')($scope.rows, $scope.searchString, $scope.search);
            };

            $scope.searchSelector = function(tt) {
                $scope.search = tt;
                //searchString();
            }

            var predicate = function(row) {
                var propertyName = $scope.orderBy;
                if ($scope.orderBy.indexOf("-") > -1) propertyName = $scope.orderBy.substring(1);
                if (!isNaN(Date.parse(row[propertyName]))) return new Date(row[propertyName]);
                return row[propertyName];
            }

            var orderBy = function() {
                $scope.tableData = $filter('orderBy')($scope.tableData, predicate, $scope.orderBy.indexOf("-") > -1);
            }

            $scope.remakeTable = function() {
                searchString();
                orderBy();
            };

            $scope.isHideSearch = function(id) {
                if ($scope.hidenSearch == undefined) return false;
                for (var i = 0; i < $scope.hidenSearch.length; i++) {
                    if ($scope.hidenSearch[i] == $scope.headers[id]) return true;
                }
                return false;

            }

            $scope.$watch('headers', function() {
                if ($scope.headers && !$scope.checkedCol.length) {
                    var selectData = [];
                    var selected = [];
                    var selectedItems = null;
                    if (angular.isArray($scope.headers[0])) selectedItems = $scope.headers.splice(0, 1)[0];
                    for (var i = 0; i < $scope.headers.length; i++) {
                        selectData.push({ id: i, label: $scope.headers[i] });
                        if (!selectedItems) selected.push({ id: i, label: $scope.headers[i] });
                        else {
                            var pos = selectedItems.indexOf($scope.headers[i]);
                            if (pos > -1) selected.push({ id: i, label: $scope.headers[i] });
                        }
                    }
                    $scope.selectData = selectData;
                    $scope.checkedCol = selected;
                }
            }, true);

            $scope.$watch('searchString', searchString, true);
            $scope.$watch('orderBy', orderBy, true);
            $scope.$watch('rows', function() {
                $scope.tableData = $scope.rows;


                $scope.remakeTable();
            }, true);
            $scope.$watch('search', searchString, true);

            var dt = new Date();
            var day = dt.getDate();
            var month = dt.toString().split(' ')[1];
            var year = dt.getFullYear();
            var postfix = " as of " + month + "-" + day + "-" + year;

            $scope.SaveToExcel = function(tableData, headerData, title) {

                var rows = [];
                angular.forEach(angular.copy(tableData), function(v, k) {
                    var row = [];
                    angular.forEach(v, function(item, key) {
                        if (key != "metadata")
                            row.push(item);
                    });
                    rows.push(row);
                });

                var table = {
                    header: angular.copy(headerData),
                    rows: angular.copy(rows),
                    title: angular.copy(title) + postfix
                };
                $http.post('/_vti_bin/ReportsService.svc/ExportToExcel', table).then(function(d) {
                    window.open("/_vti_bin/ReportsService.svc/GetExcelFile/" + d.data);
                });
            }

            $scope.SaveToPdf = function(tableData, headerData, title, pdfName) {

                var columns = [];
                var rows = [];

                angular.forEach(angular.copy(headerData), function(value, key) {
                    if ($scope.getDisplay(key)) columns.push(value ? value : '');
                });

                angular.forEach(angular.copy(tableData), function(obj, objKey) {
                    var cells = [];
                    angular.forEach(obj, function(value, key) {
                        if ($scope.getDisplay(key)) cells.push(value != null ? htmlToPlaintext(convertDate(value)) : '');
                    });
                    rows.push(cells);
                });

                var pdf = new jsPDF('l', 'pt', 'ledger');

                rows.push({ 0: 'Total:', 1: rows.length });

                pdf.autoTable(columns, rows, {
                    theme: 'grid',
                    margin: { top: 60, left: 40, right: 40, bottom: 40 },
                    headerStyles: {
                        lineColor: 1,
                        fillColor: [22, 120, 136],
                        textColor: [256, 256, 256],
                        rowHeight: 20
                    },
                    bodyStyles: {
                        fillColor: [256, 256, 256]
                    },
                    styles: {
                        textColor: [56, 91, 130],
                        fontSize: 10,
                        fontStyle: 'normal',
                        lineWidth: 0.1,
                        overflow: 'linebreak',
                        rowHeight: 20
                    },
                    drawCell: function(cell, data) {

                        //Hack :)
                        if (columns.lengt < 15) {
                            pdf.rect(data.settings.margin.left, data.row.y, data.table.width, 20, 'S');
                        }
                    },
                    beforePageContent: function(data) {
                        pdf.text(title.text, title.x, title.y);
                    }
                });
                pdf.save(pdfName + postfix + '.pdf');
            }

            function removeRow(row) {
                var flag = confirm("Item will be removed from the list.");
                if (flag === true) {
                    $http({
                        url: row.metadata.uri,
                        method: "POST",
                        headers: {
                            "Accept": "application/json;odata=verbose",
                            "X-Http-Method": "DELETE",
                            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                            "If-Match": row.metadata.etag
                        }
                    }).then(function(response) {
                        var index = $scope.rows.indexOf(row);
                        $scope.rows.splice(index, 1);
                    }, function(response) {
                        console.log(response);
                    });
                }
            }
            $scope.removeRow = removeRow;
        }
    };
});

function htmlToPlaintext(text) {
    var result = text ? String(text).replace(/<[^>]+>/gm, '') : '';
    //fix
    var fix = result.split("-->");
    return fix[0];
}

function loadScript(url) {
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Fire the loading
    head.appendChild(script);
}

function convertDate(str) {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/.test(str)) {
        var d = new Date(Date.parse(str));
        var result = "";
        result += d.getMonth() + 1 + "/" + d.getDate() + "/" + d.getFullYear() + " ";
        var hours = d.getHours();
        var minutes = d.getMinutes();
        var seconds = d.getSeconds();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        hours = hours < 10 ? '0' + hours : hours;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        result += hours + ':' + minutes + ":" + seconds + ' ' + ampm;
        return result;
    } else {
        return str;
    }

}