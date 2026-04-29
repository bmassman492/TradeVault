// public/test.js

import * as API from './api.js';

const userinfo = await API.GetAuthContext('testuser', 'testpass');
console.log(userinfo);
console.log(userinfo.userId);