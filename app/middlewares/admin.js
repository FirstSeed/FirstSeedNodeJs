/* jslint node: true */
'use strict';

module.exports = {
  static: require('./static'),
  favicon: require('./favicon'),
  locals: require('./locals'),
  bodyParserJson: require('./bodyParser.json'),
  bodyParserUrl: require('./bodyParser.urlencoded'),
  session: require('./session')
};
