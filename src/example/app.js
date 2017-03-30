var app = angular.module('MainApp', ['report'])
    .controller('MainCtrl', ['$scope', function($scope) {
        $scope.headers = ['test1', 'test2'];
        $scope.rows = [
            {
                0: "test1",
                1: "test2"
            },
            {
                0: "test1",
                1: "test2"
            },
            {
                0: "test1",
                1: "test2"
            },
            {
                0: "test1",
                1: "test2"
            },
            {
                0: "test1",
                1: "test2"
            },
            {
                0: "test1",
                1: "test2"
            },
            {
                0: "test1",
                1: "test2"
            },
            {
                0: "test1",
                1: "test2"
            },            
            {
                0: "test1",
                1: "test2"
            },
            {
                0: "test1",
                1: "test2"
            },
            {
                0: "test1",
                1: "test2"
            },
            {
                0: "test1",
                1: "test2"
            },
            {
                0: "test1",
                1: "test2"
            }
        ];
    }]);