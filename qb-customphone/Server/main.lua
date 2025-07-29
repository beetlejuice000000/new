-- server/main.lua
local QBCore = exports['qb-core']:GetCoreObject()
local Config = Config or {}
QBCore.Functions.CreateUseableItem(Config.PhoneItem, function(source, item)
    TriggerClientEvent('qb-iphone:client:usePhone', source)
end)

-- Phone SQL Tables
MySQL.ready(function()
    MySQL.Async.execute([[
        CREATE TABLE IF NOT EXISTS `phone_contacts` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `citizenid` varchar(50) DEFAULT NULL,
            `name` varchar(50) DEFAULT NULL,
            `number` varchar(20) DEFAULT NULL,
            PRIMARY KEY (`id`),
            KEY `citizenid` (`citizenid`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]])
    
    MySQL.Async.execute([[
        CREATE TABLE IF NOT EXISTS `phone_messages` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `citizenid` varchar(50) DEFAULT NULL,
            `number` varchar(20) DEFAULT NULL,
            `message` text DEFAULT NULL,
            `type` varchar(10) DEFAULT 'received',
            `date` timestamp DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `citizenid` (`citizenid`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]])
    
    MySQL.Async.execute([[
        CREATE TABLE IF NOT EXISTS `phone_calls` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `citizenid` varchar(50) DEFAULT NULL,
            `number` varchar(20) DEFAULT NULL,
            `type` varchar(10) DEFAULT 'missed',
            `date` timestamp DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `citizenid` (`citizenid`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]])
    
    MySQL.Async.execute([[
        CREATE TABLE IF NOT EXISTS `phone_gallery` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `citizenid` varchar(50) DEFAULT NULL,
            `image` varchar(255) DEFAULT NULL,
            `date` timestamp DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `citizenid` (`citizenid`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]])
    
    MySQL.Async.execute([[
        CREATE TABLE IF NOT EXISTS `phone_settings` (
            `citizenid` varchar(50) NOT NULL,
            `settings` longtext DEFAULT NULL,
            PRIMARY KEY (`citizenid`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]])
    
    print("^2[QB-iPhone]^7 Database tables created successfully!")
end)

-- Events
RegisterNetEvent('qb-iphone:server:sendMessage', function(number, message)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if not Player then return end
    
    MySQL.Async.insert('INSERT INTO phone_messages (citizenid, number, message, type) VALUES (?, ?, ?, ?)', {
        Player.PlayerData.citizenid,
        number,
        message,
        'sent'
    })
    
    -- Find target player
    local target = QBCore.Functions.GetPlayerByPhone(number)
    if target then
        MySQL.Async.insert('INSERT INTO phone_messages (citizenid, number, message, type) VALUES (?, ?, ?, ?)', {
            target.PlayerData.citizenid,
            Player.PlayerData.charinfo.phone,
            message,
            'received'
        })
        TriggerClientEvent('qb-iphone:client:receiveMessage', target.PlayerData.source, Player.PlayerData.charinfo.phone, message)
    end
end)

RegisterNetEvent('qb-iphone:server:saveContact', function(name, number)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if not Player then return end
    
    MySQL.Async.insert('INSERT INTO phone_contacts (citizenid, name, number) VALUES (?, ?, ?)', {
        Player.PlayerData.citizenid,
        name,
        number
    })
end)

RegisterNetEvent('qb-iphone:server:savePhoto', function(image)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if not Player then return end
    
    MySQL.Async.insert('INSERT INTO phone_gallery (citizenid, image) VALUES (?, ?)', {
        Player.PlayerData.citizenid,
        image
    })
end)

RegisterNetEvent('qb-iphone:server:saveSettings', function(settings)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if not Player then return end
    
    MySQL.Async.execute('INSERT INTO phone_settings (citizenid, settings) VALUES (?, ?) ON DUPLICATE KEY UPDATE settings = ?', {
        Player.PlayerData.citizenid,
        json.encode(settings),
        json.encode(settings)
    })
end)

