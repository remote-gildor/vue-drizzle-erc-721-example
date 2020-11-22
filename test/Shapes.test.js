const {
  BN,           // Big Number support 
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

const { assert } = require("chai");

// helper
const ether = (n) => web3.utils.toWei(n.toString(), 'ether');

// artifacts
const Shapes = artifacts.require("Shapes");

contract("Shapes", accounts => {
  let instance;

  beforeEach(async () => {
    instance = await Shapes.deployed();
  });

  describe("Shape types array", () => {

    it("has 3 ShapeType items in the array", async () => {
      const length = await instance.getShapeTypesArrayLength();
      assert.equal(BN(length), 3);
    });

    it("fetches the 2nd shape type from the array (square)", async () => {
      const square = await instance.getShapeTypeByIndex(1);
      assert.equal(web3.utils.hexToUtf8(square[1]), "square"); // get shape name
      assert.equal(square[4], ether(1.2)); // get shape price
    });

  });

  describe("Shapes transactions - successful", () => {

    xit("allows adding a new shape", async () => {
    });

    xit("deactivates a shape", async () => {
    });

    xit("reactivates an existing deactivated shape", async () => {
    });

    it("mints a circle token with mintByTokenTypeId", async () => {
      const tokenTypeId = 1; // circle

      // user's balance before the tx
      let balanceBefore = await instance.balanceOf(accounts[0]);
      assert.equal(BN(balanceBefore), 0);

      // check token supply before the minting
      const tokenTypeBefore = await instance.getShapeTypeByIndex(tokenTypeId-1);
      assert.equal(tokenTypeBefore[3], 0); // assert the circle supply is 0

      // mint/buy
      const result = await instance.mintByTokenTypeId(
        tokenTypeId, 
        web3.utils.hexToBytes("0x0000000000000000000000000000000000000000"), {
          from: accounts[0],
          gas: 3000000,
          value: ether(0.5)
        }
      );
      
      // gas used: 204656
      // console.log("Gas used (mintByTokenTypeId) 1: " + result.receipt.gasUsed);

      // user's balance after the tx
      let balanceAfter = await instance.balanceOf(accounts[0]);
      assert.equal(BN(balanceAfter), 1);

      // check token supply before the minting
      const tokenTypeAfter = await instance.getShapeTypeByIndex(tokenTypeId-1);
      assert.equal(tokenTypeAfter[3], 1); // assert the circle supply is 1

    });

    it("mints another circle token with mintByTokenTypeId", async () => {
      const tokenTypeId = 1; // circle

      // user's balance before the tx
      let balanceBefore = await instance.balanceOf(accounts[0]);
      assert.equal(BN(balanceBefore), 1);

      // check token supply before the minting
      const tokenTypeBefore = await instance.getShapeTypeByIndex(tokenTypeId-1);
      assert.equal(tokenTypeBefore[3], 1); // assert the circle supply is 1

      // mint/buy
      const result = await instance.mintByTokenTypeId(
        tokenTypeId, 
        web3.utils.hexToBytes("0x0000000000000000000000000000000000000000"), {
          from: accounts[0],
          gas: 3000000,
          value: ether(0.5)
        }
      );
      
      // gas used: 203979
      // console.log("Gas used (mintByTokenTypeId) 2: " + result.receipt.gasUsed);

      // user's balance after the tx
      let balanceAfter = await instance.balanceOf(accounts[0]);
      assert.equal(BN(balanceAfter), 2);

      // check token supply before the minting
      const tokenTypeAfter = await instance.getShapeTypeByIndex(tokenTypeId-1);
      assert.equal(tokenTypeAfter[3], 2); // assert the circle supply is 2

    });

    it("it mints a square with mintBySymbol", async () => {
      const tokenTypeId = 2; // square

      // user's balance before the tx
      let balanceBefore = await instance.balanceOf(accounts[0]);
      assert.equal(BN(balanceBefore), 2); // user has two shapes (circles) before

      // check token supply before the minting
      const tokenTypeBefore = await instance.getShapeTypeByIndex(tokenTypeId-1);
      assert.equal(tokenTypeBefore[3], 0); // assert the square supply is 0

      // mint
      const result = await instance.mintBySymbol(
        web3.utils.asciiToHex("SQR"), 
        web3.utils.hexToBytes("0x0000000000000000000000000000000000000000"), {
          from: accounts[0],
          gas: 3000000,
          value: ether(1.2)
        }
      );
      
      // gas used: 225312
      console.log("Gas used (mintByTokenSymbol) 1: " + result.receipt.gasUsed);

      // user's balance after the tx
      let balanceAfter = await instance.balanceOf(accounts[0]);
      assert.equal(BN(balanceAfter), 3);

      // check token supply before the minting
      const tokenTypeAfter = await instance.getShapeTypeByIndex(tokenTypeId-1);
      assert.equal(tokenTypeAfter[3], 1); // assert the square supply is 1

    });

    xit("allows token burn with burnByTokenId()", async () => {
    });

    xit("allows token burn with burnBySymbol()", async () => {
    });

    xit("allows owner to collect ETH", async () => {
    });

  });

  describe("Shapes transactions - failed", () => {

    xit("fails at minting if value paid is incorrect", async () => {
    });

    xit("fails to burn token with balance/supply 0", async () => {
    });

    xit("fails at trying to create an existing active shape", async () => {
    });
  
    xit("fails at deactivating a non-existing shape", async () => {
    });

  });

});
