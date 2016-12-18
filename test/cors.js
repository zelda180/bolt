var assert = chai.assert;

function cors(url, data, callback, debug){
    var method = data ? 'POST' : 'GET';
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) 
        xhr.open(method, url, true);
    else if (typeof XDomainRequest != "undefined") {
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } 
    else {
        callback("No xhr object!");
        return;
    }

    xhr.onload = function() {
        try {
            var data = JSON.parse(xhr.response);
        } catch (err){
            var data = xhr.response;
        }
        if (debug)
            console.log(JSON.stringify(data, undefined, 4));
        callback(data);
    };

    xhr.onerror = function() {
        throw new Error("Fail Cors request!");
    };

    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    
    xhr.send(data);
}

describe('#bitcoinfees', function(){
    it('should get fees', function(done){
        var url = 'https://bitcoinfees.21.co/api/v1/fees/recommended';
        cors(url, null, function(data){
            assert(data !== undefined);
            assert(data.fastestFee);
            done();
        });
    });
});

describe('#blockchain.info', function(){
    var address = '1F1tAaz5x1HUXrCNLbtMDqcw6o5GNn4xqX';
    var path = 'https://blockchain.info';
    var param = '?format=json&cors=true';
    var hash = 'e3abfc68469b62112768e7912576229169266496cca2aba769e06e2276889dc1';
    var rawTx = 'tx=0100000001313eb630b128102b60241ca895f1d0ffca2170d5a0990e094f2182c102ab94aa000000006a47304402202c830a6a3ca9b62f61a2619d5502b51f48d3a8d9f27cc5ba5d315dacab646fec022048d36b6ea23c77d00e69cdfe7781fdba2208eb46190f758606e1b17520aa72670121029f50f51d63b345039a290c94bffd3180c99ed659ff6ea6b1242bca47eb93b59fffffffff02983a0000000000001976a914ad618cf4333b3b248f9744e8e81db2964d0ae39788aca8de0000000000001976a91447862fe165e6121af80d5dde1ecb478ed170565b88ac00000000';

    it('should get multi address', function(done){
        var url = path+'/multiaddr'+param+'&active='+address;
        cors(url, null, function(data){
            assert(data.wallet !== undefined);
            assert(data.wallet.final_balance > 0);
            assert(data.wallet.n_tx > 0);
            assert(data.addresses !== undefined);
            assert(data.addresses.length == 1);

            data.addresses.forEach(function(a){
                assert(a.address === address);
                assert(a.final_balance > 0);
                assert(a.n_tx > 0);
            });

            assert(data.txs !== undefined);
            assert(data.txs.length == 50);

            data.txs.forEach(function(tx){
                assert(tx.time > 0);
                assert(tx.hash !== undefined);
                assert(tx.result !== undefined);
            });
            done();
        });
    });
    
    it('should get transaction', function(done){
        var url = path+'/rawtx/'+hash+'?format=json&cors=true';
        cors(url, null, function(tx){
            assert(tx.inputs !== undefined);
            assert(tx.inputs.length);
            
            tx.inputs.forEach(function(inp){
                assert(inp.prev_out.addr !== undefined);
                assert(inp.prev_out.value > 0);
            });
            
            assert(tx.out !== undefined);
            assert(tx.out.length);

            tx.out.forEach(function(out){
                assert(out.addr !== undefined);
                assert(out.value > 0);
            });
            
            done();
        });
    });

    it('should get unspent', function(done){
        var url = path+'/unspent'+param+'&active='+address;
        cors(url, null, function(data){
            assert(data.unspent_outputs !== undefined);
            assert(data.unspent_outputs.length > 0);

            data.unspent_outputs.forEach(function(tx){
                assert(tx.value > 0);
            });
            done();
        });
    });

    it('should send transaction', function(done){
        var url = path+'/pushtx?cors=true';
        cors(url, rawTx, function(data){
            assert(data == "An outpoint is already spent in [68484347]\n");
            done();
        });
    });
});
