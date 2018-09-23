import React, { Component } from "react";
import MadMusicContract from "./contracts/MadMusic.json";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";
import Modal from 'react-modal';

import "./App.css";
import WarningLogo from'./baseline_warning_black_48dp.png';
import OkLogo from'./baseline_check_circle_outline_black_48dp.png';

class App extends Component {
  state = { 
      web3: null,
      accounts: null, 
      contract: null, 
      songIDinTextBox: '',
      songs:[],
      songsLeft: [],
      modalIsOpen: false,
      donateModalIsOpen: false,
      selectedSong: null,
      donationAmount: ''
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
    document.addEventListener("keydown", this.escFunction, false);
    this.nameInput.focus();
  };

  componentWillUnmount(){
    document.removeEventListener("keydown", this.escFunction, false);
  }

  escFunction(event){
    if(event.keyCode === 192) {
      this.setState({ adminMode: !this.state.adminMode });
        }
  }

  constructor(props){
    super(props);
    this.escFunction = this.escFunction.bind(this);
  }

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
      songsLeft: this.state.songs.filter(d => e.target.value === '' || d.key.toLowerCase().includes(e.target.value.toLowerCase()))
    })
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    const dynamicList = this.state.songsLeft
        .map((d, index) =>
        <div class="material-panel info">
		      <div class="head">{d.key}</div>
          <div  class="body">
            <div className="left">
Tipped Total: {d.value[3]} ETH </div>
            <div className="right">
              {d.value[1].length==0 && <img src={WarningLogo} width="20px" height="20px" title="Song creators have not yet registered to recieve donations" />}
              {d.value[1].length>0 && <img src={OkLogo} width="20px" height="20px" title={"Creator addresses:"+d.value[1]} />}
              {this.state.adminMode && d.value[1].length==0  && <button class="song-button" onClick={() => this.openAdminModal(d.key)}>Set Artist Payment Info</button>}
              {!this.state.adminMode && <button class="song-button" onClick={() => this.openDonateModal(d.key)}>Back It!</button>}
			   </div>
      </div>
		</div>);
    return (
    <div id="content">
      <div className="top">
        MadMusic 
      </div>
      <div className="search-class">
            <input ref={(input) => { this.nameInput = input; }} value={this.state.songIDinTextBox} type="text" placeholder="Search for song..." onChange={this.onChangeHandler.bind(this)}/>
            {this.state.songsLeft.length==0 && <button onClick={() => this.handleNewDonateClick()} >Add Song!</button>}
            <ul>{dynamicList}</ul>
            </div>
          {/*  Admin modal */}
          <Modal
          isOpen={this.state.modalIsOpen}
          className="Modal"
          overlayClassName="Overlay">
          <div className="panel-title3">
          Specify the addresses to be paid for {this.state.selectedSong}:
                Creators: <input type="text" class="input-modal" value={this.state.creators} onChange={this.handleChangeCreators.bind(this)}/>
                Percents: <input type="text" class="input-modal" value={this.state.percents} onChange={this.handleChangePercents.bind(this)}/>
                </div>
                <div className="bottom-buttons">
                <button onClick={()=>this.closeModal()}>Cancel</button>
                <button onClick={()=>this.handleSetCreatorsClick()}>Set Creators</button>
                </div>
          </Modal>

          {/*  Donate modal */}
          <Modal
          isOpen={this.state.donateModalIsOpen}
          className="Modal"
          overlayClassName="Overlay">
               <div className="panel-title3">
                Tip the creators of {this.state.selectedSong}: <input type="text" class="input-modal" value={this.state.donationAmount} onChange={this.handleChangeDonationAmount.bind(this)}/>
                ETH</div>
                <div className="bottom-buttons">
                <button onClick={()=>this.closeDonateModal()}>Cancel</button>
                <button onClick={()=>this.handleDonateClick()}>Confirm</button>
                </div>
          </Modal>
        </div>
    );
  }
}

export default App;
