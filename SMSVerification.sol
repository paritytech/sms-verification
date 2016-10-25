//! SMS verification contract
//! By Gav Wood & Jannis R, 2016.

contract Owned {
  modifier only_owner { if (msg.sender != owner) return; _; }

  event NewOwner(address indexed old, address indexed current);

  function setOwner(address _new) only_owner {
    owner = _new;
    NewOwner(owner, _new);
  }

  function drain() only_owner {
    if (!msg.sender.send(this.balance))
      throw;
  }

  address public owner = msg.sender;
}

contract ProofOfSMS is Owned {
  struct Entry {
    bool active;
    bytes32 numberHash;
  }

  modifier when_fee_paid { if (msg.value < fee) return; _; }

  event Verified(address indexed who);
  event Requested(bytes32 numberHash);
  event Challenged(bytes32 indexed numberHash, bytes32 tokenHash);

  function request(bytes32 _numberHash) when_fee_paid {
    Requested(_numberHash);
  }

  function challenge(bytes32 _numberHash, bytes32 _tokenHash) only_owner {
    challenges[_tokenHash] = _numberHash;
    reverse[_numberHash] = msg.sender;
    Challenged(_numberHash, _tokenHash);
  }

  function respond(uint32 _token) {
    var _tokenHash = sha3(_token);
    var _numberHash = challenges[_tokenHash];
    if (_numberHash == 0)
      return;
    delete challenges[_tokenHash];
    if (reverse[_numberHash] != 0)
      return; // prevent two challenges for one number
    entries[msg.sender] = Entry(true, _numberHash);
    Verified(msg.sender);
  }

  function verified(address _who) constant returns (bool) {
    return entries[_who].active;
  }

  function setFee(uint _new) only_owner {
    fee = _new;
  }

  mapping (address => Entry) entries;
  mapping (bytes32 => address) reverse;
  mapping (bytes32 => bytes32) challenges;

  uint fee = 12 finney;
}
