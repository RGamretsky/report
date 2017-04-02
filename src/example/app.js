var app = angular.module('MainApp', ['report','ui.select'])
    .controller('MainCtrl', ['$scope', function($scope) {
        $scope.headers = ['test1', 'test2', 'test3'];
        $scope.rows = [
            {
                0: "test1",
                1: "test2",
                2: "test3"
            },
            {
                0: "test1",
                1: "test2",
                2: "test3"
            },
            {
                0: "test2",
                1: "test2",
                2: "test3"
            },
            {
                0: "test1",
                1: "test2",
                2: "test3"
            },
            {
                0: "test1",
                1: "test2",
                2: "test3"
            },
            {
                0: "test1",
                1: "test2",
                2: "test3"
            },
            {
                0: "test3",
                1: "test3",
                2: "test3"
            },
            {
                0: "test1",
                1: "test2",
                2: "test3"
            },            
            {
                0: "test1",
                1: "test2",
                2: "test3"
            },
            {
                0: "test1",
                1: "test2",
                2: "test3"
            },
            {
                0: "test1",
                1: "test2",
                2: "test3"
            },
            {
                0: "test1",
                1: "test2",
                2: "test3"
            },
            {
                0: "test1",
                1: "test3",
                2: "test3"
            }
        ];
    }]);