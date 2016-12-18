#!/usr/bin/env python

import os
import json

sourceFile = 'en.json'
jsFile = '../js/lang.js'
jsVar = 'app_lang'

with open(sourceFile) as f:    
    source = json.load(f)

with open(jsFile) as f:
    jsStr = f.read()
begin = jsStr.find('{')
end = jsStr.rfind('}') + 1
jsStr = jsStr[begin:end]
jsLang = json.loads(jsStr)

result = {}
result['en'] = source['en']

tokens = result['en'].keys()
for lang in source['langs']:
    result[lang] = {}
    for token in tokens:
        try:
            result[lang][token] = jsLang[lang][token]
        except:
            print 'Translate to '+lang+': '+source['en'][token]
            text = os.popen('./trans -b en:'+lang+' "'+source['en'][token]+'"').read();
            result[lang][token] = text[:len(text)-1];
            print result[lang][token]

with open(jsFile, 'w') as f:
    print >> f, 'var '+jsVar+' = '+json.dumps(result, indent = 4)+';'
print "language file updated!"
            
