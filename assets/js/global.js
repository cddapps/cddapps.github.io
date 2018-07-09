'use strict';
var Neb = require("nebulas").Neb;
var HttpRequest = require("nebulas").HttpRequest
var NebPay = require("nebpay");
var nebPay = new NebPay(); 
var Account = require("nebulas").Account;

var neb = new Neb();
var chainId = 1;
var netWork = "https://mainnet.nebulas.io"
//var chainId = 1001;
//var netWork = "https://testnet.nebulas.io"
neb.setRequest(new HttpRequest(netWork));
var contractAddress = "n1uTqUTv1nb78trkdCmRve4EeG5RFuDZags";
var dropAddress = 'n1tPbTQBMjvo59RWghDxqQERtLfLSYrefrE';

var intervalQuery;
var serialNumber;
var mQuery;
var intervalQuery;
var accountQuery;
var priceQuery;
var awardPool = 40;
var checkTime = 10;
var loginTime = 5;

var userAddress = "";
var userLoaded = 0;
var userBalance = "";
var userCurrentCount="";
var userWallet="";
var userCoinList = new Array();
var register = 0;
var currentPrice;
var currentCoin;
var onTrade=0;
var matchRound=0;
var lastRound=0;
var firstLoad=0;

var btcValue=0;
var ethValue=0;
var xrpValue=0;
var bchValue=0;
var eosValue=0;
var ltcValue=0;
var xlmValue=0;
var adaValue=0;
var iotValue=0;
var trxValue=0;

/******************* 语言 **********************/

var en = {
    joinAlert: 'Please click "Join" to take part in contest.',
    alreadJoined: 'Already Joined',
    balance: 'Balance:$ ',
    coin: 'Coin: ',
    change: '24H Change:',
    trade: 'Trade',
    roundAlert: 'There is no one in this round！',
    check: 'Checking the result on blockchain, please wait...',
    success: 'Success!',
    fail: 'Fail!',
    showHash: 'Using following TxHash to recheck your order status:',
    ok: 'OK',
    joined: 'You have already joined！',
    wallet: 'Please complete the trade in Nebulas Wallet.',
    cancell: 'Orders Cancelled successfully！',
    fillIn: 'Please fill in an amount!',
    insufficientBalance: 'Your balance is not enough',
    insufficientCoin: 'Your Coin is not enough',
    days: 'D',
    hours: 'H',
    minutes: 'M',
    seconds: 'S'
}

var cn = {
    joinAlert: '请先点击"我要报名"，参加本轮比赛',
    alreadJoined: '已经报名',
    balance: '余额：$ ',
    coin: '币数: ',
    change: '24小时涨跌幅：',
    trade: '交易',
    roundAlert: '本轮比赛还没有人报名，快来成为第一个吧！',
    check: '正在查询报名结果，请稍等... ',
    success: '交易成功!',
    fail: '交易失败!',
    showHash: '您可以根据以下哈希，再次确认您的交易状态:',
    ok: '知道了',
    joined: '本轮比赛您已经报过名了，请不要重复报名！',
    wallet: '请到星云钱包中完成操作！',
    cancell: '您已取消交易！',
    fillIn: '请填写正确内容',
    insufficientBalance: '您的余额不足！',
    insufficientCoin: '您的币数不足',
    days: '天',
    hours: '小时',
    minutes: '分钟',
    seconds: '秒'
}
var lan;

var lanValue = document.getElementById("lan").value
if(lanValue == 1){
    lan = en;
} else if(lanValue == 2) {
    lan = cn
}

/******************* 语言 **********************/
            
function mobileTradeQuery() {
    if(IsPC()){
        return
    }
    nebPay.queryPayInfo(serialNumber).then(function (resp) {
        resp = JSON.parse(resp)
        if(resp instanceof Object){
            if(resp.code === 0){  
                var data = resp.data;
                if (data instanceof Object){
                    clearInterval(mQuery)
                    userAddress = data.from;
                    localStorage.setItem('userAddress', userAddress);
                    var txhash = data.hash
                    intervalQuery = setInterval(function() {
                        tradeQuery(txhash);
                    }, 3000);
                }
            }
        }
    }).catch(function (err) {
        alert("error:" + err)
        console.log(err);
    })
}

