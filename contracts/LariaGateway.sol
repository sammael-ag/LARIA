// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LariaGateway is Ownable {
    IERC20 public lariaToken;
    
    // Nastavenie tvojich misiek váh (80% tebe, 20% sýpka)
    uint256 public ownerShare = 80;
    uint256 public reserveShare = 20;

    // Definovanie "balíčkov" LARIA (zohľadnené 18 desatinných miest)
    uint256 public fullAmount = 1 * 10**18;        // 1.0 LARIA
    uint256 public freeAmount = 1 * 10**15;        // 0.001 LARIA

    event TokensDistributed(address indexed user, uint256 amount, string userType);

    constructor(address _lariaTokenAddress) Ownable(msg.sender) {
        lariaToken = IERC20(_lariaTokenAddress);
    }

    // Funkcia, ktorú zavolá tvoj Gbot po prijatí platby v EUR
    function onboardUser(address _user, bool _isFull) external onlyOwner {
        uint256 amount = _isFull ? fullAmount : freeAmount;
        string memory userType = _isFull ? "Full" : "Free";

        require(lariaToken.balanceOf(address(this)) >= amount, "Nedostatok LARIA v kontrakte!");
        
        lariaToken.transfer(_user, amount);
        emit TokensDistributed(_user, amount, userType);
    }

    // Tu si neskôr nastavíš zmenu pomerov, keď sa "vystrábiš"
    function updateRatios(uint256 _owner, uint256 _reserve) external onlyOwner {
        require(_owner + _reserve == 100, "Sucet musi byt 100");
        ownerShare = _owner;
        reserveShare = _reserve;
    }
}
