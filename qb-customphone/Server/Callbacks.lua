-- server/callbacks.lua
local QBCore = exports['qb-core']:GetCoreObject()

QBCore.Functions.CreateCallback('qb-iphone:server:getContacts', function(source, cb)
    local Player = QBCore.Functions.GetPlayer(source)
    if not Player then cb({}) return end
    
    MySQL.Async.fetchAll('SELECT * FROM phone_contacts WHERE citizenid = ?', {
        Player.PlayerData.citizenid
    }, function(result)
        cb(result or {})
    end)
end)

QBCore.Functions.CreateCallback('qb-iphone:server:getMessages', function(source, cb)
    local Player = QBCore.Functions.GetPlayer(source)
    if not Player then cb({}) return end
    
    MySQL.Async.fetchAll('SELECT * FROM phone_messages WHERE citizenid = ? ORDER BY date DESC', {
        Player.PlayerData.citizenid
    }, function(result)
        cb(result or {})
    end)
end)

QBCore.Functions.CreateCallback('qb-iphone:server:getGallery', function(source, cb)
    local Player = QBCore.Functions.GetPlayer(source)
    if not Player then cb({}) return end
    
    MySQL.Async.fetchAll('SELECT * FROM phone_gallery WHERE citizenid = ? ORDER BY date DESC', {
        Player.PlayerData.citizenid
    }, function(result)
        cb(result or {})
    end)
end)

QBCore.Functions.CreateCallback('qb-iphone:server:getSettings', function(source, cb)
    local Player = QBCore.Functions.GetPlayer(source)
    if not Player then cb(Config.PhoneSettings) return end
    
    MySQL.Async.fetchSingle('SELECT settings FROM phone_settings WHERE citizenid = ?', {
        Player.PlayerData.citizenid
    }, function(result)
        if result and result.settings then
            cb(json.decode(result.settings))
        else
            cb(Config.PhoneSettings)
        end
    end)
end)