function mobileLoginQuery() {
    if(IsPC()){
        return
    }
    nebPay.queryPayInfo(serialNumber).then(function (resp) {
        resp = JSON.parse(resp)
        if(resp instanceof Object){
            if(resp.code === 0){  
                var data = resp.data;
                if (data instanceof Object){
                    clearInterval(mQuery)
                    userAddress = data.from;
                    localStorage.setItem('userAddress', userAddress);
                    var txhash = data.hash
                    intervalQuery = setInterval(function() {
                        loginQuery(txhash);
                    }, 3000);
                }
            }
        }
    }).catch(function (err) {
        alert("error:" + err)
        console.log(err);
    })
}

function login() {
    document.getElementById('matchRule').style.display = 'none'
    document.getElementById('homeText').style.display = ''
    document.getElementById("tradeAlert").innerHTML = `
    <h3 class="m-b-20 text-center">Please complete the trade in Nebulas Wallet.</h4>
    <p></p>`
    var to = contractAddress;
    var value = 0;
    var callFunction = "register";
    var callArgs =  JSON.stringify([]);
    var options = {
        qrcode: {
            showQRCode: false,      //是否显示二维码信息
            container: undefined,    //指定显示二维码的canvas容器，不指定则生成一个默认canvas
            completeTip: undefined, // 完成支付提示
            cancelTip: undefined // 取消支付提示
        },
        extension: {
            openExtension: true //是否支持插件调用
        },
        mobile: {
            showInstallTip: false, //是否支持手机钱包安装提示
            installTip: undefined // 手机钱包安装提示
        },
        listener: function (serialNumber,result) {
            console.log(result)
            if(result == "Error: Transaction rejected by user"){
                alert("Orders Cancelled successfully！")
            } else {
                var txhash = result.txhash;
                console.log(txhash)
                intervalQuery = setInterval(function() {
                    loginQuery(txhash);
                }, 3000);
            }
        }
    }
    //发送交易(发起智能合约调用)
    serialNumber = nebPay.call(to, value, callFunction, callArgs, options);
    mQuery = setInterval( () => {
        mobileLoginQuery();
    },5000);
}

function loginQuery(txhash) {
    document.getElementById("tradeAlert").innerHTML = `
            <h3 class="m-b-20 text-center">${lan.check}</h4>
            <p></p>`
    receiptTransaction(txhash).then(function(resp){
        var respObject = resp;
        console.log(respObject)
        if (respObject.status == 1){
            clearInterval(intervalQuery);
            document.getElementById("tradeAlert").innerHTML = `
            <h3 class="m-b-20 text-center">${lan.success}</h4>
            <p></p>`
            setTimeout(window.location.reload(), 10000)
        } else if (respObject.status == 0) {
            clearInterval(intervalQuery);
            var result = respObject.execute_result;
            if (result == 'Error: You have registered'){
                document.getElementById("tradeAlert").innerHTML = `
                <h3 class="m-b-20 text-center">${lan.fail}</h4>
                <p class="text-center">${lan.joined}</p>`
                userLoaded = 0;
                loadAccount();
            } else {
                document.getElementById("tradeAlert").innerHTML = `
                <h3 class="m-b-20 text-center">${lan.fail}</h4>
                <p class="text-center">${lan.showHash}</p>
                <p>${txhash}</p>`
            }  
        }
    }).catch(function(err){
        clearInterval(intervalQuery);
        document.getElementById("tradeAlert").innerHTML = `
            <h3 class="m-b-20 text-center">${lan.fail}</h4>
            <p>${lan.showHash}</p>
            <p>${txhash}</p>`
    })
}

