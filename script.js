// 디버깅용 (나중에 지워)
let c = localStorage.clear; // <- Illegal invocation이라는데
let s;



window.onload = () => {
    // 디버깅용 (나중에 지워) ------------------------------------------------------------------------------------------------------
    s = submit;



    // 변수 선언 ------------------------------------------------------------------------------------------------------------------
    const fluctuationRange = 0.5;
    const submissionInterval = 60000; // 60000 이상 3600000 이하


    // 함수들 ---------------------------------------------------------------------------------------------------------------------
    function transformToProbability(num) {
        return `${(Math.round(num * 100)).toString()}%`
    }

    const valuesUpdates = {
        stockLens: function(i) {
            const stockInputDOM = $S.stockInputs[i];
            const stockInput = parseInt(stockInputDOM.value || 0);

            stockLens[i] = stockInput;
        },
        stockSum: function () {
            stockSum = stockValues.reduce((acc, value, index) => acc + value * stockLens[index], 0);
        }
    }

    const DOMsUpdates = {
        yourMoney: function () {
            const yourMoneyDOM = $S.yourMoney;
            const yourMoneyStr = yourMoney.toLocaleString("ko-KR");
            const sumStr = stockSum.toLocaleString("ko-KR");

            yourMoneyDOM.innerText = `${userName}의 돈: ${yourMoneyStr} (-${sumStr}원)`;
        },
        stockValues: function (i) {
            const stockValueDOM = $S.stockValues[i];
            const stockValue = stockValues[i];
            const stockValueStr = stockValue.toLocaleString("ko-KR");

            stockValueDOM.innerText = stockValueStr;
        },
        stockLens: function (i) {
            const stockInputDOM = $S.stockInputs[i]
            const stockLen = stockLens[i];
            const stockLenStr = String(stockLen);
    
            stockInputDOM.value = stockLenStr;
        },
        probabilities: function (i) {
            const stockSuccessDOM = $S.stockSuccesses[i];
            const stockFailDOM = $S.stockFails[i];
            const stockSuccessProbability = stockSuccessProbabilities[i];
            const stockFailProbability = stockFailProbabilities[i];
            const stockFailProbabilityAdjustedtoClient = (1 - stockSuccessProbability) * stockFailProbability;
            const stockSuccessProbabilityStr = transformToProbability(stockSuccessProbability);
            const stockFailProbabilityAdjustedtoClientStr = transformToProbability(stockFailProbabilityAdjustedtoClient);

            stockSuccessDOM.innerText = stockSuccessProbabilityStr;
            stockFailDOM.innerText = stockFailProbabilityAdjustedtoClientStr;
        },
        round: function () {
            const roundDOM = $S.round;
            const roundStr = String(round);

            roundDOM.innerText = `- ${roundStr}라운드-`;
        },
        whentoSubmit: function (date) {
            const whentoSubmitDOM = $S.whentoSubmit;
            whentoSubmitDOM.innerText = getRemainingTime(submissionInterval, date);
        }
    }

    function LSNUpdate() {
        window.localStorage.setItem('N', JSON.stringify([
            yourMoney,
            stockValues,
            stockLens,
            stockSuccessProbabilities,
            stockFailProbabilities,
            round
        ]));
    }

    const newRoundValuesUpdates = {
        yourMoneyandstockValues: function (i) {
            const stockValue = stockValues[i];
            const stockLen = stockLens[i];
            const stockSuccessProbability = stockSuccessProbabilities[i];
            const stockFailProbability = stockFailProbabilities[i];
            const stockValueFluctuation = Math.round(stockValue * fluctuationRange);
            const stockSumFluctuation = Math.round(stockSum * fluctuationRange);
            const stockSum = stockValue * stockLen;

            // 주가, 소지금 변경
            if (Math.random() < stockSuccessProbability) {
                stockValues[i] += stockValueFluctuation;
                yourMoney += stockSumFluctuation;
            } else if (Math.random() < stockFailProbability) {
                stockValues[i] -= stockValueFluctuation;
                yourMoney -= stockSumFluctuation;
            }
        },
        probabilities: function (i) {
            // 변곡점 (0.5, 0.3) / (0, 0), (1, 0.6) 지남
            const x1 = Math.random();
            stockSuccessProbabilities[i] = x1 ** 3 - 1.5 * x1 ** 2 + 1.1 * x1;
            // 변곡점 (0.5, 0.5) / (0, 0), (1, 1) 지남
            const x2 = Math.random();
            stockFailProbabilities[i] = 2 * x2 ** 3 - 3 * x2 ** 2 + 2 * x2;
        },
        round: function () {
            round++;
        }
    }

    function newRoundUpdateValues() {
        for (let i = 0; i < 4; i++) {
            newRoundValuesUpdates.yourMoneyandstockValues(i);
            newRoundValuesUpdates.probabilities(i);
        }
        newRoundValuesUpdates.round();
    }

    function newRoundUpdateDOMs() {
        DOMsUpdates.yourMoney();
        for (let i = 0; i < 4; i++) {
            DOMsUpdates.stockValues(i);
            DOMsUpdates.probabilities(i);
        }
        DOMsUpdates.round();
    }

    function isTheTime(interval, date) {
        const min = interval / 60000;
        return date.getMinutes() % min == 0 && date.getSeconds() == 0;
    }

    function getRemainingTime(interval, date) {
        // 0초 대신 60초가 표기되는 오류가 있으나 귀찮으므로 방치 예정
        const min = interval / 60000;
        const remainingMinutes = min - (date.getMinutes() % min) - 1;
        const remainingSeconds = 60 - date.getSeconds();

        return `제출까지 남은 시간: ${remainingMinutes}분 ${remainingSeconds}초`
    }

    function submit() {
        if (stockSum <= yourMoney) {
            newRoundUpdateValues();
            newRoundUpdateDOMs();
            LSNUpdate();

            alert("제출 성공", new Date);
        } else {
            alert("주식은 여윳돈으로 하셔야 됩니다.");
            alert("제출 실패", new Date);
        }

        // ranking[userName] = yourMoney;
        // 졸리다
    }

    function LSUserNameUpdate() {
        window.localStorage.setItem('userName', userName);
    }



    // localStorage에서 가져오기 --------------------------------------------------------------------------------------------------
    const defaultValues = [
        1e6, // 소지금
        [1e3, 2e3, 3e3, 4e3], // 주가 
        [0, 0, 0, 0], // 주수
        [0.7, 0.7, 0.7, 0.7], // 성공 확률
        [0.5, 0.5, 0.5, 0.5], // 실패 확률
        1, // 라운드 수
    ];
    const LSNValues= JSON.parse(window.localStorage.getItem('N'));
    const values = LSNValues || defaultValues;
    let yourMoney = values[0];
    let stockValues = values[1];
    let stockLens = values[2];
    let stockSuccessProbabilities = values[3];
    let stockFailProbabilities = values[4];
    let round = values[5];
    const defaultUserName = `유저${parseInt(Math.random() * 1000)}`;
    const LSUserName= window.localStorage.getItem('userName');
    const userName = LSUserName || defaultUserName;
    let stockSum = stockValues.reduce((acc, value, index) => acc + value * stockLens[index], 0);




    // DOM들 가져오기 -------------------------------------------------------------------------------------------------------------
    const $S = {
        top: document.getElementById("Top"),
        menu: document.getElementById("Menu"),
        menuStocks: document.getElementById("Menu-stocks"),
        menuNews: document.getElementById("Menu-news"),
        stocks: document.getElementById("Stocks"),
        news: document.getElementById("News"),
        profile: document.getElementById("Profile"),
        stockValues: document.getElementsByClassName("stock-value"),
        stockInputs: document.getElementsByClassName("stock-input"),
        stockSuccesses: document.getElementsByClassName("stock-success"),
        stockFails: document.getElementsByClassName("stock-fail"),
        yourMoney: document.getElementById("your-money"),
        // submit: document.getElementById("submit"),
        whentoSubmit: document.getElementById("when-to-submit"),
        round: document.getElementById("round")
    }

    $S.menuStocks.onclick = () => {
        $S.stocks.style.display = "grid";
        $S.news.style.display = "none";
        $S.menuStocks.classList.add("selected");
        $S.menuNews.classList.remove("selected");
    }

    $S.menuNews.onclick = () => {
        $S.stocks.style.display = "none";
        $S.news.style.display = "grid";
        $S.menuStocks.classList.remove("selected");
        $S.menuNews.classList.add("selected");
    }

    for (let i = 0; i < 4; i++) {
        const stockInputDOM = $S.stockInputs[i];

        stockInputDOM.oninput = () => {
            valuesUpdates.stockLens(i);
            valuesUpdates.stockSum();
            DOMsUpdates.yourMoney();
            LSNUpdate();
        }
    }

    // $S.submit.onclick = () => {
    //     if (stockSum <= yourMoney) {
    //         newRoundUpdateValues();
    //         newRoundUpdateDOMs();
    //         LSUpdate();
    //     } else {
    //         console.log("대충 할 수 없다는 메시지 출력하기");
    //     }
    // }



    // DOM들 업데이트 -------------------------------------------------------------------------------------------------------------
    DOMsUpdates.yourMoney();
    for (let i = 0; i < 4; i++) {
        DOMsUpdates.stockValues(i);
        DOMsUpdates.stockLens(i);
        DOMsUpdates.probabilities(i);
    }
    DOMsUpdates.round();
    LSNUpdate();
    LSUserNameUpdate();




    // 댜충 setInterval 관련 ------------------------------------------------------------------------------------------------------
    const updateEverySecond = setInterval(function () {
        const now = new Date();
        if (isTheTime(submissionInterval, now)) {
            submit();
        }

        DOMsUpdates.whentoSubmit(now);
    }, 1000);
    // @todo: 대충 몇 시 되면 setInterval 종료 때리고 when-to-submit에 게임 종료 비스무리한 거 출력하게 하기



    // 랭킹 관련 ------------------------------------------------------------------------------------------------------------------
    // 사실 없음 ㅋ
}