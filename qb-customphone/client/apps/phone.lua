-- client/phone.lua
local QBCore = exports['qb-core']:GetCoreObject()

local inCall = false
local currentCall = nil

-- Phone calls
RegisterNUICallback('makeCall', function(data, cb)
    local number = data.number
    
    -- Find player with this number
    QBCore.Functions.TriggerCallback('qb-core:server:getPlayerByPhone', function(target)
        if target then
            TriggerServerEvent('qb-iphone:server:startCall', target.source, number)
            inCall = true
            currentCall = {
                number = number,
                name = target.name or "Unknown"
            }
            cb({success = true, target = currentCall})
        else
            cb({success = false, error = "Number not found"})
        end
    end, number)
end)

RegisterNUICallback('endCall', function(data, cb)
    if inCall then
        TriggerServerEvent('qb-iphone:server:endCall', currentCall.number)
        inCall = false
        currentCall = nil
    end
    cb('ok')
end)

RegisterNetEvent('qb-iphone:client:receiveCall', function(caller)
    SendNUIMessage({
        action = "incomingCall",
        caller = caller
    })
end)

RegisterNetEvent('qb-iphone:client:receiveMessage', function(number, message)
    SendNUIMessage({
        action = "newMessage",
        number = number,
        message = message
    })
    
    QBCore.Functions.Notify("New message from " .. number, "primary")
end)

-- Usage item
QBCore.Functions.CreateUseableItem(Config.PhoneItem, function(source, item)
    TriggerClientEvent('qb-iphone:client:usePhone', source)
end)