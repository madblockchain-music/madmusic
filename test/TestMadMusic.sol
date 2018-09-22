pragma solidity ^0.4.24;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/MadMusic.sol";

contract TestMadMusic {

    uint public initialBalance = 10 ether;

    function testItStoresAValue() public {
        MadMusic madMusic = MadMusic(DeployedAddresses.MadMusic());

        madMusic.donate.value(2)(23);
        
        uint a;
        address[] memory b;
        uint[] memory c;

        (a,b,c) = madMusic.getSong(23);
        Assert.equal(a, 2, "It should store the value 2.");
    }
}
