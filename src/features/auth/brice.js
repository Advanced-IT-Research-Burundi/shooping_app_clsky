function converToUSDandBIF(amount, exchangeRate, currentBurundianFrancRate) {
    // Implementation here
    $usd = amount / exchangeRate;
    $bif = $usd * currentBurundianFrancRate;
    return {
        'USD' : $usd,
        'BIF': $bif,
        'RMB': amount
    };
}

console.log(converToUSDandBIF(100, 7.2, 7000)); // Expected output: 0.051