function buy(){
    var count = document.getElementById('coinAmount').value.trim();
    var usd = document.getElementById('coinValue').value.trim();
    if (count == "") {
        alert(lan.fillIn);
    } else if(isNaN(parseFloat(count))) {
        alert(lan.fillIn);
    } else if(parseFloat(usd) > userBalance) {
        alert(lan.insufficientBalance);
    }else {
        document.getElementById('warning').style.display = 'none'
        document.getElementById('tradeText').style.display = ''
        document.getElementById("tradeAlert2").innerHTML = `
        <h3 class="m-b-20 text-center">${lan.wallet}</h4>
        <p></p>`
        
        var to = contractAddress;
        var value = 0;
        var callFunction = "buyCoin";
        var callArgs =  JSON.stringify([currentCoin, count]);
        var options = {
            qrcode: {
                showQRCode: false,      //是否显示二维码信息
                container: undefined,    //指定显示二维码的canvas容器，不指定则生成一个默认canvas
                completeTip: undefined, // 完成支付提示
                cancelTip: undefined // 取消支付提示
            },
            extension: {
                openExtension: true //是否支持插件调用
            },
            mobile: {
                showInstallTip: true, //是否支持手机钱包安装提示
                installTip: undefined // 手机钱包安装提示
            },
            listener: function (serialNumber,result) {
                console.log(result)
                if(result == "Error: Transaction rejected by user"){
                    alert(lan.cancell)
                } else {
                    var txhash = result.txhash;
                    console.log(txhash)
                    intervalQuery = setInterval(function() {
                        tradeQuery(txhash);
                    }, 3000);
                }
            }
        }
        //发送交易(发起智能合约调用)
        serialNumber = nebPay.call(to, value, callFunction, callArgs, options)
        mQuery = setInterval( () => {
            mobileTradeQuery();
        },5000);
    }
}

function sell(){
    var count = document.getElementById('coinAmount').value.trim();
    if (count == "") {
        alert(lan.fillIn);
    } else if(isNaN(parseFloat(count))) {
        alert(lan.fillIn);
    } else if(parseFloat(count) > userCurrentCount) {
        alert(lan.insufficientCoin);
    }else {
        document.getElementById('warning').style.display = 'none'
        document.getElementById('tradeText').style.display = ''
        document.getElementById("tradeAlert2").innerHTML = `
        <h3 class="m-b-20 text-center">${lan.wallet}</h4>
        <p></p>`
        var to = contractAddress;
        var value = 0;
        var callFunction = "sellCoin";
        var callArgs =  JSON.stringify([currentCoin, count]);
        var options = {
            qrcode: {
                showQRCode: false,      //是否显示二维码信息
                container: undefined,    //指定显示二维码的canvas容器，不指定则生成一个默认canvas
                completeTip: undefined, // 完成支付提示
                cancelTip: undefined // 取消支付提示
            },
            extension: {
                openExtension: true //是否支持插件调用
            },
            mobile: {
                showInstallTip: true, //是否支持手机钱包安装提示
                installTip: undefined // 手机钱包安装提示
            },
            listener: function (serialNumber,result) {
                console.log(result)
                if(result == "Error: Transaction rejected by user"){
                    alert(lan.cancell)
                } else {
                    var txhash = result.txhash;
                    console.log(txhash)
                    intervalQuery = setInterval(function() {
                        tradeQuery(txhash);
                    }, 3000);
                }
            }
        }
        //发送交易(发起智能合约调用)
        serialNumber = nebPay.call(to, value, callFunction, callArgs, options)
        mQuery = setInterval( () => {
            mobileTradeQuery();
        },5000);
    }
} 

function tradeQuery(txhash) {
    document.getElementById("tradeAlert2").innerHTML = `
            <h3 class="m-b-20 text-center">${lan.check}</h4>
            <p></p>`
    receiptTransaction(txhash).then(function(resp){
        var respObject = resp;
        console.log(respObject)
        if (respObject.status == 1){
            clearInterval(intervalQuery);
            document.getElementById("tradeAlert2").innerHTML = `
            <h3 class="m-b-20 text-center">${lan.success}</h3>
            <p class="text-center">${lan.showHash}</p>
            <p class="text-center">${txhash}</p>
            <a class="btn btn-block btn-custom waves-effect waves-light" 
            onclick="document.getElementById('tradeText').style.display = 'none';document.getElementById('warning').style.display = '';">
                ${lan.ok}
            </a>`
            userLoaded = 0;
            loadAccount();
        } else if (respObject.status == 0) {
            console.log("fail")
            clearInterval(intervalQuery);
            document.getElementById("tradeAlert2").innerHTML = `
            <h3 class="m-b-20 text-center">${lan.fail}</h3>
            <p class="text-center">${lan.showHash}</p>
            <p class="text-center">${txhash}</p>
            <a class="btn btn-block btn-custom waves-effect waves-light" 
            onclick="document.getElementById('tradeText').style.display = 'none';document.getElementById('warning').style.display = '';">
                ${lan.ok}
            </a>`
        }
    }).catch(function(err){
        console.log("fail")
        clearInterval(intervalQuery);
        document.getElementById("tradeAlert2").innerHTML = `
        <h3 class="m-b-20 text-center">${lan.fail}</h3>
        <p class="text-center">${lan.showHash}</p>
        <p class="text-center">${txhash}</p>
        <a class="btn btn-block btn-custom waves-effect waves-light" 
        onclick="document.getElementById('tradeText').style.display = 'none';document.getElementById('warning').style.display = '';">
            ${lan.ok}
        </a>`
    })
}

