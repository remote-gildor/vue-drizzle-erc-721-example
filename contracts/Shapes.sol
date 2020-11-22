// SPDX-License-Identifier: MIT
pragma solidity ^0.6.8;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721Burnable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract Shapes is ERC721, ERC721Burnable, Ownable {

  // structs
  struct ShapeType {
    uint id;
    bytes32 name;
    bytes32 symbol;
    uint supply;
    uint priceWei;
    bool active;
  }

  struct ShapeToken {
    uint id;
    uint shapeTypeId;
  }

  // arrays
  ShapeType[] public shapeTypes;
  ShapeToken[] public shapeTokens;

  // events
  event TokenMinted(address indexed _from, bytes32 indexed _symbol);
  event TokenBurned(address indexed _from, bytes32 indexed _symbol);
  event ShapeTypeAdded(address indexed _from, bytes32 indexed _symbol);
  event ShapeTypeDeactivated(address indexed _from, bytes32 indexed _symbol);
  event EtherCollected(address indexed _from, uint indexed _balance);

  constructor() ERC721("Shape", "SHAPE") public {
    ShapeType memory circle = ShapeType({
      id: 1,
      name: "circle",
      symbol: "CRC",
      supply: 0,
      priceWei: 500000000000000000, // 0.5 ETH
      active: true
    });

    shapeTypes.push(circle);

    ShapeType memory square = ShapeType({
      id: 2,
      name: "square",
      symbol: "SQR",
      supply: 0,
      priceWei: 1200000000000000000, // 1.2 ETH
      active: true
    });

    shapeTypes.push(square);

    ShapeType memory triangle = ShapeType({
      id: 3,
      name: "triangle",
      symbol: "TRG",
      supply: 0,
      priceWei: 330000000000000000, // 0.33 ETH
      active: true
    });

    shapeTypes.push(triangle);
  }

  // methods

  function burnByTokenId(uint256 _tokenId) public {
    super.burn(_tokenId); // burn the token that belongs to the msg.sender

    shapeTypes[shapeTokens[_tokenId-1].shapeTypeId-1].supply -= 1; // decrease supply in shape type

    ShapeType memory thisShapeType = shapeTypes[shapeTokens[_tokenId-1].shapeTypeId-1];

    // return the ETH (if possible)
    if (address(this).balance >= thisShapeType.priceWei) {
      (bool sent, bytes memory data) = msg.sender.call{value: thisShapeType.priceWei}("");
    }

    emit TokenBurned(msg.sender, thisShapeType.symbol);
  } 

  function getShapeTypeByIndex(uint _index) public view returns (uint, bytes32, bytes32, uint, uint, bool) {
    return (shapeTypes[_index].id, shapeTypes[_index].name, shapeTypes[_index].symbol, 
            shapeTypes[_index].supply, shapeTypes[_index].priceWei, shapeTypes[_index].active);
  }

  function getShapeTypeBySymbol(bytes32 _symbol) internal view returns (ShapeType memory) {
    for (uint i = 0; i < shapeTypes.length; i++) {
      if (shapeTypes[i].symbol == _symbol) {
        return shapeTypes[i];
      }
    }
  }

  function getShapeTypesArrayLength() public view returns (uint256) {
    return shapeTypes.length;
  }

  function mintByShapeTypeId(uint256 _id, bytes memory _data) public payable returns (bool) {
    // check if the token price is correct
    require(msg.value == shapeTypes[_id-1].priceWei, "Wrong amount of ETH sent.");

    // check if the shape type is active
    require(shapeTypes[_id-1].active == true, "The selected shape type is deactivated.");

    // set a new token id
    uint tokenId = 0;
    if (shapeTokens.length > 0) {
      tokenId = shapeTokens[shapeTokens.length-1].id + 1;
    }

    // create a shape token and store it in the tokens array
    shapeTokens.push(ShapeToken({
      id: tokenId, // get the ID of the last token and add 1
      shapeTypeId: _id
    }));

    // mint the ERC-721 token
    super._safeMint(msg.sender, tokenId, _data); // mint a token and assign it to msg.sender

    shapeTypes[_id-1].supply += 1;

    emit TokenMinted(msg.sender, shapeTypes[_id-1].symbol);

    return true;
  }

  function mintBySymbol(bytes32 _symbol, bytes memory _data) public payable returns (bool) {
    // Use this function, if you don't want people to confuse array index and token ID
    // Delete mintByTokenTypeId (or ignore it on front-end) and let them use mintBySymbol only
    // Note: this function is a bit more expensive in terms of gas, but safer to avoid errors
    
    ShapeType memory someShapeType = getShapeTypeBySymbol(_symbol);

    // user can buy only one Shape token at a time
    require(msg.value == someShapeType.priceWei, "Wrong amount of ETH sent.");

    // check if the shape is active
    require(someShapeType.active == true, "The selected shape is deactivated.");

    // set a new token id
    uint tokenId = 0;
    if (shapeTokens.length > 0) {
      tokenId = shapeTokens[shapeTokens.length-1].id + 1;
    }

    // create a shape token and store it in the tokens array
    shapeTokens.push(ShapeToken({
      id: tokenId, // get the ID of the last token and add 1
      shapeTypeId: someShapeType.id
    }));

    super._safeMint(msg.sender, tokenId, _data); // mint 1 token and assign it to msg.sender

    shapeTypes[someShapeType.id-1].supply += 1;

    emit TokenMinted(msg.sender, someShapeType.symbol);

    return true;
  }

  function ownerCollectEther() public onlyOwner {
    uint balance = address(this).balance;

    (bool sent, bytes memory data) = owner().call{value: balance}("");

    emit EtherCollected(msg.sender, balance);
  }
}
