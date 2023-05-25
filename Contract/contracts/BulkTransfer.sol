// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interface/IERC20.sol";

contract BulkTransfer {

    struct Order {
        address to;
        uint amount;
    }

    function execute(address token,uint256 totalAmount,Order[] calldata orders) external {
        IERC20 tokenErc = IERC20(token);
        tokenErc.transferFrom(msg.sender, address(this), totalAmount);
        for (uint i; i < orders.length; i++){
            tokenErc.transfer(orders[i].to, orders[i].amount);
        }
            
    }
}