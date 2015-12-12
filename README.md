# mz-tools
[![Build Status](https://travis-ci.org/dani-h/mz-tools.svg?branch=master)](http://travis-ci.org/dani-h/mz-tools)

Scripts that parse ManagerZone html and store player's training report history.
The scripts parse the html behind logins using cookies.

# Configuration
Store your credentials file in $REPO\_ROOT/credentials.json with the structure

```
{
  "logindata": {
    "username": "xxx",
    "md5": "xxx",
    "sport": "xxx"
  }
}
```

You can retrieve this data when logging in to mz by tracking the network request in the developer
console of your browser.
