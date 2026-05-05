// public/test.js

import * as API from './api.js';

const username = await API.GetUsername(7);
console.log(username[0].username);