function start(){

    loadInfo();
    loadReward()
    if (!userAddress){
        userAddress = localStorage.getItem('userAddress');
    }
    if (IsPC() || userAddress) {
        accountQuery = setInterval(function() {
            loadAccount().then(function(data){
                if (data != ""){
                    getPrice();
                } 
            });
        }, 1000)
    } else {
        showHome()
    }
}

function loadAccount() {
    return new Promise( function(resolve, reject){
        if (userLoaded == 0){
            getUserAddress().then(function(data){
                console.log(userAddress)
                localStorage.setItem('userAddress', userAddress);
                document.getElementById("userAddress").innerText = userAddress;
                console.log('loading accountInfo')
                neb.api.call({
                    chainID: chainId,
                    from: contractAddress,
                    to: contractAddress,
                    value: 0,
                    nonce: 0,
                    gasPrice: 1000000,
                    gasLimit: 2000000,
                    contract: {
                        function: "searchUser",
                        args: JSON.stringify([userAddress]),
                    }
                }).then(function (resp) {
                    var result = JSON.parse(resp.result)
                    if(result == null){
                        loginTime = loginTime - 1
                        if (loginTime< 0){
                            loginTime = 5;
                            console.log(result);
                            userBalance = -1;
                            document.getElementById("register").innerText = lan.joinAlert;
                            showHome();
                        }
                    } else {
                        loginTime = 5;
                        register = 1;
                        userBalance = result.balance;
                        document.getElementById("register").innerText = `${lan.balance}`
                        document.getElementById("userBalance").innerText = `${Math.floor(userBalance*100)/100}`
                        userWallet = result.coinList;
                        userLoaded = 1;
                        loadWallet();
                    }
                    console.log('loaded accountInfo')
                    resolve(userBalance);
                }).catch(function(err) {
                    console.log(err);
                    resolve(userBalance);
                })
            })   
        } else {
            resolve(userBalance);
        }
    })
}

function loadRank(round) {
    document.getElementById("rankList").innerHTML = ''
    document.getElementById('rankWave').style.display = '';
    document.getElementById('rankTable').style.display = 'none';
    if (isNaN(parseInt(round))){
        alert("Please fill in correct round！")
    } else {
        console.log('loading rank')
        if (!round){
            if (matchRound){
                document.getElementById('round').innerHTML = `${matchRound}`
            } else {
                document.getElementById('round').innerHTML = "1"
            }
        } else {
            document.getElementById('round').innerHTML = `${round}`
        }
        neb.api.call({
            chainID: chainId,
            from: contractAddress,
            to: contractAddress,
            value: 0,
            nonce: 0,
            gasPrice: 1000000,
            gasLimit: 2000000,
            contract: {
                function: "searchRank",
                args: JSON.stringify([parseInt(round)]),
            }
        }).then(function (resp) {
            var userList = JSON.parse(resp.result)
            if(userList.length == 0){
                document.getElementById("rankWave").innerHTML = `
                <h3>${lan.roundAlert}</h3>`
            } else {
                if(matchRound == 0){
                    matchRound = parseInt(userList[0].round);
                    lastRound = matchRound - 1;
                    document.getElementById('lastRank').onclick = function(){loadRank(lastRound)}
                }
                console.log(userList)
                var finalList = new Array()
                for (var u of userList){
                    if(u.balance != 10000){
                        finalList.push(u)
                    }
                }
                finalList.sort(function(li1, li2){
                    var n1=parseInt(li1.balance);  
                    var n2=parseInt(li2.balance);  
                    return n2-n1; 
                });
                console.log(finalList)
                document.getElementById('rankWave').style.display = 'none';
                document.getElementById('rankTable').style.display = '';
                for (var j=0;j<finalList.length;j++){
                    var user = finalList[j];
                    var i = j+1;
                    var rate = Math.floor(user.balance-10000)/100;
                    var award = 0;
                    if(i == 1){
                        award = Math.floor(awardPool*25)/100;
                    } else if(i == 2){
                        award = Math.floor(awardPool*12)/100;
                    } else if(i == 3){
                        award = Math.floor(awardPool*8)/100;
                    } else if(i == 4){
                        award = Math.floor(awardPool*5)/100;
                    } else if(i == 5){
                        award = Math.floor(awardPool*4)/100;
                    } else if(i == 6){
                        award = Math.floor(awardPool*2)/100;
                    } else if(i>=7 && i<= 10){
                        award = Math.floor(awardPool*1)/100;
                    } else if(i>=11 && i<= 50){
                        award = Math.floor(awardPool*0.5)/100;
                    } else if(i>=51 && i<= 150){
                        award = Math.floor(awardPool*0.1)/100;
                    } else if(i>=151 && i<= 350){
                        award = Math.floor(awardPool*0.05)/100;
                    } 
                    var html = `
                    <tr>
                        <td>${user.address}</td>
                        <td>${i}</td>
                        <td>${Math.floor(user.balance*100)/100}</td>
                        <td>${rate}%</td>
                        <td>${award}NAS</td>
                    </tr>`
                    document.getElementById("rankList").insertAdjacentHTML('beforeend', html);
                }
                
            }
            console.log('loaded rank')
        }).catch(function(err) {
            console.log(err);
            loadRank(parseInt(round))
        }) 
    }
}

