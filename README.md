datamonkey-js
========================

INSTALL
===========================
## System Dependencies
* node
* mongodb-server
* redis

On OSX, this can be done with [Homebrew](http://brew.sh/) as follows:

    brew install npm
    brew install mongodb
    brew install redis

You'll also have to set a data directory for MongoDB, as described [here](http://docs.mongodb.org/manual/tutorial/). For example, on OSX or Linux, you can set up a data directory in the home directory as follows:

    mkdir -p ~/data/db

## Check out datamonkey-js

    git clone git@github.com:veg/datamonkey-js.git

This requires an SSH key for GitHub, as described [here](https://help.github.com/articles/generating-ssh-keys).

## Install development tools
    
    npm install -g supervisor
    
## Install package

    cd ./datamonkey-js/
    make install

## Configure

    cp ./config/setup.js.tpl ./config/setup.js

The settings within ```./config/setup.js``` will have to be changed to reflect the local environment.

## Run

Start Redis

    redis-server

Start MongoDB (e.g. using the data directory in HOME)

    mongod --dbpath ~/data/db

Start datamonkey.js

    node server.js

Datamonkey should now be running at [localhost:4002](http://localhost:4002).
