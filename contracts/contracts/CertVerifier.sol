// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CertNFT.sol";

contract CertVerifier {

    error InvalidTokenId();
    error EmptyPurpose();

    struct VerificationRecord {
        address verifier;
        uint256 tokenId;
        bool isValid;
        uint256 verifiedAt;
        string purpose;
    }

    CertNFT public immutable certNFT;

    mapping(uint256 => VerificationRecord[]) private _verificationHistory;
    mapping(uint256 => uint256) private _verificationCount;

    uint256 public totalVerifications;

    event CredentialVerified(
        uint256 indexed tokenId,
        address indexed verifier,
        bool isValid,
        string purpose
    );

    constructor(address certNFTAddress) {
        certNFT = CertNFT(certNFTAddress);
    }

    function verify(uint256 tokenId, string calldata purpose) external returns (bool) {
        if (bytes(purpose).length == 0) revert EmptyPurpose();

        bool valid;
        try certNFT.isValid(tokenId) returns (bool result) {
            valid = result;
        } catch {
            valid = false;
        }

        VerificationRecord memory record = VerificationRecord({
            verifier: msg.sender,
            tokenId: tokenId,
            isValid: valid,
            verifiedAt: block.timestamp,
            purpose: purpose
        });

        _verificationHistory[tokenId].push(record);
        _verificationCount[tokenId]++;
        totalVerifications++;

        emit CredentialVerified(tokenId, msg.sender, valid, purpose);

        return valid;
    }

    function getVerificationCount(uint256 tokenId) external view returns (uint256) {
        return _verificationCount[tokenId];
    }

    function getVerificationHistory(uint256 tokenId) external view returns (VerificationRecord[] memory) {
        return _verificationHistory[tokenId];
    }

    function getCredentialWithStats(uint256 tokenId)
        external
        view
        returns (
            CertNFT.Credential memory credential,
            uint256 verificationCount,
            bool currentlyValid
        )
    {
        (
            uint256 id,
            address holder,
            string memory credentialType,
            string memory title,
            string memory issuerName,
            address issuerAddress,
            uint256 hoursCompleted,
            uint256 issuedAt,
            uint256 expiresAt,
            bool revoked,
            string memory metadataURI
        ) = certNFT.credentials(tokenId);

        credential = CertNFT.Credential({
            id: id,
            holder: holder,
            credentialType: credentialType,
            title: title,
            issuerName: issuerName,
            issuerAddress: issuerAddress,
            hoursCompleted: hoursCompleted,
            issuedAt: issuedAt,
            expiresAt: expiresAt,
            revoked: revoked,
            metadataURI: metadataURI
        });

        verificationCount = _verificationCount[tokenId];

        try certNFT.isValid(tokenId) returns (bool result) {
            currentlyValid = result;
        } catch {
            currentlyValid = false;
        }
    }
}
