"use strict";

var NebDns = function (text) {
    if (text) {
        var parse = JSON.parse(text);
        this.address = parse.address;
        this.owner = parse.owner;
        this.alias = parse.alias;
    } else {
        // this.address = "";
        // this.owner = "";
        // this.alias = "";
    }
};

NebDns.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var NebDnsContract = function () {
    LocalContractStorage.defineMapProperty(this, "dnsAdmin", {
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return new NebDns(str);
        }
    });
    LocalContractStorage.defineMapProperty(this, "aliasMap", {
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return new NebDns(str);
        }
    });

    LocalContractStorage.defineMapProperty(this, "indexMap", {
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return new NebDns(str);
        }
    });

    LocalContractStorage.defineProperty(this, "size")
};

NebDnsContract.prototype = {
    init: function () {
        this._put("n1HwYPGLxNZJju8bVBm4tgXT2DZcYyLSZHo", "baidu", "baidu.com");
        this._put("n1HwYPGLxNZJju8bVBm4tgXT2DZcYyLSZHo", "nebulas", "nebulas.com");
        this._put("n1HwYPGLxNZJju8bVBm4tgXT2DZcYyLSZHo", "nebulas", "nebulas.io");
        this._put("n1XfzzhxB52wqRN9DqEeBAicwei8gZ56BZN", "act262", "act262.io");
    },

    _verifyAddress: function (address) {
        return Blockchain.verifyAddress(address) === 1;
    },

    _put: function (address, owner, alias) {
        var dns = this.aliasMap.get(alias);
        if (dns != null) {
            throw new Error(alias + "已被注册");
        }

        dns = new NebDns();
        dns.owner = owner;
        dns.address = address;
        dns.alias = alias;

        var index = this.size;
        this.dnsAdmin.put(address, dns);
        this.aliasMap.put(alias, dns);
        this.indexMap.set(index, dns);

        this.size += 1;
    },

    _getByAddr: function (address) {
        return new NebDns(this.dnsAdmin.get(address));
    },

    _getByAlias: function (alias) {
        var text = this.aliasMap.get(alias);
        return new NebDns(text);
    },

    _getByIndex: function (index) {
        return new NebDns(this.indexMap.get(index));
    },

    _transfer: function (address, value) {
        Blockchain.transfer(address, value);
        Event.Trigger("transfer", {
            from: Blockchain.transaction.to,
            to: address,
            value: value
        })
    },

    _len: function () {
        return this.size;
    },

    /**
     * register your alias
     * @param owner owner info
     * @param alias your like alias
     */
    register: function (owner, alias) {
        owner = owner.trim();
        alias = alias.trim();

        if (owner === "") {
            throw new Error("empty owner");
        }
        if (alias === "") {
            throw new Error("empty alias");
        }

        var from = Blockchain.transaction.from;

        if (this._verifyAddress(from)) {
            throw new Error("invalid address");
        }

        this._put(from, owner, alias);
    },

    querySelf: function () {
        var from = Blockchain.transaction.from;
        return this._getByAddr(from);
    },

    queryByAddress: function (address) {
        if (this._verifyAddress(address)) {
            throw new Error("Address invalid");
        }

        return this._getByAddr(address);
    },
    queryAlias: function (alias) {
        alias = alias.trim();
        if (alias === "") {
            throw new Error("empty alias")
        }

        return this._getByAlias(alias);
    },

    /**
     * query all data
     */
    queryAll: function () {
        var size = this._len();
        var list = [];
        for (var i = 0; i < size; i++) {
            var item = this._getByIndex(i);
            list.push(item);
        }
        return list;
    }

};
module.exports = NebDnsContract;