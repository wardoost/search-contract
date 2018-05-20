var GitHubIndex = artifacts.require("./GitHubIndex.sol");

module.exports = function(deployer) {
  deployer.deploy(GitHubIndex);
};
