// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PeerEndorse {

    error CannotEndorseSelf();
    error NoteExceedsMaxLength();
    error EmptySkillTag();
    error ZeroAddressRecipient();

    struct Endorsement {
        address endorser;
        address recipient;
        uint256 credentialTokenId;
        string skillTag;
        string note;
        uint256 timestamp;
    }

    mapping(address => Endorsement[]) private _endorsements;
    mapping(address => uint256) private _endorsementCount;

    uint256 public totalEndorsements;

    event EndorsementCreated(
        address indexed endorser,
        address indexed recipient,
        uint256 indexed credentialTokenId,
        string skillTag
    );

    function endorse(
        address recipient,
        uint256 credentialTokenId,
        string calldata skillTag,
        string calldata note
    ) external {
        if (recipient == address(0)) revert ZeroAddressRecipient();
        if (msg.sender == recipient) revert CannotEndorseSelf();
        if (bytes(skillTag).length == 0) revert EmptySkillTag();
        if (bytes(note).length > 280) revert NoteExceedsMaxLength();

        Endorsement memory newEndorsement = Endorsement({
            endorser: msg.sender,
            recipient: recipient,
            credentialTokenId: credentialTokenId,
            skillTag: skillTag,
            note: note,
            timestamp: block.timestamp
        });

        _endorsements[recipient].push(newEndorsement);
        _endorsementCount[recipient]++;
        totalEndorsements++;

        emit EndorsementCreated(msg.sender, recipient, credentialTokenId, skillTag);
    }

    function getEndorsementsForAddress(address recipient) external view returns (Endorsement[] memory) {
        return _endorsements[recipient];
    }

    function getEndorsementCount(address recipient) external view returns (uint256) {
        return _endorsementCount[recipient];
    }
}
