//config version: 3
export default {
    //change CatAC config here, set your own Anti Cheat!
    "chatrank": {
        "enabled": true,
        "defaultrank": ["§a§lMember"]
    },
    "chatcmd": {
        //enabled: true, false
        //Don't change admintag, because it may cause bug
        "prefix": "!",
        "datacancel": true, //cancel the message when player fail to run the command like disabled
        "nocolor": true,  //Anti message with color
        "nospace": true,  //Anti message start or end with space
        "admintag": "op",
        "info": {
            "enabled": true,
        },
        "ecw": {
            "enabled": true,
        },
        "wcheck": {
            "enabled": true,
        },
        "help": {
            "enabled": true,
        },
        "ban": {
            "enabled": true,
            "allowhardban": true, //To avoid admin HardBan player, false
        },
        "mute": {
            "enabled": true,
        },
        "freeze": {
            "enabled": true,
        },
        "warn": {
            "enabled": true,
        },
        "cleartext": {
            "enabled": true,
        },

        "npc": {
            "enabled": true,
        },

        "kit": {
            "enabled": true,
            "unfair": true, //enable summon 32k
            "fair": true,
            "legit": true
        }
    },
    "modules": {
        //punlishment: none, kick, ban, hardban
        //enabled: true, false
        "wellcomer": {
            "enabled": true
        },
        "forceOP": {
            "enabled": false,
            "punishment": "none",
            "oplist": [
                "BlueBoot6336421",
                "jasonlaubb"
            ]
        },
        "cbe": {
            "enabled": true,
            "allowsummonnpc": true
        },
        "crasher": {
            "enabled": true,
        },
        "antispamA": {
            "enabled": true,
            "sendlimit": 3,
        },
        "antispamC": {
            "enabled": true,
            "textlimit": 32,
        },
        "antispamB": {
            "enabled": true,
        },
        "ac": {
            "enabled": true,
            "maxcps": 24,
            "illegalcps": 55,
            "punishmentA": "none",
            "punishmentB": "ban"
        },
        "speed": {
            "enabled": true,
            "maxWalkingSpeed": 4.4,
            "maxSprintingSpeed": 5.7,
            "punishment": "none",
        },
        "invalidSprint": {
            "enabled": true,
            "punishment": "kick"
        },
        "itemCheckA": {
            "enabledA": true,
            "enabledB": true,
            "punishmentA": "kick",
            "punishmentB": "hardban",
            "itemlistA": [ //change the itemlist here
                "minecraft:bedrock",
                "minecraft:barrier",
                "minecraft:command_block",
                "minecraft:repeating_command_block",
                "minecraft:chain_command_block",
                "minecraft:deny",
                "minecraft:allow",
                "minecraft:border_block",
                "minecraft:light_block",
                "minecraft:end_portal",
                "minecraft:end_gateway",
                "minecraft:portal",
                "minecraft:end_portal_frame"
            ],
            "itemlistB": [
                "minecraft:moving_block",
                "minecraft:movingBlock",
                "minecraft:invisible_bedrock",
                "minecraft:invisibleBedrock",
                "minecraft:fire"
            ]
        },
        "itemCheckB": {
            "enabled": true,
            "punishment": "kick",
            //if your server are using custom enchant, enable allowmode
            "allowmode": false,
            "allowlevel": 32766
        },
        "itemCheckC": {
            "enabled": true,
            "limit": 64,
            "limitB": 16,
            "punishment": "kick",
            "itemlist": [
                "minecraft:egg",
                "minecraft:snowball"
            ]
        },
        "itemCheckD": {
            "enabled": true,
            "punishment": "kick",
            "isNormalLore": "DATA"
        },
        "itemCheckE": {
            "enabled": true,
            "punishment": "kick"
        },
        "itemCheckF": {
            "enabled": true,
            "punishment": "kick"
        },
        "itemCheckG": {
            "enabled": true,
            "punishment": "kick"
        },
        "itemCheckH": {
            "enabled": true,
            "punishment": "kick",
            "maxnamelength": 32
        },
        "itemCheckI": {
            "enabled": true,
            "punishment": "kick"
        },
        "placeCheck": {
            "enabled": true,
            "punishment": "kick",
            "blocklist": [
                "minecraft:moving_block",
                "minecraft:movingBlock",
                "minecraft:invisible_bedrock",
                "minecraft:invisibleBedrock",
                "minecraft:flowing_lava",
                "minecraft:lava",
                "minecraft:beehive",
                "minecraft:bee_nest",
                "minecraft:tnt",
                "minecraft:ender_crystal",
                "minecraft:respawn_anchor"
            ]
        },
        "fly": {
            "enabled": false,
            "punishment": "none"
        },
        "nuker": {
            "enabled": true,
            "maxdestroy": 4,
            "punishment": "kick" //You should not set it to none here!
        },
        "namespoof": {
            "enabled": true,
            "strings": "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ",
            "maxnamelegnth": 16,
            "minnamelegnth": 3
        },
        "insteaBreak": {
            "punishment": "kick",
            "enabled": true,
            "blocklist": [
                "minecraft:bedrock",
                "minecraft:barrier",
                "minecraft:command_block",
                "minecraft:repeating_command_block",
                "minecraft:chain_command_block",
                "minecraft:deny",
                "minecraft:allow",
                "minecraft:border_block",
                "minecraft:light_block",
                "minecraft:end_portal",
                "minecraft:end_gateway",
                "minecraft:portal",
                "minecraft:end_portal_frame"
            ]
        },
        "gamemode": {
            "default": "0", //gamemode 0,1,2
            "check": 0,
            "gmc": {
                "enabled": true,
                "punishment": "none"
            },
            "gms": {
                "enabled": false,
                "punishment": "none"
            },
            "gma": {
                "enabled": false,
                "punishment": "none"
            }
        }
    }
}