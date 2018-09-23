const MadMusic = artifacts.require("./MadMusic.sol");

contract("MadMusic", accounts => {
  it("...should record donation of 3 to song 24.", async () => {
    const madMusicInstance = await MadMusic.deployed();

    await madMusicInstance.donate("24", {value: 3});
        
    const ret = await madMusicInstance.getSong("24");

    const noice = ret[0];

    assert.equal(noice, 3, "3 has been donated to song 24.");

  });
  it("...should record donation of 4000 to song 25.", async () => {
    const madMusicInstance = await MadMusic.deployed();

    await madMusicInstance.donate("25", {value: 4000});
        
    var ok = ["0x0d1d4e623d10f9fba5db95830f7d3839406c6af2", "0x821aea9a577a9b44299b9c15c88cf3087f3b5544"];
    var ok2 = [40,40];

    console.warn("Right before setCreators!");
    await madMusicInstance.setCreators("25", ok, ok2, {gas: 999999});

    const ret = await madMusicInstance.getSong("25");

    console.warn(ret[0].toNumber());
    console.warn(ret[1]);
    console.warn(ret[2]);
    console.warn(ret[3].toNumber());
  });
});
