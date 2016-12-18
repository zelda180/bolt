(function(){
	var app = angular.module('modal', ['ui.bootstrap']);

    app.factory('$modal', function($q,$uibModal){
		var $modal = {};

        $modal.alert = function (obj){
            if (typeof obj === "string")
                var data = {
                    message: obj
                };
            else
                var data = obj;

            $uibModal.open({
                templateUrl: 'view/alert.html',
                resolve: {
                    data: function(){
                        return data;
                    }
                },
                size: 'sm',
                controller: 'modal'
            });
        };

		return $modal;
	});

    app.controller('modal', function($uibModalInstance,$scope,data){
        $scope.data = data;

        $scope.ok = function (obj) {
            $uibModalInstance.close(obj);
        };

        $scope.cancel = function (obj) {
            $uibModalInstance.dismiss(obj);
        };
    });
})();
