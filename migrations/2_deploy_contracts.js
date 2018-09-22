var MadMusic = artifacts.require("./MadMusic.sol");

var percentToAdmins = 3; 
module.exports = function(deployer) {
  deployer.deploy(MadMusic, percentToAdmins);
};
