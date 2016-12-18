var assert = chai.assert;

describe('#miscellaneous', function(){
    var $lib;

    beforeEach(module('lib'));

    beforeEach(inject(function($injector){
        $lib = $injector.get('$lib');
    }));

    after(function(){
        window.sessionStorage.clear();
    });

    it('session should work correctly', function(){
        var obj = {
            value: 35,
            name: "Ball",
            colors: [
                'red',
                'green',
                'blue'
            ],
            shape: {
                radius: 12,
                weight: 24,
                profile: [
                    3.3,
                    2.1,
                    9
                ]
            }
        };

        $lib.session(obj);

        var sameObj = $lib.session();

        assert(
            JSON.stringify(obj) === JSON.stringify(sameObj),
            "Objects are the same"
        );
    });

    it('should encrypt and decrypt', function(){
        var password = "someInputPass";
        var wrongPass = "someStrangePass";
        var message = "Hello criptography! I really like to hide!";

        var cypher = $lib.encrypt(password, message);
        var plain = $lib.decrypt(password, cypher);

        assert(plain === message);

        var fail;
        try {
            $lib.decrypt(wrongPass, cypher);
            fail = false;
        } catch (err){
            fail = true;
        }

        if (!fail)
            throw new Error("Wrong password!");
    });

    it('should work correctly with numbers', function(){
        assert($lib.int("C5") === 0);
        assert($lib.int(2.91) === 2);
        assert($lib.int(1.01) === 1);
        assert($lib.int("2.91") === 2);
        assert($lib.int("1.01") === 1);
        assert($lib.int(-1) === -1);
        assert($lib.int(5) === 5);
        assert($lib.int("-1") === -1);
        assert($lib.int("5") === 5);

        assert($lib.float("C5") === 0);
        assert($lib.float(2.91) === 2.91);
        assert($lib.float(1.01) === 1.01);
        assert($lib.float("2.91") === 2.91);
        assert($lib.float("1.01") === 1.01);
        assert($lib.float(-1) === -1);
        assert($lib.float(5) === 5);
        assert($lib.float("-1") === -1);
        assert($lib.float("5") === 5);

        assert($lib.satoshi("C5") === 0);
        assert($lib.satoshi(2.91) === 291000);
        assert($lib.satoshi(1.01) === 101000);
        assert($lib.satoshi("2.91") === 291000);
        assert($lib.satoshi("1.01") === 101000);
        assert($lib.satoshi(-1) === -100000);
        assert($lib.satoshi(5) === 500000);
        assert($lib.satoshi("-1") === -100000);
        assert($lib.satoshi("5") === 500000);

        assert($lib.mbtc("C5") === 0);
        assert($lib.mbtc(2.91) === 0.00002);
        assert($lib.mbtc(1.01) === 0.00001);
        assert($lib.mbtc("2.91") === 0.00002);
        assert($lib.mbtc("1.01") === 0.00001);
        assert($lib.mbtc(-1) === -0.00001);
        assert($lib.mbtc(5) === 0.00005);
        assert($lib.mbtc("-1") === -0.00001);
        assert($lib.mbtc("5") === 0.00005);
    });
});

describe('#bitcoin', function(){
    var $lib;
    var key;
    var kx='L1uyy5qTuGrVXrmrsvHWHgVzW9kKdrp27wBC7Vs6nZDTF2BRUVwy';
    var kxp;

    beforeEach(module('lib'));

    beforeEach(inject(function($injector){
        $lib = $injector.get('$lib');
    }));

    after(function(){
        window.sessionStorage.clear();
    });

    it('should create address', function(){
        key = $lib.createAddress();
        assert(key !== undefined);
        assert(key.length > 40);
        assert(key.length <= 52);
    });

    it('should store some address', function(){
        var session = $lib.session();

        for (var i = 0; i < 3; i++)
            session.data.privateKey.push($lib.createAddress());
        session.data.privateKey.push(key);
        session.data.privateKey.push(kx);

        $lib.session(session);
        var x = $lib.session();
        assert(x.data.privateKey[3] === key);
    });

    it('should correctly manage address', function(){
        var public = $lib.publicKey(key);
        assert(public.length > 25);
        assert(public.length <= 34);
        var private = $lib.privateKey(public);
        assert(private === key);
        kxp = $lib.publicKey(kx);
    });

    it('should built transactions', function(){
        var out = '1Gokm82v6DmtwKEB8AiVhm82hyFSsEvBDK';
        var txId = 'aa94ab02c182214f090e99a0d57021caffd0f195a81c24602b1028b130b63e31';
        var expected = '0100000001313eb630b128102b60241ca895f1d0ffca2170d5a0990e094f2182c102ab94aa000000006a47304402202c830a6a3ca9b62f61a2619d5502b51f48d3a8d9f27cc5ba5d315dacab646fec022048d36b6ea23c77d00e69cdfe7781fdba2208eb46190f758606e1b17520aa72670121029f50f51d63b345039a290c94bffd3180c99ed659ff6ea6b1242bca47eb93b59fffffffff02983a0000000000001976a914ad618cf4333b3b248f9744e8e81db2964d0ae39788aca8de0000000000001976a91447862fe165e6121af80d5dde1ecb478ed170565b88ac00000000';

        var actual = $lib.transaction(
            kxp, out, [{
                "tx_hash_big_endian": txId,
                "tx_output_n": 0,
                "value": 90000
            }], 70, 15000
        );
        assert (actual.tx === expected);
        assert (actual.fee === 18000);
    });
});
