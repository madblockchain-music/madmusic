import React, { Component } from "react";
import MadMusicContract from "./contracts/MadMusic.json";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";

import "./App.css";

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

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

  runExample = async () => {
    const { accounts, contract } = this.state;

    // Get the value from the contract to prove it worked.

    console.warn(contract)

    const response = await contract.percentToAdmin();

    // Update state with the result.
    this.setState({ storageValue: response.toNumber() });
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (

    <div class = "container">
        <div class="jumbotron text-center">
          <h1 id="title">MadMusic</h1>
        </div>
          <div>Percent going to MadMusic admins is: {this.state.storageValue}</div>

      <div class="col-md-12" id="article-list">
          <div class="row">
            <div class="col-lg-12">
              <p id="account" class="welcome pull-right"></p>
              <p id="accountBalance" class="welcome pull-left"></p>
            </div>
          </div>

        <div class="row panel panel-default">
          <div class="panel-heading clearfix" id="title-chunk">
            <div class="panel-title">
              <button id="btn-top-left" class="btn btn-lg pull-left" data-toggle="collapse" data-target="#events" aria-expanded="false" aria-controls="events">Events</button>
              <button id="btn-top-right" class="btn btn-lg pull-right" data-toggle="modal" data-target="#sellArticle">Sell an article</button>
            </div>
          </div>
          <ul id="events" class="collapse list-group"></ul>
        </div>

        <div id="articlesRow" class="row">
          
        </div>
      </div>
    </div>
    );
  }
}

export default App;
