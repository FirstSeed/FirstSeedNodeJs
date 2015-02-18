/* jslint node: true */
'use strict';

exports.port = process.env.PORT || 3000;
exports.companyName = "FirsSeed S.A.S";
exports.projectName = "FirsSeed Node Js";
exports.cryptoKey = 'lolkats';

exports.systemEmail = 'juvasquez88@gmail.com';
exports.loginAttempts = {
  forIp: 50,
  forIpAndUser: 50,
  logExpiration: '20m'
};
exports.smtp = {
  from: {
    name: process.env.SMTP_FROM_NAME || exports.projectName +' FirstSeed',
    address: process.env.SMTP_FROM_ADDRESS || 'juvasquez88@gmail.com'
  },
  credentials: {
    user: process.env.SMTP_USERNAME || 'juvasquez88@gmail.com',
    password: process.env.SMTP_PASSWORD || 'sosecret',
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    ssl: true
  }
};