function loadInfo(){
    console.log('loading info')
    neb.api.call({
        chainID: chainId,
        from: contractAddress,
        to: contractAddress,
        value: 0,
        nonce: 0,
        gasPrice: 1000000,
        gasLimit: 2000000,
        contract: {
            function: "searchInfo",
            args: JSON.stringify([]),
        }
    }).then(function (resp) {
        var info = JSON.parse(resp.result)
        matchRound = parseInt(info.round);
        lastRound = matchRound - 1;
        document.getElementById('lastRank').onclick = function(){loadRank(lastRound)}
        console.log(`第${matchRound}轮比赛`)
        document.getElementById('round').innerText = matchRound;
        console.log('loaded info')
    }).catch(function(err) {
        console.log(err);
        loadInfo()
    }) 

}

function loadReward(){
    console.log('loading reward')
    neb.api.call({
        chainID: chainId,
        from: dropAddress,
        to: dropAddress,
        value: 0,
        nonce: 0,
        gasPrice: 1000000,
        gasLimit: 2000000,
        contract: {
            function: "balance",
            args: JSON.stringify([]),
        }
    }).then(function (resp) {
        var balance =  JSON.parse(resp.result);
        awardPool = parseInt(balance)/1e18; 
        document.getElementById("reward").innerText = awardPool
        console.log("奖池金额：" + awardPool.toString())
    }).catch(function(err) {
        console.log(err);
        loadReward()
    }) 

}

function loadWallet() {
    console.log('loading wallet')
    userWallet.sort(function(li1, li2){
        var n1=parseInt(li1.count);  
        var n2=parseInt(li2.count);  
        return n2-n1; 
    });

    userCoinList = new Array();
    for (var c of userWallet) {
        userCoinList.push(c.name)
    }
    
    document.getElementById("myWallet").innerHTML = ''
    for (var i=0;i<userWallet.length;i++){
        var coin = userWallet[i];
        var name = coin.name;
        var count = coin.count;
        count = Math.floor(count*1000000)/1000000
        var html = `
        <tr>
            <td>${name}</td>
            <td>${count}</td>
            <td><a href="#" class="btn btn-sm btn-custom" id="${name.toLowerCase()}" onclick="">${lan.trade}</a></td>
        </tr>`
        document.getElementById("myWallet").insertAdjacentHTML('beforeend', html);
    }
    console.log('loaded wallet')
}

