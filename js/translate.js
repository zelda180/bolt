(function(){
	var app = angular.module('app');

    app.config(function ($translateProvider) {
        $translateProvider.useSanitizeValueStrategy('escape');

        Object.keys(app_lang).forEach(function(lang){
            $translateProvider.translations(lang, app_lang[lang]);
        });

        $translateProvider.preferredLanguage('en');
    });
})();
