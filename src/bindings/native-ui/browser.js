export default class LanguageDetector {

    detect() {
        let found = [];

        if (typeof navigator !== 'undefined') {
          if (navigator.languages) { // chrome only; iterate with for-of to handle iterable

            console.log('# navigator languages', navigator.languages)
            for (const lang of navigator.languages) {
              found.push(lang);
            }
          }
          if (navigator.userLanguage) {
            found.push(navigator.userLanguage);
          }
          if (navigator.language) {
            found.push(navigator.language);
          }
        }

        if (!found) return found;

        try {
            // only use iso country code
            found = found.map( l=> l.substring(0,2))

            // remove duplciates
            found = found.filter( (x,i)=> i===found.indexOf(x))
        
        }
        catch(err) {
            console.log('~~~ ERR',err)
        }

        return found

    }
}