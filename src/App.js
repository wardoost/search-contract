import React, {Component, Fragment} from 'react'
import Web3 from 'web3'

import {abi} from '../build/contracts/GitHubIndex.json'
import {promisify} from './utils/contracts'

export default class App extends Component {
  constructor(props){
    super(props)

    if(typeof web3 != 'undefined'){
      console.log("Using web3 detected from external source like Metamask")
      this.web3 = new Web3(web3.currentProvider)
    } else {
      this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
    }

    this.web3.eth.defaultAccount = this.web3.eth.accounts[0]

    this.state = {
      error: null,
      search: '',
      contract: web3.eth.contract(abi).at(process.env.CONTRACT_ADDRESS),
      username: '',
      users: [],
      selected: ''
    }
  }

  componentDidMount() {
    this.state.contract.LogNewUser((error, result) => {
      console.log('LogNewUser', error, result);

      if (result) {
        this.setState({
          users: users.concat({
            username: result[1],
            address: result[0]
          })
        })
      }
    })

    this.state.contract.LogUpdateUser((error, result) => {
      console.log('LogUpdateUser ', error, result)
      
      if (result){
        const updateIndex = result[2]

        this.setState({
          users: users.map((user, index) => {
            if (index === updateIndex) {
              return {
                ...user,
                username: result[1],
                address: result[0]
              }
            }

            return user
          })
        })
        console.log(result.toNumber())
      }
    })

    this.getUserList()
  }

  getUserList = async () =>{
    const userCountResult = await promisify(this.state.contract.getUserCount)
    const userCount = userCountResult.toNumber()

    console.log(userCount)
    const users = []

    for (let i = 0; i < userCount; i++) {
      const userIndexResult = await promisify(this.state.contract.getUserAtIndex, i)
      const userResult = await promisify(this.state.contract.getUser, userIndexResult)

      users.push({
        username: userResult[0],
        address: userIndexResult
      })
    }

    this.setState({users})
  }

  updateUsername = event =>  {
    this.setState({username: event.target.value});
  }

  addToIndex = () => {
    this.state.contract.addUser(this.state.username, {
      gas: 300000,
      from: web3.eth.accounts[0],
      value: 0
    }, (error, result) => {
      console.log(error, result)

      if (error) {
        this.setState({
          error: `Could not add ${web3.eth.accounts[0]} to search index`
        })
      } else {
        location.reload();
      }
    })
  }

  updateValue = (value, id) => {
    this.setState({[id]: value});
  }

  donate = address => {
    this.web3.eth.sendTransaction({
      gas: 300000,
      from: web3.eth.accounts[0],
      to: address,
      value: web3.toWei(1, 'ether')
    }, (error, result) => {
      console.log(error, result)
    })
  }

  render() {
    const users = this.state.users.filter(({username}) => username.includes(this.state.search))

    return (
      <div className="container">
        {this.state.error && <section className="error">
          <p>{this.state.error}</p>
        </section>}
        <h2>Search for users to donate to</h2>
        <section className="search">
          <input 
            type="text" 
            value={this.state.search} 
            onChange={event => this.updateValue(event.target.value, 'search')} 
            placeholder="Search by GitHub username" 
          />
          <div className="searchResults">
            {users.length
              ? users.map(({username, address}, index) => (
              <div key={index} className='user'>
                {username}
                <button onClick={() => this.donate(address)}>
                  Donate
                </button>
              </div>
            ))
          : <p>No matches...</p>}
          </div>
        </section>
        <h2>Add yourself to the list</h2>
        <section className="add">
          <input 
            type="text" 
            value={this.state.username} 
            onChange={event => this.updateValue(event.target.value, 'username')} 
            placeholder="GitHub username" 
          />
          <button onClick={this.addToIndex}>
            Add me
          </button>
        </section>
      </div>
    )
  }
}
