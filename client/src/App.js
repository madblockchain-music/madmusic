import React, { Component } from "react";
import MadMusicContract from "./contracts/MadMusic.json";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";
import Modal from 'react-modal';

import "./App.css";

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

class App extends Component {
  state = { 
      storageValue: 0,
      web3: null,
      accounts: null, 
      contract: null, 
      songIDinTextBox: '',
      songs:[],
      songsLeft: [],
      modalIsOpen: false,
      donateModalIsOpen: false,
      selectedSong: null,
      donationAmount: 0
    };

  openAdminModal(selectedSong) {
    this.setState({
      modalIsOpen: true,
      selectedSong: selectedSong
    });
  }

  afterOpenModal() {
    // references are now sync'd and can be accessed.
  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }

  openDonateModal(selectedSong) {
    this.setState({
      donateModalIsOpen: true,
      selectedSong: selectedSong
    });
  }


  closeDonateModal() {
    this.setState({donateModalIsOpen: false});
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const Contract = truffleContract(MadMusicContract);
      Contract.setProvider(web3.currentProvider);
      const instance = await Contract.deployed();

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.log(error);
    }
  };

  handleSetCreatorsClick = async () => {
    console.warn("in handler");
    const { accounts, contract } = this.state;
    if(!this.state.creators || !this.state.percents)
    {     
      this.closeModal();
      return;
    }
    const creatorArray = this.state.creators.split(",");
    const percentArray = this.state.percents.split(",");
    console.warn(this.state.selectedSong);
    console.warn(creatorArray);
    console.warn(percentArray);
    await contract.setCreators(this.state.selectedSong, creatorArray, percentArray, {from: accounts[0], gas: 999999});
    this.closeModal();
    window.location.reload()
  }

  handleDonateClick = async () => {
    const { accounts, contract } = this.state;
    await contract.donate(this.state.selectedSong, {from: accounts[1], value: this.state.donationAmount});
    this.closeModal();
    window.location.reload()
  }

  handleNewDonateClick = async () => {
    const { accounts, contract } = this.state;
    this.openDonateModal(this.state.songIDinTextBox)
  }

  runExample = async () => {
    const { accounts, contract } = this.state;

    // Get the value from the contract to prove it worked.

    console.warn(contract)

    const response = await contract.percentToAdmin();

    const numberOfSongs = await contract.getNumberOfSongs();

    console.warn("number of songs: "+numberOfSongs.toNumber())

    var songIDs = [];

    for(var i = 0; i < numberOfSongs; i++) 
    {
      console.warn("i: "+i)
      songIDs.push(await contract.getSongID(i)) 
    }

    console.warn("songIDs: "+songIDs);

    for(var i = 0; i < numberOfSongs; i++) 
    {
      var huh = await contract.getSong(songIDs[i])
      console.warn([huh[0].toNumber(), huh[3].toNumber()])
      this.state.songs.push({key:songIDs[i], value:[huh[0].toNumber(), huh[1], huh[2],huh[3].toNumber()]})
    }

    this.state.songsLeft = this.state.songs;

    // Update state with the result.
    this.setState({ storageValue: response.toNumber(), songIDs: songIDs });
  };

  handleChangeCreators(event) {
    this.setState({creators: event.target.value})
  }

  handleChangePercents(event) {
    this.setState({percents: event.target.value})
  }

  handleChangeDonationAmount(event) {
    this.setState({donationAmount: event.target.value})
  }

  getUnclaimedString(value){
    if (value==0)
      return "All Proceeds Distributed";
    else
      return value;
  }

  onChangeHandler(e){
    this.setState({
      songIDinTextBox: e.target.value,
      songsLeft: this.state.songs.filter(d => e.target.value === '' || d.key.includes(e.target.value))
    })
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    const dynamicList = this.state.songsLeft
        .map((d, index) =>
        <div>
         <li key={index}>{d.key} {this.getUnclaimedString(d.value[0])} {d.value[1][0]} Total Donated:{d.value[3]}</li>
         {this.state.adminMode && <button onClick={() => this.openAdminModal(d.key)}>Set Creators</button>}
         {!this.state.adminMode && <button onClick={() => this.openDonateModal(d.key)}>Donate!</button>}
        </div>);
    return (
    <div>
        <h1 id="title">MadMusic</h1>
        <div>Percent going to MadMusic admins is: {this.state.storageValue}</div>
        <button onClick={() => this.setState({ adminMode: !this.state.adminMode })}>Toggle Admin Mode</button>
          <div>
          Song:  <input value={this.state.songIDinTextBox} type="text" onChange={this.onChangeHandler.bind(this)}/>
          <button onClick={() => this.handleNewDonateClick()} disabled={this.state.songsLeft.length>0}>Add Song!</button>
            <ul>{dynamicList}</ul>
          </div>

          {/*  Admin modal */}
          <Modal
          isOpen={this.state.modalIsOpen}
          style={customStyles}>
          <div className="panel-title3">
                Creators: <input type="text" value={this.state.creators} onChange={this.handleChangeCreators.bind(this)}/>
                Percents: <input type="text" value={this.state.percents} onChange={this.handleChangePercents.bind(this)}/>
                <button onClick={()=>this.handleSetCreatorsClick()}>Set Creators</button>
                </div>
                <div className="bottom-buttons">
                <button onClick={()=>this.closeModal()}>Cancel</button>
                <button onClick={()=>this.handleSetCreatorsClick()}>Set Creators</button>
                </div>
          </Modal>

          {/*  Donate modal */}
          <Modal
          isOpen={this.state.donateModalIsOpen}
          style={customStyles}>
          <div className="panel-title3">
                Donation Amount: <input type="text" value={this.state.donationAmount} onChange={this.handleChangeDonationAmount.bind(this)}/>
                </div>
                <div className="bottom-buttons">
                <button onClick={()=>this.closeDonateModal()}>Cancel</button>
                <button onClick={()=>this.handleDonateClick()}>Donate!</button>
                </div>
          </Modal>
        </div>
    );
  }
}

export default App;
