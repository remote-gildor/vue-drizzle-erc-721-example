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

  describe("Shape transactions - successful", () => {

    it("adds a new shape type", async () => {
      const lengthBefore = await instance.getShapeTypesArrayLength();
      assert.equal(BN(lengthBefore), 3);

      await instance.addNewShapeType(
        web3.utils.asciiToHex("cube"),
        web3.utils.asciiToHex("CBE"),
        ether(0.666)
      );

      const lengthAfter = await instance.getShapeTypesArrayLength();
      assert.equal(BN(lengthAfter), 4);

      const newShape = await instance.getShapeTypeByIndex(3);
      assert.equal(web3.utils.hexToUtf8(newShape[1]), "cube"); // check if shape name correct
    });

    xit("deactivates a shape type", async () => {
    });

    xit("reactivates an existing deactivated shape type", async () => {
    });

    it("mints a circle token with mintByShapeTypeId", async () => {
      const tokenTypeId = 1; // circle

      // user's balance before the tx
      let balanceBefore = await instance.balanceOf(accounts[0]);
      assert.equal(BN(balanceBefore), 0);

      // check token supply before the minting
      const tokenTypeBefore = await instance.getShapeTypeByIndex(tokenTypeId-1);
      assert.equal(tokenTypeBefore[3], 0); // assert the circle supply is 0

      // mint
      const result = await instance.mintByShapeTypeId(
        tokenTypeId, 
        web3.utils.hexToBytes("0x0000000000000000000000000000000000000000"), {
          from: accounts[0],
          gas: 3000000,
          value: ether(0.5)
        }
      );
      
      // gas used: 204656 (for 100 GWei gas price, this means 0.0204656 ETH spent)
      // console.log("Gas used (mintByShapeTypeId) 1: " + result.receipt.gasUsed);

      // user's balance after the tx
      let balanceAfter = await instance.balanceOf(accounts[0]);
      assert.equal(BN(balanceAfter), 1);

      // check token supply after the minting
      const tokenTypeAfter = await instance.getShapeTypeByIndex(tokenTypeId-1);
      assert.equal(tokenTypeAfter[3], 1); // assert the circle supply is 1

    });

    it("mints another circle token with mintByShapeTypeId", async () => {
      const tokenTypeId = 1; // circle

      // user's balance before the tx
      let balanceBefore = await instance.balanceOf(accounts[0]);
      assert.equal(BN(balanceBefore), 1);

      // check token supply before the minting
      const tokenTypeBefore = await instance.getShapeTypeByIndex(tokenTypeId-1);
      assert.equal(tokenTypeBefore[3], 1); // assert the circle supply is 1

      // mint/buy
      const result = await instance.mintByShapeTypeId(
        tokenTypeId, 
        web3.utils.hexToBytes("0x0000000000000000000000000000000000000000"), {
          from: accounts[0],
          gas: 3000000,
          value: ether(0.5)
        }
      );
      
      // gas used: 203979
      // console.log("Gas used (mintByShapeTypeId) 2: " + result.receipt.gasUsed);

      // user's balance after the tx
      let balanceAfter = await instance.balanceOf(accounts[0]);
      assert.equal(BN(balanceAfter), 2);

      // check token supply after the minting
      const tokenTypeAfter = await instance.getShapeTypeByIndex(tokenTypeId-1);
      assert.equal(tokenTypeAfter[3], 2); // assert the circle supply is 2

    });

    it("mints a square token with mintBySymbol", async () => {
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
      // console.log("Gas used (mintByTokenSymbol) 1: " + result.receipt.gasUsed);

      // user's balance after the tx
      let balanceAfter = await instance.balanceOf(accounts[0]);
      assert.equal(BN(balanceAfter), 3);

      // check token supply after the minting
      const tokenTypeAfter = await instance.getShapeTypeByIndex(tokenTypeId-1);
      assert.equal(tokenTypeAfter[3], 1); // assert the square supply is 1

    });

    it("burns a circle token with burnByTokenId()", async () => {
      const tokenTypeId = 1; // circle token ID
      const tokenId = 2; // the second shape token minted (of the circle kind)

      // user's ETH balance before the tx
      const ethBalanceBefore = await web3.eth.getBalance(accounts[0]);

      // user's token balance before the tx
      let balanceBefore = await instance.balanceOf(accounts[0]);
      assert.equal(BN(balanceBefore), 3); // three shape tokens minted before

      // check token supply before burning
      const tokenTypeBefore = await instance.getShapeTypeByIndex(tokenTypeId-1);
      assert.equal(tokenTypeBefore[3], 2); // assert the circle supply is 2

      // burn by token ID
      const result = await instance.burnByTokenId(tokenId);

      // gas used: 57076
      // console.log("Gas used (burnByTokenId): " + result.receipt.gasUsed);
      
      // get gas price
      const txData = await web3.eth.getTransaction(result.tx);
      const gasPrice = txData.gasPrice;

      // calculate if user's ETH balance correct
      const ethBalanceAfter = await web3.eth.getBalance(accounts[0]);

      let ethBefore = web3.utils.fromWei(ethBalanceBefore.toString(), "ether");
      let ethAfter = web3.utils.fromWei(ethBalanceAfter.toString(), "ether");

      let diffEth = ether(0.5)-(result.receipt.gasUsed*gasPrice); // ETH returned minus gas fee

      assert.approximately(Number(ethAfter-ethBefore), 
                           Number(web3.utils.fromWei(diffEth.toString(), "ether")), 
                           0.000001);

      // user's token balance after the tx
      let balanceAfter = await instance.balanceOf(accounts[0]);
      assert.equal(BN(balanceAfter), 2); // two shape tokens remaining after the burn

      // check token supply after the burning
      const tokenTypeAfter = await instance.getShapeTypeByIndex(tokenTypeId-1);
      assert.equal(tokenTypeAfter[3], 1); // assert the circle supply is 1
    });

    it("allows owner to collect ETH", async () => {
      const addressBalanceBefore = await web3.eth.getBalance(instance.address);
      assert.isTrue(addressBalanceBefore > 0);

      const ethBalanceBefore = await web3.eth.getBalance(accounts[0]);
      //console.log(web3.utils.fromWei(ethBalanceBefore.toString(), "ether"));

      await instance.ownerCollectEther();
      
      const ethBalanceAfter = await web3.eth.getBalance(accounts[0]);
      assert.isTrue(ethBalanceAfter > ethBalanceBefore);

      const addressBalanceAfter = await web3.eth.getBalance(instance.address);
      assert.equal(addressBalanceAfter, 0);
    });

  });

  describe("Shapes transactions - failed", () => {

    it("fails at minting if value paid is incorrect", async () => {
      const tokenTypeId = 1; // circle

      // user's balance before the tx
      let balanceBefore = await instance.balanceOf(accounts[0]);
      assert.equal(BN(balanceBefore), 2);

      // check token supply before the minting
      const tokenTypeBefore = await instance.getShapeTypeByIndex(tokenTypeId-1);
      assert.equal(tokenTypeBefore[3], 1); // assert the circle supply is 1 (one token was burned before)

      // mint (should FAIL)
      await expectRevert(
        instance.mintByShapeTypeId(
          tokenTypeId, 
          web3.utils.hexToBytes("0x0000000000000000000000000000000000000000"), {
            from: accounts[0],
            gas: 3000000,
            value: ether(0.1) // too low ETH value
          }
        ),
        "Wrong amount of ETH sent."
      );
      
      // user's balance after the tx (should stay the same)
      let balanceAfter = await instance.balanceOf(accounts[0]);
      assert.equal(BN(balanceAfter), 2);

      // check token supply after the minting (should stay the same)
      const tokenTypeAfter = await instance.getShapeTypeByIndex(tokenTypeId-1);
      assert.equal(tokenTypeAfter[3], 1); // assert the circle supply is still 1

    });

    it("fails to burn a non-existing token (wrong ID)", async () => {
      const tokenTypeId = 1; // circle token ID
      const tokenId = 32; // this token ID does not exist

      // user's token balance before the tx
      let balanceBefore = await instance.balanceOf(accounts[0]);
      assert.equal(BN(balanceBefore), 2); // two shape tokens minted before

      // check token supply before burning
      const tokenTypeBefore = await instance.getShapeTypeByIndex(tokenTypeId-1);
      assert.equal(tokenTypeBefore[3], 1); // assert the circle supply is 1 (one token was burned before)

      // burn by token ID (should FAIL)
      await expectRevert(
        instance.burnByTokenId(tokenId),
        "ERC721: operator query for nonexistent token"
      )

      // user's token balance after the tx
      let balanceAfter = await instance.balanceOf(accounts[0]);
      assert.equal(BN(balanceAfter), 2); // two shape tokens remaining after the failed burn

      // check token supply after the burning
      const tokenTypeAfter = await instance.getShapeTypeByIndex(tokenTypeId-1);
      assert.equal(tokenTypeAfter[3], 1); // assert the circle supply is still 1
    });

    xit("fails at trying to create an existing active shape", async () => {
    });
  
    xit("fails at deactivating a non-existing shape", async () => {
    });

  });

});
