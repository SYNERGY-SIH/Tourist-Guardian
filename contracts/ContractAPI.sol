// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract ContractAPI {
    // Owner of the contract
    address public owner;

    // Counter to generate unique tourist IDs
    uint256 public nextTouristId;

    // Struct to define a Tourist
    struct Tourist {
        uint256 touristId;
        string adhaarNo;
        string bandId;
        string groupId;
        string[] locations; // Array to hold multiple locations
        uint256 duration;
        address owner;
    }

    // Event to be emitted when a new tourist is created
    event TouristCreated(uint256 indexed touristId, address owner);

    // Mapping to store tourists by their ID
    mapping(uint256 => Tourist) public tourists;
    // Array to store all tourist IDs for easy retrieval
    uint256[] public touristIds;

    // Set the contract owner and initialize the first touristId
    constructor() {
        owner = msg.sender;
        nextTouristId = 1; // Start IDs from 1
    }

    // Modifier to restrict functions to only the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    // Function to create a new tourist record
    function createTourist(string memory _adhaarNo, string memory _bandId, string memory _groupId, string[] memory _locations, uint256 _duration) public onlyOwner returns (uint256) {
        uint256 newTouristId = nextTouristId;

        // Store the new tourist
        tourists[newTouristId] = Tourist(newTouristId, _adhaarNo, _bandId, _groupId, _locations, _duration, msg.sender);
        
        // Add the new ID to our array for easy retrieval
        touristIds.push(newTouristId);

        // Increment the counter for the next tourist
        nextTouristId++;

        // Emit an event with the new ID
        emit TouristCreated(newTouristId, msg.sender);

        // Return the new ID
        return newTouristId;
    }

    // Function to get a single tourist by their ID
    function getTourist(uint256 _touristId) public view returns (Tourist memory) {
        require(tourists[_touristId].owner != address(0), "Tourist does not exist");
        return tourists[_touristId];
    }

    // Function to get all tourists
    function getAllTourists() public view returns (Tourist[] memory) {
        Tourist[] memory allTourists = new Tourist[](touristIds.length);
        for (uint i = 0; i < touristIds.length; i++) {
            allTourists[i] = tourists[touristIds[i]];
        }
        return allTourists;
    }

    // Function to delete a tourist
    function deleteTourist(uint256 _touristId) public onlyOwner {
        require(tourists[_touristId].owner != address(0), "Tourist does not exist");
        
        // Remove from mapping
        delete tourists[_touristId];

        // Remove from the touristIds array
        for (uint i = 0; i < touristIds.length; i++) {
            if (touristIds[i] == _touristId) {
                // Replace the element to delete with the last element
                touristIds[i] = touristIds[touristIds.length - 1];
                // Remove the last element
                touristIds.pop();
                break;
            }
        }
    }
}