function getPrice() {
    console.log('loading price')
    neb.api.call({
        chainID: chainId,
        from: contractAddress,
        to: contractAddress,
        value: 0,
        nonce: 0,
        gasPrice: 1000000,
        gasLimit: 2000000,
        contract: {
            function: "searchCoin",
            args: JSON.stringify([]),
        }
    }).then(function (resp) {
        //console.log('loaded price')
        var result = JSON.parse(resp.result)
        for (var coin of result) {
            var name = coin.name;
            switch(name)
            {
            case "BTC":
                showList(coin, btcValue)
                btcValue = coin.price;
                break;
            case "ETH":
                showList(coin, ethValue)
                ethValue = coin.price;
                break;
            case "XRP":
                showList(coin, xrpValue)
                xrpValue = coin.price;
                break;
            case "BCH":
                showList(coin, bchValue)
                bchValue = coin.price;
                break;
            case "EOS":
                showList(coin, eosValue)
                eosValue = coin.price;
                break;
            case "LTC":
                showList(coin, ltcValue)
                ltcValue = coin.price;
                break;
            case "XLM":
                showList(coin, xlmValue)
                xlmValue = coin.price;
                break;
            case "ADA":
                showList(coin, adaValue)
                adaValue = coin.price;
                break;
            case "IOT":
                showList(coin, iotValue)
                iotValue = coin.price;
                break;
            case "TRX":
                showList(coin, trxValue)
                trxValue = coin.price;
                break;
            }
        }
    }).catch(function(err) {
        console.log('price load error');;
    })
}

function showCoin(coin, price, rate, rateColor) {
    if (register == 0){
        alert(lan.joinAlert)
    } else {
        onTrade = 1;
        if (coin != currentCoin){
            document.getElementById('coinAmount').value = '';
            document.getElementById('coinValue').value = '';
            window.scrollTo(0, document.getElementById('trade').offsetTop-200)
        }
        currentPrice = price;
        currentCoin = coin;
        var count = 0;
        if (userWallet){
            for (var dic of userWallet){
                var coinName = dic.name;
                if (coinName == coin){
                    count = dic.count;
                    break;
                }
            }
            showTrade()
        }
        count = Math.floor(count*1000000)/1000000
        userCurrentCount = count;
        userBalance = Math.floor(userBalance*100)/100
        var new_balance;
        if (userBalance == -1){
            new_balance = `<a href="#", onclick="window.location.reload();" class="text-danger">refresh</a>`
        } else {
            new_balance = userBalance
        }
        document.getElementById("coinType").innerText = coin
        document.getElementById("coinShow").innerHTML = `
        <h4 class="m-t-0 header-title"> ${lan.balance}${new_balance} | ${lan.coin}${count}</h4>
        <div class="row text-center">
            <div class="col-sm-3 col-lg-3 col-xl-3"></div>
            <div class="col-sm-6 col-lg-6 col-xl-6">
                <div class="card-box tilebox-one">
                    <h6 class="text-muted text-uppercase mt-0">${coin}</h6>
                    <h2 class="m-b-20">$<span data-plugin="counterup">${price}</span></h2>
                    <span class="text-muted">${lan.change}</span>
                    <span id="currentRate"><span class="badge badge-${rateColor}">${rate}%</span></span> 
                </div>
            </div>
            <div class="col-sm-3 col-lg-3 col-xl-3"></div>
        </div>`
    }
}

function showList(coin, preValue){
    var valueColor = 'default';
    var rateColor = 'default';
    var value = parseFloat(coin.price);
    var rate = parseFloat(coin.rate)
    if (value > preValue){
        valueColor = 'custom'
    } else if (value < preValue) (
        valueColor = 'danger'
    )
    if (rate > 0){
        rateColor = 'custom'
    } else if (rate < 0) {
        rateColor = 'danger'
    }
    document.getElementById(coin.name).innerHTML = `
    <td><img src="assets/images/coins/${coin.name}.png"> ${coin.name}</td>
    <td class="text-${valueColor}">$${value}</td>
    <td><span class="text-${rateColor}">${rate}%</span></td>`
    document.getElementById(coin.name).onclick = function(){
        showCoin(coin.name, value, rate, rateColor)
    }
    if(userCoinList.indexOf(coin.name)>=0){
        document.getElementById(coin.name.toLowerCase()).onclick = function(){
            showCoin(coin.name, value, rate, rateColor)
        }
    }
    if (coin.name == "BTC" && register == 1) {
        document.getElementById("tradeButton").onclick = function(){
            showCoin(coin.name, value, rate, rateColor)
        } 
        if(firstLoad==0){
            firstLoad = 1;
            document.getElementById("tradeButton").click();
        }
    }
    if (coin.name == currentCoin && onTrade == 1) {
        showCoin(currentCoin, value, rate, rateColor)
    }
}

