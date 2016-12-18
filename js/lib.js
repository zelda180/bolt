(function(){
	var lib = angular.module('lib', []);

    lib.factory('$lib', function($timeout,$window,$http,$q,$httpParamSerializerJQLike){
		var $lib = {};

        $lib.session = function(obj){
            if (obj === undefined){
                var x = JSON.parse($window.sessionStorage.getItem('wallet'));
                return x ? x : {
                    data: {
                        privateKey: []
                    },
                    modified: false,
                    password: ""
                };
            }
            $window.sessionStorage.setItem('wallet', JSON.stringify(obj));
        };

        $lib.download = function(name, data){
            var a           = document.createElement('a');
            a.href          = 'data:attachment/txt,'+encodeURI(data);
            a.target        = '_blank';
            a.download      = name;

            document.body.appendChild(a);
            $timeout(function() {
                a.click();
            }, 0);
            document.body.removeChild(a);
        };

        $lib.upload = function(file, callback){
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function(){
                callback(reader.result);
            };
        };

        $lib.encrypt = function(key, message){
            var obj = sjcl.encrypt(key, message);
            var str = JSON.stringify(obj);
            return str;
        };

        $lib.decrypt = function(key, cypher){
            var obj = JSON.parse(cypher);
            return sjcl.decrypt(key, obj);
        };

        $lib.createAddress = function(){
            var key = bitcoin.ECPair.makeRandom();
            return key.toWIF();
        };

        $lib.keyPair = function(privateKey){
            return bitcoin.ECPair.fromWIF(privateKey);
        };

        $lib.publicKey = function(privateKey){
            return $lib.keyPair(privateKey).getAddress();
        };

        $lib.privateKey = function(publicKey){
            var session = $lib.session();
            var privateKey = "";

            session.data.privateKey.forEach(function(key){
                if (publicKey === $lib.publicKey(key))
                    privateKey = key;
            });

            return privateKey;
        };

        $lib.int = function(value){
            value = parseInt(value);
            value = isNaN(value) ? 0 : value;
            return value;
        };

        $lib.float = function(value){
            value = parseFloat(value);
            value = isNaN(value) ? 0 : value;
            return value;
        };

        $lib.satoshi = function(mbtc){
            return $lib.int(100000 * $lib.float(mbtc));
        };

        $lib.mbtc = function(satoshi){
            return $lib.float($lib.int(satoshi)) / 100000;
        };

        $lib.transaction = function(address, send, txs, miner, value){
            miner = $lib.int(miner);
            value = $lib.int(value);

            var fee = (2*34+10)*miner;
            var inputs = 0;

            var key = $lib.privateKey(address);

            var tx = new bitcoin.TransactionBuilder();

            for (i = 0; i < txs.length && inputs < fee + value; i++){
                inputs += txs[i].value;
                fee += 181*miner;

                tx.addInput(txs[i].tx_hash_big_endian, txs[i].tx_output_n);
            }

            tx.addOutput(send, value);

            fee -= fee % 1000;
            if (inputs > fee + value)
                tx.addOutput(address, inputs - fee - value);

            var keyPair = $lib.keyPair(key);
            for (var j = 0; j < i; j++)
                tx.sign(j, keyPair);

            var total = value + miner;

            return {
                inputs: inputs,
                fee: fee,
                value: value,
                tx: tx.build().toHex()
            };
        };

        $lib.cors = function(url, data){
            var deferred = $q.defer();
            var headers = data ? {
                'Content-Type': 'application/x-www-form-urlencoded' 
            } : undefined;
            var data = data ? $httpParamSerializerJQLike(data) : undefined;

            console.log("cors: "+url);

            $http({
                url: url,
                method: data ? 'POST' : 'GET',
                data: data, 
                headers: headers
            }).success(function(data){
                console.log("success");
                //console.log(JSON.stringify(data, undefined, 2));
                deferred.resolve(data);
            }).error(function(err){
                console.log("server error");
                console.log(err);
                deferred.reject(err);
            });

            return deferred.promise;
        };

		return $lib;
	});

    lib.directive('fileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;

                element.bind('change', function(){
                    scope.$apply(function(){
                        modelSetter(scope, element[0].files);
                    });
                });
            }
        };
    }]);

    lib.directive('pager', function(){
        return {
            restrict	: 'E',
            templateUrl : 'view/pager.html',
            replace 	: true,
            scope 		: {
                page 		: '=',
                max 		: '='
            },
            controller 	: function($scope){
                $scope.$watch('max', function(){
                    if (isNaN($scope.max) || $scope.max < 1)
                        $scope.max = 1;
                    if ($scope.max % 1 !== 0)
                        $scope.max = Math.round($scope.max);
                });

                $scope.$watch('page', function(){
                    if (
                        isNaN($scope.page) ||
                        $scope.page < 1 ||
                        $scope.page > $scope.max
                    )
                        $scope.page = 1;
                });
            }
        }
    });
})();
