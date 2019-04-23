const _ = require('lodash')
const Axios = require('axios')
const DB = require(`../../db.js`)
const BlackfiskDB = DB.blackfisk.db
const ChannelOrderShipment = DB.blackfisk.models.channelOrderShipment
const Environmental = require('../../../../lib/environmental.js')
const Config = require('../../../../config/index.js')

let apiHost = Environmental.findAPIHost(process.env.NODE_ENV)

const formatAddressAsEasypost = (address) => {
  return {
    name: address.name,
    company: address.company,
    street1: address.addressLine1,
    street2: address.addressLine2,
    city: address.city,
    state: address.stateOrProvidence,
    zip: address.postalCode,
    country: address.country,
    residential: null,
    phone: address.phoneWork !== null ? address.phoneWork : address.phoneHome,
    email: address.email
  }
}

const createNewShipment = async (order, api) => {
  const accountId = order.accountId
  const authToken = Config.JWT_TOKEN_SERVER_ONLY
  console.log('Creating New Shipment for ChannelOrderId: ', order.id)
  const toAddress = new api.Address(formatAddressAsEasypost(order.shipTo))
  const fromAddress = new api.Address(formatAddressAsEasypost(order.channel.shipFrom))
  const returnTo = new api.Address(formatAddressAsEasypost(order.channel.returnTo))

  let carriers = _.map(order.channel.shippers, 'alternativeId')
  let parcel = new api.Parcel({
    length: 1,
    width: 1,
    height: 1,
    weight: 0
  })

  for (let o = 0; o < order.items.length; o++) {
    let item = order.items[o]
    parcel.weight = parcel.weight + item.product.packageWeightOunce
    // Default Item Width
    if (item.product.packageWidthInch === 0) {
      item.product.packageWidthInch = 1
    }
    // Default Item Height
    if (item.product.packageHeightInch === 0) {
      item.product.packageHeightInch = 1
    }
    // Default Item Length
    if (item.product.packageLengthInch === 0) {
      item.product.packageLengthInch = 1
    }

    if (item.product.packageWidthInch * item.product.packageHeightInch * item.product.packageLengthInch > parcel.width * parcel.height * parcel.length) {
      parcel.width = item.product.packageWidthInch
      parcel.height = item.product.packageHeightInch
      parcel.length = item.product.packageLengthInch
    }
  }

  // Default Weight
  if (parcel.weight === 0) {
    parcel.weight = 0.99
  }

  if (order.isPrime) {
    carriers = _.map([_.find(order.channel.shippers, {type: 'Amazon MWS'})], 'alternativeId')
  } else {
    carriers = order.channel.shippers
    carriers.splice(_.findIndex(order.channel.shippers, {type: 'Amazon MWS'}), 1)
    carriers = _.map(carriers, 'alternativeId')
  }

  let shipment = new api.Shipment({
    to_address: toAddress,
    from_address: fromAddress,
    return_address: returnTo,
    parcel: parcel,
    carrier_accounts: carriers,
    options: {
      label_format: 'zpl',
      delivery_confirmation: 'NO_SIGNATURE', // [SIGNATURE, ADULT_SIGNATURE]
      invoice_number: order.channelOrderNumber,
      print_custom_1_code: 'PO',
      print_custom_1: order.channelOrderNumber,
      print_custom_2_code: 'IK',
      print_custom_2: order.id
    }
  })

  if (order.isPrime) {
    shipment.options.fulfiller_order_id = order.channelOrderNumber
    shipment.options.fulfiller_order_items = []
    _.each(order.items, item => {
      shipment.options.fulfiller_order_items.push({
        id: item.channelOrderItemId,
        quantity: item.quantityOrdered
      })
    })
  }

  await shipment.save().then().catch(e => {
    console.error('\n\nEasypost Error\n\n', e)
  })

  let formatRates = await Axios({
    method: 'POST',
    url: `${apiHost}/v1/shipping/daysInTransit`,
    data: {
      easypostData: shipment,
      shippedAt: new Date()
    },
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'x-account-id': `${accountId}`
    }
  }).catch((err) => {
    console.error('Days in Transit', err.response.data)
    return err.response.data
  })
  shipment.rates = formatRates.data.data

  let businessRules = await Axios({
    method: 'POST',
    url: `${apiHost}/v1/shipping/businessRules/${order.id}`,
    data: {
      easypostData: shipment
    },
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'x-account-id': `${accountId}`
    }
  }).catch((err) => {
    console.error('Business Rules', err)
    return err
  })
  shipment.rates = businessRules.data.data

  let orderShipment = new ChannelOrderShipment()
  orderShipment.easypostJSON = shipment
  orderShipment.alternativeId = order.channelOrderNumber
  orderShipment.channelOrderId = order.id
  orderShipment.packageWidthInch = parcel.width
  orderShipment.packageHeightInch = parcel.height
  orderShipment.packageLengthInch = parcel.length
  orderShipment.packageWeightOunce = parcel.weight
  orderShipment.hasRates = 1
  const options = {
    noDelete: true
  }
  console.log('Saving Shipment for ChannelOrderId: ', order.id)
  await ChannelOrderShipment.query(BlackfiskDB).upsertGraph(orderShipment, options)
}

module.exports = { formatAddressAsEasypost, createNewShipment }