function showHome() {
    onTrade = 0;
    document.getElementById("home").style.display = 'inline';
    document.getElementById("loading").style.display = 'none';
    document.getElementById("trade").style.display = 'none';
    document.getElementById("wallet").style.display = 'none';
    document.getElementById("rank").style.display = 'none';
    document.getElementById('homeText').style.display = 'none'
    if(userBalance>0){
        document.getElementById("want1").innerText = lan.alreadJoined
        document.getElementById("want1").disabled = true;
        document.getElementById("want2").innerText = lan.alreadJoined
        document.getElementById("want2").disabled = true;
    }
    
}

function showTrade() {
    if (register == 0) {
        alert(lan.joinAlert)
    } else {
        onTrade = 1;
        document.getElementById("trade").style.display = 'inline';
        document.getElementById("loading").style.display = 'none';
        document.getElementById("home").style.display = 'none';
        document.getElementById("wallet").style.display = 'none';
        document.getElementById("rank").style.display = 'none';
        document.getElementById('homeText').style.display = 'none'
    }
}

function showWallet() {
    if (register == 0) {
        alert(lan.joinAlert)
    } else {
        onTrade = 0;
        document.getElementById("wallet").style.display = 'inline';
        document.getElementById("loading").style.display = 'none';
        document.getElementById("home").style.display = 'none';
        document.getElementById("trade").style.display = 'none';
        document.getElementById("rank").style.display = 'none';
        document.getElementById('homeText').style.display = 'none'
    }
}

function showRank() {
    onTrade = 0;
    document.getElementById("rank").style.display = 'inline';
    document.getElementById("loading").style.display = 'none';
    document.getElementById("home").style.display = 'none';
    document.getElementById("trade").style.display = 'none';
    document.getElementById("wallet").style.display = 'none';
    document.getElementById('homeText').style.display = 'none';
    loadRank(0)
}

function receiptTransaction(txhash) {
    var promise = new Promise(function(resolve, reject){
        neb.api.getTransactionReceipt(txhash).then(function (resp) {
            resolve(resp);
        }).catch(function(err) {
            console.log(err);
        });
    });
    return promise
}

function IsPC() {  
    var userAgentInfo = navigator.userAgent;  
    var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");  
    var flag = true;  
    for (var v = 0; v < Agents.length; v++) {  
        if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }  
    }  
    return flag;  
}

function getUserAddress() {
    return new Promise( function(resolve, reject){
        if(IsPC()){
            window.postMessage(
            {
                target: 'contentscript',
                // data: 'a',
                method: 'getAccount'
            },
            '*'
            )
            window.addEventListener('message', function(e) {
                if (e.data && e.data.data && e.data.data.account) {
                    userAddress = e.data.data.account;
                    checkTime = 10;
                    resolve(userAddress)
                } else {
                    console.log("没有检测到插件")
                    checkTime = checkTime - 1
                    if (checkTime < 0 && !userAddress){
                        checkTime = 10;
                        showHome();
                        userLoaded = 1
                        resolve(userAddress) 
                    }
                }
            })
        } else {
            resolve(userAddress)
        }
    })
}

$(function(){  
    $('#coinAmount').bind('input propertychange', function() {  
        var a = $('#coinAmount').val();
        var b;
        if(a == ""){
            b = "";
        } else {
            b = a*currentPrice;
        }
        $('#coinValue').val(b);  
    }); 

    $('#coinValue').bind('input propertychange', function() {  
        var a = $('#coinValue').val();
        var b;
        if(a == ""){
            b = "";
        } else {
            b = a/currentPrice;
        }
        $('#coinAmount').val(b);  
    }); 
})

/******************* 倒计时 **********************/
var deadLine = "2018/07/10 24:00:00"
var disposeTime = function(a){
    a = a || new Date().getTime() + 24*60*60*1000;
    var timeArr0 = a.split(' ');
    var timeArr1 = timeArr0[1].split(':');
    return new Date(timeArr0[0]).getTime() + timeArr1[0]*3600000 + timeArr1[1]*60000 + timeArr1[2]*1000;
}

const newDeadLine = new Date(disposeTime(deadLine)).getTime();
// countdown
let timer = setInterval(function() {
    // get today's date
    const today = new Date().getTime();
    // get the difference
    const diff = newDeadLine - today;
    // math
    let days = Math.floor(diff / (1000 * 60 * 60 * 24));
    let hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // display
    document.getElementById("countDown").innerText =
    `${days} ${lan.days} ${hours} ${lan.hours} ${minutes} ${lan.minutes} ${seconds} ${lan.seconds}`

}, 1000);


