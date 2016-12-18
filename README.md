# Bolt bitcoin web wallet
[Go to wallet](http://vladimirtahl.github.io/bolt)

### How it works?
 - Everything runs on frontend (no backend)
 - User store his private keys inside a encrypt file
 - User is responsible for keep his private keys safe
 - Bolt wallet is responsible to implement bitcoin and encrypt features

### Is it secure? Yes... Why?
 - It is open source and anyone can and should audit the code
 - Everything run on front end, you are not trusting in anyone
 - Your private keys file is encrypt with sjcl, as long as this file is safe you are safe
 - Remember to choose a strong password 

### What technologies we use?
 - [Blockchain.info](https://blockchain.info/) for push transactions and receive informations
 - [bitcoinfees](https://bitcoinfees.21.co/) for find miner fee
 - [bitcoinjs](https://bitcoinjs.org/) for javascript bitcoin features
 - [sjcl](https://crypto.stanford.edu/sjcl/) stanford library for js encrypt
 - [angular1](https://angularjs.org/) as web framework
 - [bootstrap3](http://getbootstrap.com/) for layouts
 - [mocha](https://mochajs.org/) as a test framework

### Is it possible to self hosting?
 - Yes!
 
```
$ git clone https://github.com/vladimirtahl/bolt
$ cd bolt
$ python -m SimpleHTTPServer 3000
```

### What are bolt goals?
 - Be the most user friendly bitcoin wallet. Simple, clean with the right tools!
 - User friendly means speaks all languages. Translations is a priority!
 - User friendly means convert to all currencies. Real time convertion to as many currencies as possible!
 - Expand digital currencies options. Bolt wants to be a digital wallet!
 - Security is very important! Best encrypt practises and cover all software with tests!
 - Create a great community of users and developers!

### How can I contribute?
 - Help us with our goals!
 - You may consider making a donation.

### Contact
 - Feel free to send an email: vladimirtahl@sigaint.org
