(function(){
	var app = angular.module('app');

    app.config(function($stateProvider,$urlRouterProvider){
        $urlRouterProvider.otherwise('/wallet?lang=en');

        $stateProvider.state('wallet', {
            url             : '/wallet?lang',
            templateUrl     : 'view/wallet.html',
            controller      : 'wallet'
        });

        $stateProvider.state('import', {
            url             : '/import',
            templateUrl     : 'view/import.html',
            controller      : 'import'
        });

        $stateProvider.state('save', {
            url             : '/save',
            templateUrl     : 'view/save.html',
            controller      : 'save'
        });

        $stateProvider.state('address', {
            url             : '/address',
            templateUrl     : 'view/address.html',
            controller      : 'address'
        });

        $stateProvider.state('transactions', {
            url             : '/transactions/:address',
            templateUrl     : 'view/transactions.html',
            controller      : 'transactions'
        });

        $stateProvider.state('transaction', {
            url             : '/transaction/:address',
            templateUrl     : 'view/transaction.html',
            controller      : 'transaction'
        });
	});
})();
