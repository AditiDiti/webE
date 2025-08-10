// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ScoreRegistry {
    struct UserScore {
        uint256 score;
        uint256 lastUpdated;
        string details; // JSON or IPFS hash for transparency
    }

    mapping(address => UserScore) public scores;
    event ScoreUpdated(address indexed user, uint256 score, string details);

    // Update score (could be called by an oracle or scoring engine)
    function updateScore(address user, uint256 newScore, string calldata details) external {
        scores[user] = UserScore({score: newScore, lastUpdated: block.timestamp, details: details});
        emit ScoreUpdated(user, newScore, details);
    }

    // Get score for a user
    function getScore(address user) external view returns (uint256, uint256, string memory) {
        UserScore memory us = scores[user];
        return (us.score, us.lastUpdated, us.details);
    }
}
