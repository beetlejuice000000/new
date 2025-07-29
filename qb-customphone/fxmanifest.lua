-- fxmanifest.lua
fx_version 'cerulean'
game 'gta5'

author 'Your Name'
description 'QB-Core iPhone Interface'
version '1.0.0'

shared_scripts {
    'config.lua'
}

client_scripts {
    'client/main.lua',
    'client/phone.lua',
    'client/apps/*.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/main.lua',
    'server/callbacks.lua'
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/style.css',
    'html/script.js',
    'html/apps/*.html',
    'icons/*.png'
}

dependencies {
    'qb-core',
    'oxmysql'
}