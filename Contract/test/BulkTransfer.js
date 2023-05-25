const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require('hardhat');
const SOME_TOKEN = "0xb8e3bB633F7276cc17735D86154E0ad5ec9928C0"
const SOME_TOKEN_HOLDER = "0xfA8187FbbbD4D9e626f75C4Bb59AD326Cc4970b4"

describe("BulkTransfer", function () {
  async function deployBulkTransferFixture() {
    const [owner, acc1, acc2, acc3, acc4] = await ethers.getSigners();
    const someTokenHolder = await ethers.getImpersonatedSigner(SOME_TOKEN_HOLDER);

    const BulkTransfer = await ethers.getContractFactory("BulkTransfer");
    const bulkTransfer = await BulkTransfer.deploy();
    return { bulkTransfer, owner, someTokenHolder, acc1, acc2, acc3, acc4 };
  }

  describe("Deployment", function () {
    it("One send case", async function () {
      const { bulkTransfer, owner, someTokenHolder, acc1, acc2, acc3, acc4 } = await loadFixture(deployBulkTransferFixture);
      const someToken = await ethers.getContractAt("IERC20", SOME_TOKEN)
      await someToken.connect(someTokenHolder).approve(bulkTransfer.address, ethers.constants.MaxUint256)
      expect(await someToken.allowance(someTokenHolder.address, bulkTransfer.address)).to.equal(ethers.constants.MaxUint256);


      await bulkTransfer.connect(someTokenHolder).execute(
        SOME_TOKEN,
        ethers.utils.parseEther('10000'),
        [
          [
            acc1.address,
            ethers.utils.parseEther('1000')
          ],
        ]
      )
      expect(await someToken.balanceOf(acc1.address)).to.equal(ethers.utils.parseEther('1000'));
    });

    it("Multiple send case", async function () {
      const { bulkTransfer, owner, someTokenHolder, acc1, acc2, acc3, acc4 } = await loadFixture(deployBulkTransferFixture);
      const someToken = await ethers.getContractAt("IERC20", SOME_TOKEN)
      await someToken.connect(someTokenHolder).approve(bulkTransfer.address, ethers.constants.MaxUint256)
      expect(await someToken.allowance(someTokenHolder.address, bulkTransfer.address)).to.equal(ethers.constants.MaxUint256);


      await bulkTransfer.connect(someTokenHolder).execute(
        SOME_TOKEN,
        ethers.utils.parseEther('10000'),
        [
          [
            acc1.address,
            ethers.utils.parseEther('1000')
          ],
          [
            acc2.address,
            ethers.utils.parseEther('2000')
          ],
          [
            acc3.address,
            ethers.utils.parseEther('3000')
          ],
          [
            acc4.address,
            ethers.utils.parseEther('4000')
          ]
        ]
      )
      expect(await someToken.balanceOf(acc1.address)).to.equal(ethers.utils.parseEther('1000'));
      expect(await someToken.balanceOf(acc2.address)).to.equal(ethers.utils.parseEther('2000'));
      expect(await someToken.balanceOf(acc3.address)).to.equal(ethers.utils.parseEther('3000'));
      expect(await someToken.balanceOf(acc4.address)).to.equal(ethers.utils.parseEther('4000'));
    });
  });

});
