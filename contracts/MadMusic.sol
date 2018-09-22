pragma solidity ^0.4.24;

contract MadMusic {

    address madMusicAdmin;
    uint public percentToAdmin;

    constructor(uint _percentToAdmin) public{
        madMusicAdmin = msg.sender;
        percentToAdmin = _percentToAdmin; 
    }

    struct Song {
        uint unclaimedMoney;
        address[] sendToAddresses;
        uint[] sendPercents;
    }

    mapping(bytes32 => Song) songs;

    bytes32[] public songIDs;
    function getSong(bytes32 songID) public view returns (uint,address[],uint[]){
        return (songs[songID].unclaimedMoney, songs[songID].sendToAddresses, songs[songID].sendPercents);
    }

    function donate(bytes32 songID) public payable {
        require(msg.value > 0, "Must donate non-zero amount");
        if(songs[songID].sendToAddresses.length==0){ // If there are no addresses to recieve revenue from song
            if (songs[songID].unclaimedMoney==0){ 
                songIDs.push(songID);
            }
            songs[songID].unclaimedMoney += msg.value;
        }
        else{ // If there are creators, send money to them
            for (uint i = 0 ; i < songs[songID].sendToAddresses.length; i++ ) {
                songs[songID].sendToAddresses[i].transfer(msg.value*songs[songID].sendPercents[i]/100-1);
            }
        }
    }

    function setCreators(bytes32 songID, address[] sendToAddresses, uint[] sendPercents) public {
        require(msg.sender == madMusicAdmin, "Please contact admin at admin@madmusic.com to set payee addresses.");
        if(songs[songID].sendToAddresses.length==0 && songs[songID].unclaimedMoney==0){ 
            songIDs.push(songID);
        }
        songs[songID].sendToAddresses = sendToAddresses;
        songs[songID].sendPercents = sendPercents;
        // Pay out all unclaimed money
        if (songs[songID].unclaimedMoney>0){
            for (uint i = 0 ; i < songs[songID].sendToAddresses.length; i++ ) {
                songs[songID].sendToAddresses[i].transfer(songs[songID].unclaimedMoney*songs[songID].sendPercents[i]/100-1);
            }
        }
        songs[songID].unclaimedMoney = 0;
    }
}
