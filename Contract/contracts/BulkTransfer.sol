// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interface/IERC20.sol";

contract BulkTransfer {

    error TransferFromFailed();
    event DistributionError(address to, uint amount);

    struct Order {
        address to;
        uint amount;
    }

    function execute(address token,uint256 totalAmount,Order[] calldata orders) external {
        IERC20 tokenErc = IERC20(token);
        bool success = tokenErc.transferFrom(msg.sender, address(this), totalAmount);
        if (!success)
            revert TransferFromFailed();
        uint failureAmount;
        bool sent;
        for (uint i; i < orders.length; i++){
            sent = tokenErc.transfer(orders[i].to, orders[i].amount);
            if(!sent){
                failureAmount += orders[i].amount;
                emit DistributionError(orders[i].to, orders[i].amount);
            } 
        }
        if(failureAmount > 0){
            tokenErc.transfer(msg.sender, failureAmount);
        }
    }
}