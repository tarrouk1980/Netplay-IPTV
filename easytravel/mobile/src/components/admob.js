// Point d'accès unique au SDK AdMob.
//
// Le package `react-native-google-mobile-ads` est un module natif : il ne
// fonctionne pas dans Expo Go et ferait planter le bundler s'il était
// importé sans être installé. En développement, ce module exporte donc null
// et les composants pub affichent un placeholder.
//
// POUR ACTIVER LES VRAIES PUBS (build production EAS) :
//   1. npx expo install react-native-google-mobile-ads
//   2. Ajouter le plugin + tes IDs AdMob dans app.json (voir README)
//   3. Décommenter la ligne ci-dessous :
//
// export const admob = require('react-native-google-mobile-ads');

export const admob = null;
