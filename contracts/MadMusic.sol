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
        uint totalDonated;
    }

    mapping(string => Song) songs;
    string[] songIDs;

    function getNumberOfSongs() public view returns (uint){
        return (songIDs.length);
    }

    function getSongID(uint songNumber) public view returns (string){
        return songIDs[songNumber];
    }

    function getSong(string songID) public view returns (uint,address[],uint[],uint){
        return (songs[songID].unclaimedMoney, songs[songID].sendToAddresses, songs[songID].sendPercents, songs[songID].totalDonated);
    }

    function donate(string songID) public payable {
        require(msg.value > 0, "Must donate non-zero amount");
        if(songs[songID].sendToAddresses.length==0){ // If there are no addresses to recieve revenue from song
            if (songs[songID].unclaimedMoney==0){ // If song has not existed previously
                songIDs.push(songID);
            }
            songs[songID].unclaimedMoney += msg.value;
        }
        else{ // If there are creators, send money to them
            for (uint i = 0 ; i < songs[songID].sendToAddresses.length; i++ ) {
                songs[songID].sendToAddresses[i].transfer(msg.value*songs[songID].sendPercents[i]/100-1);
            }
        }
        songs[songID].totalDonated += msg.value;
    }

    function setCreators(string songID, address[] sendToAddresses, uint[] sendPercents) public {
        require(msg.sender == madMusicAdmin, "Please contact admin at admin@madmusic.com to set payee addresses.");
        require(songs[songID].unclaimedMoney>0, "Can only set creators to distribute money");
        for (uint i = 0; i < sendToAddresses.length; i++) {
            songs[songID].sendToAddresses.push(sendToAddresses[i]);
        }
        for ( i = 0; i < sendToAddresses.length; i++) {
            songs[songID].sendPercents.push(sendPercents[i]);
        }
        // Pay out all unclaimed money
        for ( i = 0 ; i < songs[songID].sendToAddresses.length; i++ ) {
            songs[songID].sendToAddresses[i].transfer(songs[songID].unclaimedMoney*songs[songID].sendPercents[i]/100-1);
        }
        songs[songID].unclaimedMoney = 0;
    }
}
