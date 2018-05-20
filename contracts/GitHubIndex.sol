pragma solidity ^0.4.20;

contract GitHubIndex {
  address public owner;
  address[] private userIndex;

  struct User {
    string username;
    uint index;
  }

  mapping(address => User) private users;

  event LogNewUser(address indexed userAddress, string username, uint index);
  event LogUpdateUser(address indexed userAddress, string username, uint index);

  function constuctor() public{
    owner = msg.sender;
  }

  function kill() public {
    if(msg.sender == owner) selfdestruct(owner);
  }

  function isUser(address userAddress) public view returns(bool isIndeed) {
    if(userIndex.length == 0) return false;
    return (userIndex[users[userAddress].index] == userAddress);
  }

  function addUser(string username) public returns(uint index) {
    require(!isUser(msg.sender));

    users[msg.sender].username = username;
    users[msg.sender].index = userIndex.push(msg.sender) - 1;

    emit LogNewUser(msg.sender, username, users[msg.sender].index);

    return userIndex.length - 1;
  }
  
  function getUser(address userAddress) public view returns(string username, uint index) {
    require(isUser(userAddress));
    
    return(
      users[userAddress].username, 
      users[userAddress].index
    );
  } 
  
  function updateUser(string username) public returns(bool success) {
    require(isUser(msg.sender));
    users[msg.sender].username = username;

    emit LogUpdateUser(msg.sender, username, users[msg.sender].index);
    
    return true;
  }

  function getUserCount() public view returns(uint count) {
    return userIndex.length;
  }

  function getUserAtIndex(uint index) public view returns(address userAddress) {
    return userIndex[index];
  }

  // Fallback function in case someone sends ether to the contract so it doesn't get lost
  function() public payable {}
}
