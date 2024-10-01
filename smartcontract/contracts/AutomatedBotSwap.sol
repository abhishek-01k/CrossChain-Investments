// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// swap tokens inside BTS from USDC to ETH  automatically by the Bot to ensure that the Investment strategy is always profitable.
contract AutomatedBotSwap is KeeperCompatibleInterface {
    IUniswapV2Router02 public uniswapRouter;
    address public tokenA;
    address public tokenB;
    address public owner;
    uint public lastTimeStamp;
    uint public interval;
    address public priceFeedA;
    address public priceFeedB;

    constructor(
        address _uniswapRouter,
        address _tokenA,
        address _tokenB,
        uint _interval,
        address _priceFeedA,
        address _priceFeedB
    ) {
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
        tokenA = _tokenA;
        tokenB = _tokenB;
        owner = msg.sender;
        interval = _interval;
        lastTimeStamp = block.timestamp;
        priceFeedA = _priceFeedA;
        priceFeedB = _priceFeedB;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    function checkUpkeep(
        bytes calldata
    ) external override returns (bool upkeepNeeded, bytes memory) {
        upkeepNeeded =
            (block.timestamp - lastTimeStamp) > interval &&
            isPoolProfitable();
    }

    function performUpkeep(bytes calldata) external override {
        if (
            (block.timestamp - lastTimeStamp) > interval && isPoolProfitable()
        ) {
            lastTimeStamp = block.timestamp;
            executeSwap();
        }
    }

    function isPoolProfitable() public view returns (bool) {
        uint priceA = getLatestPrice(priceFeedA);
        uint priceB = getLatestPrice(priceFeedB);
        uint profitabilityThreshold = 105; // Example threshold (5% profitability)
        return priceA >= (priceB * profitabilityThreshold) / 100;
    }

    function getLatestPrice(
        address priceFeedAddress
    ) public view returns (uint) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            priceFeedAddress
        );
        (, int price, , , ) = priceFeed.latestRoundData();
        return uint(price);
    }

    function executeSwap() internal {
        uint amountIn = 0.0001 ether;
        uint amountOutMin = 0;
        address[] memory path = new address[](2);
        path[0] = tokenA;
        path[1] = tokenB;
        uniswapRouter.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            address(this),
            block.timestamp
        );
    }

    function setNewInterval(uint _interval) external onlyOwner {
        interval = _interval;
    }

    function withdrawTokens(address _token) external onlyOwner {
        uint balance = IERC20(_token).balanceOf(address(this));
        IERC20(_token).transfer(owner, balance);
    }
}
