const fetch = require('node-fetch')
const express = require('express')

const app = express()
app.use(express.json())

Object.assign(process.env, {
  HARDHAT_URL: 'https://hardhat.unirep.social/',
  PORT: 4000,
  ...process.env,
})
const { HARDHAT_URL, PORT } = process.env

// Make all entries in array keyed to value true in object
const objectify = (obj, key) => ({ ...obj, [key]: true })

const legalMethods = [
  'eth_chainId',
  'eth_syncing',
  'eth_call',
  'net_version',
  'eth_getBlockByNumber',
  'eth_getLogs',
  'eth_getTransactionByHash',
  'eth_blockNumber',
  'eth_estimateGas',
  'eth_getTransactionCount',
  'eth_gasPrice',
  'eth_sendRawTransaction',
  'eth_sendTransaction'
].reduce(objectify, {})

app.post('/', async (req, res) => {
  const { jsonrpc, method, params, id } = req.body
  if (jsonrpc !== '2.0') {
    res.status(400).json({ message: `jsonrpc version 2.0 required` })
    return
  }
  if (!legalMethods[method]) {
    res.status(401).json({ message: `Method ${method} is not allowed` })
    return
  }

  try {
    const r = await fetch(HARDHAT_URL, {
      method: 'POST',
      body: JSON.stringify(req.body),
      headers: {'Content-Type': 'application/json'}
    })
    if (!r.ok) {
      res.status(500).end(r.statusText)
      return
    }
    r.body.pipe(res)
  } catch (err) {
    res.status(500).end(`Uncaught error: ${err.toString()}`)
  }
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
