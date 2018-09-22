const MadMusic = artifacts.require("./MadMusic.sol");

contract("MadMusic", accounts => {
  it("...should record donation of 3 to song 24.", async () => {
    const madMusicInstance = await MadMusic.deployed();

    await madMusicInstance.donate(24, {value: 3});
        
    const ret = await madMusicInstance.getSong(24);

    console.warn(ret)

    const noice = ret[0];

    assert.equal(noice, 3, "3 has been donated to song 24.");

  });
});
