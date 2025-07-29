local QBCore = exports['qb-core']:GetCoreObject()

local phoneOpen = false
local phoneObj = nil
local phoneData = {}

-- Events
RegisterNetEvent('QBCore:Client:OnPlayerLoaded', function()
    PlayerData = QBCore.Functions.GetPlayerData()
end)

RegisterNetEvent('QBCore:Client:OnPlayerUnload', function()
    PlayerData = {}
end)

-- Phone item usage
RegisterNetEvent('qb-iphone:client:usePhone', function()
    if phoneOpen then
        ClosePhone()
    else
        OpenPhone()
    end
end)

-- Functions
function OpenPhone()
    if phoneOpen then return end
    
    phoneOpen = true
    
    -- Create phone prop
    local playerPed = PlayerPedId()
    local coords = GetEntityCoords(playerPed)
    
    phoneObj = CreateObject(GetHashKey(Config.PhoneModel), coords.x, coords.y, coords.z, true, true, false)
    AttachEntityToEntity(phoneObj, playerPed, GetPedBoneIndex(playerPed, 28422), 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, true, true, false, true, 1, true)
    
    -- Play animation
    RequestAnimDict(Config.PhoneAnimDict)
    while not HasAnimDictLoaded(Config.PhoneAnimDict) do
        Wait(0)
    end
    TaskPlayAnim(playerPed, Config.PhoneAnimDict, Config.PhoneAnim, 3.0, -1, -1, 50, 0, false, false, false)
    
    -- Load phone data
    LoadPhoneData()
    
    -- Open NUI
    SetNuiFocus(true, true)
    SendNUIMessage({
        action = "openPhone",
        phoneData = phoneData
    })
end

function ClosePhone()
    if not phoneOpen then return end
    
    phoneOpen = false
    
    -- Close NUI
    SetNuiFocus(false, false)
    SendNUIMessage({
        action = "closePhone"
    })
    
    -- Remove phone prop
    if phoneObj then
        DeleteObject(phoneObj)
        phoneObj = nil
    end
    
    -- Stop animation
    local playerPed = PlayerPedId()
    StopAnimTask(playerPed, Config.PhoneAnimDict, Config.PhoneAnim, 1.0)
end

function LoadPhoneData()
    local PlayerData = QBCore.Functions.GetPlayerData()
    
    phoneData = {
        playerName = PlayerData.charinfo.firstname .. " " .. PlayerData.charinfo.lastname,
        phoneNumber = PlayerData.charinfo.phone,
        apps = Config.DefaultApps,
        time = os.date("%H:%M"),
        date = os.date("%d/%m/%Y"),
        battery = math.random(15, 100),
        signal = math.random(1, 4)
    }
end

-- NUI Callbacks
RegisterNUICallback('closePhone', function(data, cb)
    ClosePhone()
    cb('ok')
end)

RegisterNUICallback('loadApp', function(data, cb)
    local app = data.app
    
    if app == "contacts" then
        QBCore.Functions.TriggerCallback('qb-iphone:server:getContacts', function(contacts)
            cb({success = true, data = contacts})
        end)
    elseif app == "messages" then
        QBCore.Functions.TriggerCallback('qb-iphone:server:getMessages', function(messages)
            cb({success = true, data = messages})
        end)
    elseif app == "gallery" then
        QBCore.Functions.TriggerCallback('qb-iphone:server:getGallery', function(gallery)
            cb({success = true, data = gallery})
        end)
    elseif app == "settings" then
        QBCore.Functions.TriggerCallback('qb-iphone:server:getSettings', function(settings)
            cb({success = true, data = settings})
        end)
    else
        cb({success = false, error = "App not found"})
    end
end)

RegisterNUICallback('sendMessage', function(data, cb)
    TriggerServerEvent('qb-iphone:server:sendMessage', data.number, data.message)
    cb('ok')
end)

RegisterNUICallback('saveContact', function(data, cb)
    TriggerServerEvent('qb-iphone:server:saveContact', data.name, data.number)
    cb('ok')
end)

RegisterNUICallback('takePhoto', function(data, cb)
    -- Take screenshot and save
    exports['screenshot-basic']:requestScreenshotUpload('your-upload-url', 'files[]', function(data)
        local image = json.decode(data)
        if image and image.attachments and image.attachments[1] then
            TriggerServerEvent('qb-iphone:server:savePhoto', image.attachments[1].proxy_url)
        end
    end)
    cb('ok')
end)

RegisterNUICallback('saveSettings', function(data, cb)
    TriggerServerEvent('qb-iphone:server:saveSettings', data.settings)
    cb('ok')
end)

-- Commands
RegisterCommand('phone', function()
    local PlayerData = QBCore.Functions.GetPlayerData()
    local hasPhone = false
    
    for k, v in pairs(PlayerData.items) do
        if v.name == Config.PhoneItem then
            hasPhone = true
            break
        end
    end
    
    if hasPhone then
        TriggerEvent('qb-iphone:client:usePhone')
    else
        QBCore.Functions.Notify("You don't have a phone", "error")
    end
end)

RegisterKeyMapping('phone', 'Open Phone', 'keyboard', 'F1')

Config = {}

Config.PhoneItem = "phone" -- or whatever your phone item is called in shared/items.lua

local QBCore = exports['qb-core']:GetCoreObject()
local isPhoneOpen = false

-- Setup the keybind (M to open/close)
RegisterCommand("togglephone", function()
    isPhoneOpen = not isPhoneOpen

    if isPhoneOpen then
        -- Open phone UI
        SetNuiFocus(false, false) -- <-- This keeps game input enabled
        SendNUIMessage({
            action = "openPhone"
        })
    else
        -- Close phone UI
        SetNuiFocus(false, false)
        SendNUIMessage({
            action = "closePhone"
        })
    end
end, false)

-- Keybind M to command
RegisterKeyMapping("togglephone", "Toggle Phone", "keyboard", "M")

-- Optional: If your NUI needs callback to close
RegisterNUICallback("closePhone", function(_, cb)
    isPhoneOpen = false
    SetNuiFocus(false, false)
    cb({})
end)
RegisterCommand("togglephone", function()
    print("Phone toggle command triggered!") -- DEBUG OUTPUT

    SetNuiFocus(false, false) -- Keeps your player visible
    SendNUIMessage({
        action = "openPhone"
    })
end, false)

RegisterKeyMapping("togglephone", "Toggle Phone", "keyboard", "M")
