const gdaxAPI = new GDAXHandler("https://api-public.sandbox.gdax.com")
const bitfinexAPI = new BitfinexHandler("https://api.bitfinex.com")

$(document).ready( () => {

  $('#select-currency').on('change', (e) => {
    const market = $('#select-currency').val()
    const valuesArray = []
    const t1 = gdaxAPI.getTicker(market)
      .then(ticker => {
        valuesArray.push({exchange: 'GDAX', BTCValue: ticker.price})
        $('#market-values').append(displayMarketValue(`In GDAX the BTC value is ${ticker.price}`))
      })
      .catch(err => console.log(err))

    const t2 = bitfinexAPI.getTicker(market)
      .then(ticker => {
        valuesArray.push({exchange: 'Bitfinex', BTCValue: ticker[6]})
        $('#market-values').append(displayMarketValue(`In Bitfinex the BTC value is ${ticker[6]}`))
      })
      .catch(err => console.log(err))

    Promise.all([t1, t2])
      .then(() => {
        const orderedValuesArray = valuesArray.sort( (a, b) => { return a.BTCValue - b.BTCValue })
        displayCheapestOption($('#market-values'), $('#market-values-btns'), orderedValuesArray[0])
      })
  })

  $('#init-arbitrage').on('click', (e) => {
    e.preventDefault()
    $.ajax({
      method:  'POST',
      url:     `/wallets/init-arbitrage`,
      dataType:'json',
      data:    {exchange: $('#init-arbitrage').attr('data-exchange'),
                BTCValue: $('#init-arbitrage').attr('data-value')}
    })
    .then(()=>console.log('ENVIADO'))
    .catch((e)=>console.log(e))
  })
})

function displayMarketValue(infoMarket){
  return $('<p>').text(infoMarket)
}

function displayCheapestOption($parentText, $parentBtns, cheapestOption){
  const $cheapestOptionText =  $('<p>').text(`The cheapest option is to buy in ${cheapestOption.exchange}`)
  const $maybeLaterBtn = $('<a>').attr('href', '/users/home').text(`Maybe later`)

  $parentText.append($cheapestOptionText)
  $parentBtns.append($maybeLaterBtn)
  $('#init-arbitrage')
  .attr('data-exchange', `${cheapestOption.exchange}`)
  .attr('data-value', `${cheapestOption.BTCValue}`)
  .text(`Initialize arbitrage with ${cheapestOption.exchange}`).show()
}
