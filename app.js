(function(){
	var app = angular.module('app', [
        'ngSanitize',
        'ui.router',
        'pascalprecht.translate',
        'lib',
        'modal'
    ]);
   
    app.controller('wallet', function($lib,$scope,$state,$modal,$translate,$window){
        $scope.$watch('lang', function(){
            if (!app_lang[$scope.lang]){
                if (!app_lang[$state.params.lang]){
                    var lang =  $window.navigator.language 
                        || $window.navigator.userLanguage;
                    $scope.lang = lang.substr(0, 2);
                }
                
                else
                    $scope.lang = $state.params.lang;
            }

            if (!app_lang[$scope.lang])
                $scope.lang = 'en';
            
            $translate.use($scope.lang);
            
            if ($scope.lang != $state.params.lang)
                $state.go('wallet', {lang : $scope.lang});
        });
        
        $scope.langs = [];

        Object.keys(app_lang).forEach(function(lang){
            if (app_iso[lang])
                $scope.langs.push({
                    id: lang,
                    label: app_iso[lang].nativeName+' ('+lang+')'
                });
        });

        $scope.go = $state.go;
        $scope.view = $lib.session();
        $scope.data = {
            sort: 'balance',
            reverse: true,
            balance: 0,
            transactions: 0,
            addresses: []
        };

        var addresses = '';

        $scope.view.data.privateKey.forEach(function(key){
            if (addresses.length)
                addresses += '|';
            addresses += $lib.publicKey(key);
        });

        $lib
        .cors('https://blockchain.info/multiaddr?format=json&cors=true&active='+addresses)
        .then(function(data){
            if (data.wallet){
                $scope.data.balance = $lib.mbtc(data.wallet.final_balance);
                $scope.data.transactions = data.wallet.n_tx;
            }

            if (!data.addresses)
                return;

            data.addresses.forEach(function(a){
                $scope.data.addresses.push({
                    address: a.address,
                    balance: $lib.mbtc(a.final_balance),
                    transactions: a.n_tx
                });
            });
        });
    });

    app.controller('transactions', function($lib,$scope,$state,$modal){
        $scope.go = $state.go;
        $scope.view = $lib.session();
        $scope.data = {
            page: 1,
            max: 1
        };

        var pageSize = 50;

        $scope.address = {
            address: $state.params.address,
            balance: 0,
            transactions: []
        };

        $scope.tx = null;

        $scope.toogleTx = function(hash){
            if ($scope.tx && $scope.tx.hash == hash){
                $scope.tx = null;
                return;
            }

            $lib.cors('https://blockchain.info/rawtx/'+hash+'?format=json&cors=true')
            .then(function(tx){
                $scope.tx = {
                    hash: hash,
                    inputs: [],
                    outputs: [],
                    fee: 0
                };

                tx.inputs.forEach(function(inp){
                    $scope.tx.inputs.push({
                        address: inp.prev_out.addr,
                        value: $lib.mbtc(inp.prev_out.value)
                    });
                    $scope.tx.fee += $lib.mbtc(inp.prev_out.value);
                });

                tx.out.forEach(function(out){
                    $scope.tx.outputs.push({
                        address: out.addr,
                        value: $lib.mbtc(out.value)
                    });
                    $scope.tx.fee -= $lib.mbtc(out.value);
                });
                console.log($scope.tx)
            });
        };

        $scope.$watch('data.page', function(){
            if (!$scope.data.page)
                return;

            var skip = ($scope.data.page - 1) * pageSize;
            var address = $state.params.address;
            $lib
            .cors('https://blockchain.info/multiaddr?format=json&cors=true&active='+address+'&limit='+pageSize+'&offset='+skip)
            .then(function(data){
                if(data.addresses && data.addresses.length === 1){
                    var addr = data.addresses[0];
                    $scope.address.address = addr.address;
                    $scope.data.max = Math.ceil(addr.n_tx / pageSize);
                    $scope.address.balance=$lib.mbtc(addr.final_balance);
                }
                $scope.address.transactions = [];

                data.txs.forEach(function(tx){
                    var date = new Date(tx.time * 1000);

                    $scope.address.transactions.push({
                        date: date.toLocaleString(),
                        hash: tx.hash,
                        result: $lib.mbtc(tx.result)
                    });
                });
            });
        });
    });

    app.controller('transaction', function($lib,$scope,$state,$modal){
        $scope.go = $state.go;
        $scope.view = $lib.session();

        var txs;

        $scope.load = function(){
            $lib.cors('https://bitcoinfees.21.co/api/v1/fees/recommended')
            .then(function(data){
                $scope.data = {
                    address: $state.params.address,
                    miner: data.fastestFee,
                    balance: 0,
                    send: ""
                };

                return $lib.cors('https://blockchain.info/unspent?format=json&cors=true&active='+$state.params.address);
            }).then(function(data){
                txs = data.unspent_outputs;

                txs.forEach(function(tx){
                    $scope.data.balance += $lib.mbtc(tx.value);
                })
            }).catch(function(err){
                $modal.alert('ALERT_BALANCE');
                $state.go('transactions', {address: $scope.data.address});
            });
        };

        $scope.load();

        $scope.build = function(){
            try {
                var obj = $lib.transaction(
                    $scope.data.address,
                    $scope.data.send,
                    txs,
                    $scope.data.miner,
                    $lib.satoshi($scope.data.value)
                );
                $scope.data.value = $lib.float($scope.data.value);
                $scope.data.fee = $lib.mbtc(obj.fee);
                $scope.data.tx = obj.tx;
                console.log(obj.tx);
            } catch(err){
                $modal.alert('ALERT_TX');
                $scope.load();
            }
        };

        $scope.run = function(){
            $lib.cors('https://blockchain.info/pushtx?cors=true', {
                tx: $scope.data.tx
            }).then(function(data){
                console.log(data);
                $modal.alert('ALERT_SEND');
                $state.go('transactions', {address: $scope.data.address});
            }).catch(function(err){
                $modal.alert('ALERT_FAIL');
            });
        };
    });

    app.controller('import', function($lib,$scope,$state,$modal){
        $scope.go = $state.go;
        $scope.data = {};
        $scope.view = $lib.session();

        $scope.run = function(){
            if (
                !$scope.file ||
                !$scope.file[0]
            ){
                $modal.alert('ALERT_FILE');
                return;
            }

            $lib.upload($scope.file[0], function(data){
                if (data.substr(1, 1) === "{"){
                    try {
                        data = $lib.decrypt($scope.data.password, data);
                        $scope.view.password = $scope.data.password;
                    } catch (err){
                        $modal.alert('ALERT_DECRIPT');
                        return;
                    }
                }

                $scope.view.data = JSON.parse(data);
                $scope.view.modified = false;
                $lib.session($scope.view);
                $state.go('wallet');
            });
        };
    });

    app.controller('address', function($lib,$scope,$state,$modal){
        $scope.go = $state.go;
        $scope.view = $lib.session();
        $scope.data = {};

        $scope.run = function(){
            var address;
            if ($scope.data.privateKey){
                try {
                    $lib.publicKey($scope.data.privateKey);
                } catch (err){
                    $modal.alert('ALERT_KEY');
                    $scope.data.privateKey = "";
                    return;
                }
                address = $scope.data.privateKey;
            }
            else {
                address = $lib.createAddress();
            }
            $scope.view.data.privateKey.push(address);
            $modal.alert('ALERT_NEW');
            $scope.view.modified = true;
            $lib.session($scope.view);
            $state.go('wallet');
        };
    });

    app.controller('save', function($lib,$scope,$state,$modal){
        $scope.data = {enc:''};

        $scope.go = $state.go;
        $scope.view = $lib.session();

        $scope.data.enc = $scope.view.password ? "1" : "2";

        $scope.run = function(){
            var password;

            var data = JSON.stringify($scope.view.data, undefined, 2);

            if ($scope.data.enc == "1"){
                if (!$scope.view.password){
                    $modal.alert('ALERT_PASS');
                    return;
                }
                password = $scope.view.password;
            }

            if ($scope.data.enc == "2"){
                if (
                    !$scope.data.password ||
                    $scope.data.password.length < 6
                ){
                    $modal.alert('ALERT_MIN');
                    $scope.data.password = "";
                    $scope.data.confirm = "";
                    return;
                }

                if ($scope.data.confirm !== $scope.data.password){
                    $modal.alert('ALERT_MATCH');
                    $scope.data.password = "";
                    $scope.data.confirm = "";
                    return;
                }

                password = $scope.data.password;
                $scope.view.password = password;
            }

            if (password){
                data = $lib.encrypt(password, data);
                $scope.view.password = password;
            }

            $lib.download('bolt.txt', data);
            $scope.view.modified = false;
            $lib.session($scope.view);
            $state.go('wallet');
        };
    });
})();
