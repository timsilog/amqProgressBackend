const { searchAnilist } = require('./anilist');

searchAnilist('kekkaishi').then(res => console.log(res));