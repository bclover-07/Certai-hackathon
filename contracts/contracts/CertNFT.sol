// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC5192 {
    event Locked(uint256 tokenId);
    event Unlocked(uint256 tokenId);

    function locked(uint256 tokenId) external view returns (bool);
}

contract CertNFT is ERC721, Ownable, IERC5192 {

    error TransferBlocked();
    error NotIssuer();
    error AlreadyRevoked();
    error NoteExceedsMaxLength();
    error ZeroAddressHolder();
    error EmptyTitle();

    struct Credential {
        uint256 id;
        address holder;
        string credentialType;
        string title;
        string issuerName;
        address issuerAddress;
        uint256 hoursCompleted;
        uint256 issuedAt;
        uint256 expiresAt;
        bool revoked;
        string metadataURI;
    }

    uint256 private _nextTokenId;
    uint256 private _totalSupply;

    mapping(uint256 => Credential) public credentials;
    mapping(address => uint256[]) private _holderCredentials;

    event CredentialMinted(
        uint256 indexed tokenId,
        address indexed holder,
        address indexed issuer,
        string title
    );

    event CredentialRevoked(uint256 indexed tokenId, address indexed issuer);

    constructor(address initialOwner)
        ERC721("CertAI Credential", "CERTAI")
        Ownable(initialOwner)
    {}

    function mintCredential(
        address holder,
        string calldata credentialType,
        string calldata title,
        string calldata issuerName,
        uint256 hoursCompleted,
        uint256 expiresAt,
        string calldata metadataURI
    ) external returns (uint256) {
        if (holder == address(0)) revert ZeroAddressHolder();
        if (bytes(title).length == 0) revert EmptyTitle();

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        _safeMint(holder, tokenId);

        credentials[tokenId] = Credential({
            id: tokenId,
            holder: holder,
            credentialType: credentialType,
            title: title,
            issuerName: issuerName,
            issuerAddress: msg.sender,
            hoursCompleted: hoursCompleted,
            issuedAt: block.timestamp,
            expiresAt: expiresAt,
            revoked: false,
            metadataURI: metadataURI
        });

        _holderCredentials[holder].push(tokenId);
        _totalSupply++;

        emit CredentialMinted(tokenId, holder, msg.sender, title);
        emit Locked(tokenId);

        return tokenId;
    }

    function revokeCredential(uint256 tokenId) external {
        _requireOwned(tokenId);

        Credential storage cred = credentials[tokenId];
        if (cred.issuerAddress != msg.sender) revert NotIssuer();
        if (cred.revoked) revert AlreadyRevoked();

        cred.revoked = true;

        emit CredentialRevoked(tokenId, msg.sender);
    }

    function getHolderCredentials(address holder) external view returns (Credential[] memory) {
        uint256[] storage tokenIds = _holderCredentials[holder];
        uint256 length = tokenIds.length;
        Credential[] memory result = new Credential[](length);

        for (uint256 i = 0; i < length; i++) {
            result[i] = credentials[tokenIds[i]];
        }

        return result;
    }

    function getHolderTokenIds(address holder) external view returns (uint256[] memory) {
        return _holderCredentials[holder];
    }

    function isValid(uint256 tokenId) external view returns (bool) {
        _requireOwned(tokenId);

        Credential storage cred = credentials[tokenId];

        if (cred.revoked) return false;
        if (cred.expiresAt != 0 && block.timestamp > cred.expiresAt) return false;

        return true;
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function locked(uint256 tokenId) external view override returns (bool) {
        _requireOwned(tokenId);
        return true;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return credentials[tokenId].metadataURI;
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);

        if (from != address(0) && to != address(0)) {
            revert TransferBlocked();
        }

        return super._update(to, tokenId, auth);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721)
        returns (bool)
    {
        return
            interfaceId == 0xb45a3c0e ||
            super.supportsInterface(interfaceId);
    }
}
