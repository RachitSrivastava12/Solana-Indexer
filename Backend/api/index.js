require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pg = require('pg');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const RateLimit = require('async-ratelimiter');
const Redis = require('ioredis');
const { PublicKey, Connection } = require('@solana/web3.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const pool = new pg.Pool({
  connectionString: 'postgresql://solana_indexer_user:WqFMMHRnbjHQBu8lp8manjvqWM8er86J@dpg-d0pkr6umcj7s73e93i40-a.singapore-postgres.render.com/solana_indexer',
  ssl: {
    rejectUnauthorized: false,
  },
});
// Initialize Solana connection
let solanaConnection = null;
let network = 'mainnet'; // Default to mainnet, will be updated based on RPC URL

// Helius RPC URLs
const RPC_URL =  'https://mainnet.helius-rpc.com/?api-key=010cd958-a025-4a1a-aa7e-cc27d509f643';
const WS_URL =  'wss://mainnet.helius-rpc.com/?api-key=010cd958-a025-4a1a-aa7e-cc27d509f643';

// Explicitly define Buffer
const Buffer = require('buffer').Buffer;

// Rate limiter setup (10 req/sec for Helius free tier)
const rateLimiter = new RateLimit({
  db: new Redis(),
  max: 10,
  duration: 1000
});

// Debug Redis connection
rateLimiter.db.on('error', (err) => console.error('Redis error:', err));
rateLimiter.db.on('connect', () => console.log('Connected to Redis for rate limiting'));

// Retry logic for RPC calls
async function withRetry(fn, maxRetries = 3, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRetryable = error.message.includes('rate limit') || error.message.includes('429') || (error.cause && error.cause.code === 'ETIMEDOUT');
      if (attempt === maxRetries || !isRetryable) {
        console.error(`Retry failed after ${maxRetries} attempts:`, error.message);
        throw error;
      }
      console.warn(`Retry ${attempt}/${maxRetries} after error: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
}

// Custom fetch with timeout
const customFetch = async (url, options) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    console.error('Fetch error:', error.message);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

// Initialize Solana connection
app.post('/api/initialize', async (req, res) => {
  try {
    const { rpcUrl = RPC_URL } = req.body;
    console.log('Initializing Solana connection with RPC URL:', rpcUrl);

    if (rpcUrl.includes('devnet')) {
      network = 'devnet';
    } else if (rpcUrl.includes('mainnet')) {
      network = 'mainnet';
    } else {
      network = 'unknown';
    }
    console.log(`Detected network: ${network}`);

    solanaConnection = new Connection(rpcUrl, {
      wsEndpoint: WS_URL,
      commitment: 'confirmed',
      httpHeaders: { 'User-Agent': 'Solana Indexer' },
      fetch: customFetch
    });

    const blockHeight = await withRetry(() => solanaConnection.getBlockHeight());
    console.log('Solana connection established at block height:', blockHeight);

    res.json({
      success: true,
      message: 'Solana connection established',
      blockHeight,
      network
    });
  } catch (error) {
    console.error('Initialization error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize Solana connection',
      error: error.message
    });
  }
});

// Configure database
app.post('/api/configure-database', async (req, res) => {
  try {
    const { connectionType, host, port, database, username, password, connectionUrl } = req.body;

    let connectionString;
    if (connectionType === 'url') {
      connectionString = connectionUrl;
    } else {
      connectionString = `postgresql://${username}:${password}@${host}:${port}/${database}`;
    }

    pool.options.connectionString = connectionString;

    const client = await pool.connect();
    await client.query('SELECT NOW()');
    await createTablesIfNeeded(client);
    client.release();

    res.json({ success: true, message: 'Database configuration successful' });
  } catch (error) {
    console.error('Database configuration error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to configure database', error: error.message });
  }
});

// Create necessary tables and apply migrations
async function createTablesIfNeeded(client) {
  try {
    await client.query('BEGIN');

    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS nft_bids (
        id SERIAL PRIMARY KEY,
        nft_address TEXT NOT NULL,
        bidder TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW(),
        signature TEXT UNIQUE
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS nft_prices (
        id SERIAL PRIMARY KEY,
        nft_address TEXT NOT NULL,
        seller TEXT NOT NULL,
        buyer TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW(),
        signature TEXT UNIQUE
      )
    `);

    // Create tokens_to_borrow table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tokens_to_borrow (
        id SERIAL PRIMARY KEY,
        token TEXT NOT NULL,
        amount_available NUMERIC NOT NULL,
        interest_rate NUMERIC NOT NULL,
        platform TEXT NOT NULL,
        last_updated TIMESTAMP DEFAULT NOW()
      )
    `);

    // Ensure the UNIQUE constraint on (token, platform) exists
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 
          FROM pg_constraint 
          WHERE conname = 'tokens_to_borrow_unique' 
          AND contype = 'u'
        ) THEN 
          ALTER TABLE tokens_to_borrow 
          ADD CONSTRAINT tokens_to_borrow_unique UNIQUE (token, platform); 
        END IF; 
      END $$;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS token_prices (
        id SERIAL PRIMARY KEY,
        token TEXT NOT NULL,
        price_usd NUMERIC NOT NULL,
        change_24h NUMERIC,
        volume_24h NUMERIC,
        last_updated TIMESTAMP DEFAULT NOW(),
        CONSTRAINT unique_token UNIQUE (token)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS token_price_history (
        id SERIAL PRIMARY KEY,
        token TEXT NOT NULL,
        price_usd NUMERIC NOT NULL,
        change_24h NUMERIC,
        volume_24h NUMERIC,
        timestamp TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS custom_queries (
        id SERIAL PRIMARY KEY,
        query_name TEXT NOT NULL,
        query_sql TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS indexing_status (
        id SERIAL PRIMARY KEY,
        is_active BOOLEAN DEFAULT FALSE,
        start_time TIMESTAMP,
        last_block_height BIGINT,
        records_processed BIGINT DEFAULT 0,
        records_per_second NUMERIC DEFAULT 0,
        last_updated TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      INSERT INTO indexing_status (id, is_active, records_processed, records_per_second)
      VALUES (1, FALSE, 0, 0)
      ON CONFLICT (id) DO NOTHING
    `);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating tables:', error.message);
    throw error;
  }
}

// Validate SQL query
function isValidSqlQuery(query) {
  if (!query || typeof query !== 'string') return false;
  query = query.trim().toLowerCase();
  return query.startsWith('select') && !query.includes(';') && !query.includes('delete') && !query.includes('update') && !query.includes('insert');
}

// Start indexing
app.post('/api/start-indexing', async (req, res) => {
  try {
    const { dataTypes } = req.body;
    console.log('Starting indexing for data types:', dataTypes);

    if (!solanaConnection) {
      return res.status(400).json({ success: false, message: 'Solana connection not initialized' });
    }

    const client = await pool.connect();
    const statusResult = await client.query('SELECT is_active, records_processed FROM indexing_status WHERE id = 1');
    const isActive = statusResult.rows[0]?.is_active;

    if (isActive && indexers.nftBids && dataTypes.nftBids && dataTypes.nftPrices && dataTypes.tokensToBorrow && dataTypes.tokenPrices) {
      client.release();
      return res.json({ success: true, message: 'Indexing already active with requested data types' });
    }

    try {
      await client.query('BEGIN');

      await client.query(`
        INSERT INTO indexing_status (id, is_active, start_time, last_updated, records_processed, records_per_second)
        VALUES (1, TRUE, NOW(), NOW(), 0, 0)
        ON CONFLICT (id) 
        DO UPDATE SET 
          is_active = TRUE, 
          start_time = NOW(), 
          last_updated = NOW(),
          records_processed = 0,
          records_per_second = 0
      `);

      if (dataTypes.customQueries && dataTypes.customQueries.length > 0) {
        for (const [index, query] of dataTypes.customQueries.entries()) {
          if (query.trim() && isValidSqlQuery(query)) {
            await client.query(`
              INSERT INTO custom_queries (query_name, query_sql) 
              VALUES ($1, $2)
            `, [`Custom Query ${index + 1}`, query]);
          } else {
            console.warn(`Invalid or empty custom query at index ${index}:`, query);
          }
        }
      }

      await client.query('COMMIT');

      if (dataTypes.nftBids || dataTypes.nftPrices || dataTypes.tokensToBorrow || dataTypes.tokenPrices) {
        startIndexer(dataTypes);
      }

      res.json({ success: true, message: 'Indexing started successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Start indexing error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to start indexing', error: error.message });
  }
});

// Stop indexing
app.post('/api/stop-indexing', async (req, res) => {
  try {
    const client = await pool.connect();

    await client.query(`
      UPDATE indexing_status
      SET is_active = FALSE, last_updated = NOW()
      WHERE id = 1
    `);

    client.release();
    stopAllIndexers();

    res.json({ success: true, message: 'Indexing stopped successfully' });
  } catch (error) {
    console.error('Stop indexing error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to stop indexing', error: error.message });
  }
});

// Get indexing status
app.get('/api/indexing-status', async (req, res) => {
  try {
    const client = await pool.connect();

    const result = await client.query(`
      SELECT is_active, start_time, last_block_height, records_processed, records_per_second, last_updated
      FROM indexing_status
      WHERE id = 1
    `);

    client.release();

    const status = result.rows[0] || {
      is_active: false,
      start_time: new Date(),
      last_block_height: null,
      records_processed: 0,
      records_per_second: 0,
      last_updated: new Date()
    };

    const startTime = new Date(status.start_time);
    const now = new Date();
    const durationMs = status.is_active ? now - startTime : 0;

    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

    const duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    res.json({
      success: true,
      active: status.is_active,
      startTime: status.start_time,
      duration,
      lastBlockHeight: status.last_block_height,
      recordsProcessed: status.records_processed,
      recordsPerSecond: status.records_per_second,
      lastUpdated: status.last_updated
    });
  } catch (error) {
    console.error('Get indexing status error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get indexing status', error: error.message });
  }
});

// Get custom queries
app.get('/api/custom-queries', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT id, query_name, created_at
      FROM custom_queries
      ORDER BY created_at
    `);
    client.release();

    res.json({
      success: true,
      queries: result.rows
    });
  } catch (error) {
    console.error('Get custom queries error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get custom queries', error: error.message });
  }
});

// Get data preview
app.get('/api/data-preview/:dataType', async (req, res) => {
  try {
    const { dataType } = req.params;
    let query;
    let tableName;

    switch (dataType) {
      case 'nftBids':
        tableName = 'nft_bids';
        query = 'SELECT * FROM nft_bids ORDER BY timestamp DESC LIMIT 10';
        break;
      case 'nftPrices':
        tableName = 'nft_prices';
        query = 'SELECT * FROM nft_prices ORDER BY timestamp DESC LIMIT 10';
        break;
      case 'tokensToBorrow':
        tableName = 'tokens_to_borrow';
        query = 'SELECT * FROM tokens_to_borrow ORDER BY last_updated DESC LIMIT 10';
        break;
      case 'tokenPrices':
        tableName = 'token_price_history';
        query = 'SELECT * FROM token_price_history ORDER BY timestamp DESC LIMIT 10';
        break;
      default:
        if (dataType.startsWith('custom_')) {
          const customQueryId = dataType.split('_')[1];
          const customQueryResult = await pool.query(
            'SELECT query_sql FROM custom_queries WHERE id = $1',
            [customQueryId]
          );
          if (customQueryResult.rows.length > 0) {
            query = customQueryResult.rows[0].query_sql;
            tableName = `custom_query_${customQueryId}`;
          } else {
            return res.status(404).json({ success: false, message: 'Custom query not found' });
          }
        } else {
          return res.status(400).json({ success: false, message: 'Invalid data type' });
        }
    }

    const client = await pool.connect();
    const result = await client.query(query);
    client.release();

    res.json({
      success: true,
      data: result.rows,
      tableName
    });
  } catch (error) {
    console.error('Data preview error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get data preview', error: error.message });
  }
});

// Get data type statistics
app.get('/api/data-type-stats', async (req, res) => {
  try {
    const client = await pool.connect();

    const stats = [];

    try {
      const nftBidsResult = await client.query(`
        SELECT COUNT(*) as count,
          MAX(timestamp) as last_update,
          (SELECT COUNT(*) FROM nft_bids WHERE timestamp >= NOW() - INTERVAL '24 HOURS') as records_24h,
          (SELECT COUNT(*) FROM nft_bids WHERE timestamp >= NOW() - INTERVAL '48 HOURS' AND timestamp < NOW() - INTERVAL '24 HOURS') as records_prev_24h
        FROM nft_bids
      `);

      if (nftBidsResult.rows[0].count > 0) {
        const row = nftBidsResult.rows[0];
        const growth = row.records_prev_24h > 0
          ? ((row.records_24h - row.records_prev_24h) / row.records_prev_24h) * 100
          : 0;

        stats.push({
          name: 'NFT Bids',
          recordCount: parseInt(row.count),
          lastUpdate: formatTimeAgo(new Date(row.last_update)),
          growth: parseFloat(growth.toFixed(1))
        });
      }
    } catch (error) {
      console.error('Error getting NFT bids stats:', error.message);
    }

    try {
      const nftPricesResult = await client.query(`
        SELECT COUNT(*) as count,
          MAX(timestamp) as last_update,
          (SELECT COUNT(*) FROM nft_prices WHERE timestamp >= NOW() - INTERVAL '24 HOURS') as records_24h,
          (SELECT COUNT(*) FROM nft_prices WHERE timestamp >= NOW() - INTERVAL '48 HOURS' AND timestamp < NOW() - INTERVAL '24 HOURS') as records_prev_24h
        FROM nft_prices
      `);

      if (nftPricesResult.rows[0].count > 0) {
        const row = nftPricesResult.rows[0];
        const growth = row.records_prev_24h > 0
          ? ((row.records_24h - row.records_prev_24h) / row.records_prev_24h) * 100
          : 0;

        stats.push({
          name: 'NFT Prices',
          recordCount: parseInt(row.count),
          lastUpdate: formatTimeAgo(new Date(row.last_update)),
          growth: parseFloat(growth.toFixed(1))
        });
      }
    } catch (error) {
      console.error('Error getting NFT prices stats:', error.message);
    }

    try {
      const tokensToBorrowResult = await client.query(`
        SELECT COUNT(*) as count,
          MAX(last_updated) as last_update
        FROM tokens_to_borrow
      `);

      if (tokensToBorrowResult.rows[0].count > 0) {
        stats.push({
          name: 'Tokens to Borrow',
          recordCount: parseInt(tokensToBorrowResult.rows[0].count),
          lastUpdate: formatTimeAgo(new Date(tokensToBorrowResult.rows[0].last_update)),
          growth: 0
        });
      }
    } catch (error) {
      console.error('Error getting tokens to borrow stats:', error.message);
    }

    try {
      const tokenPricesResult = await client.query(`
        SELECT COUNT(*) as count,
          MAX(last_updated) as last_update
        FROM token_prices
      `);

      if (tokenPricesResult.rows[0].count > 0) {
        stats.push({
          name: 'Token Prices',
          recordCount: parseInt(tokenPricesResult.rows[0].count),
          lastUpdate: formatTimeAgo(new Date(tokenPricesResult.rows[0].last_update)),
          growth: 0
        });
      }
    } catch (error) {
      console.error('Error getting token prices stats:', error.message);
    }

    try {
      const customQueriesResult = await client.query(`
        SELECT id, query_name
        FROM custom_queries
      `);

      if (customQueriesResult.rows.length > 0) {
        stats.push({
          name: 'Custom Queries',
          recordCount: parseInt(customQueriesResult.rows.length),
          lastUpdate: 'N/A',
          growth: 0
        });
      }
    } catch (error) {
      console.error('Error getting custom queries stats:', error.message);
    }

    client.release();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Data type stats error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get data type statistics', error: error.message });
  }
});

// Format time ago helper function
function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);

  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

// Indexer logic
let indexers = {
  nftBids: null,
  nftPrices: null,
  tokensToBorrow: null,
  tokenPrices: null
};

// Processed signatures for deduplication
let processedSignatures = new Set();

// Helper function to extract NFT bid details (Magic Eden)
async function extractNftBidDetails(tx) {
  try {
    if (!tx || !tx.transaction || !tx.transaction.message || !tx.transaction.message.instructions) {
      return null;
    }

    const magicEdenProgramId = 'M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K';
    const magicEdenInstruction = tx.transaction.message.instructions.find(
      (instr) => instr.programId.toBase58() === magicEdenProgramId
    );

    if (!magicEdenInstruction || !magicEdenInstruction.accounts) {
      return null;
    }

    const instructionData = magicEdenInstruction.data;
    if (!instructionData || typeof instructionData !== 'string') {
      return null;
    }

    const dataBuffer = Buffer.from(instructionData, 'base64');
    if (dataBuffer.length < 1 || dataBuffer[0] !== 0xe8) {
      return null;
    }

    console.log('Magic Eden bid instruction accounts:', magicEdenInstruction.accounts.map(acc => acc.toBase58()));
    console.log('Magic Eden bid instruction data:', instructionData);

    let bidder = tx.transaction.message.accountKeys.find(key => key.signer)?.pubkey.toBase58();
    if (!bidder) {
      console.log('Could not identify bidder');
      return null;
    }
    console.log(`Identified bidder: ${bidder}`);

    let nftAddress = magicEdenInstruction.accounts[1]?.toBase58();
    if (!nftAddress) {
      console.log('Could not identify NFT mint address in accounts');
      return null;
    }
    console.log(`Identified NFT mint address: ${nftAddress}`);

    let amount = 0;
    if (dataBuffer.length >= 9) {
      const lamports = dataBuffer.readBigUInt64LE(1);
      amount = Number(lamports) / 1e9;
      console.log(`Bid amount (in SOL): ${amount}`);
    } else {
      console.log('Could not extract bid amount from instruction data');
      return null;
    }

    return {
      nft_address: nftAddress,
      bidder: bidder,
      amount: amount.toFixed(6),
      signature: tx.transaction.signatures[0]
    };
  } catch (error) {
    console.error('Error in extractNftBidDetails:', error.message);
    return null;
  }
}

// Helper function to extract NFT sale details (Magic Eden)
async function extractNftSaleDetails(tx) {
  try {
    if (!tx || !tx.transaction || !tx.transaction.message || !tx.transaction.message.instructions) {
      console.log('Transaction missing instructions');
      return null;
    }

    const magicEdenProgramId = 'M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K';
    const magicEdenInstruction = tx.transaction.message.instructions.find(
      (instr) => instr.programId.toBase58() === magicEdenProgramId
    );

    if (!magicEdenInstruction || !magicEdenInstruction.accounts) {
      console.log('No Magic Eden instruction found or missing accounts');
      return null;
    }

    console.log('Magic Eden instruction accounts:', magicEdenInstruction.accounts.map(acc => acc.toBase58()));
    console.log('Magic Eden instruction data (base64):', magicEdenInstruction.data);

    const instructionData = magicEdenInstruction.data;
    if (!instructionData || typeof instructionData !== 'string') {
      console.log('Magic Eden instruction missing or invalid data:', instructionData);
      return null;
    }

    const dataBuffer = Buffer.from(instructionData, 'base64');
    console.log('Decoded instruction data (hex):', dataBuffer.toString('hex'));

    // Magic Eden sale instruction ID (updated to 0x50 based on transaction analysis)
    const SALE_INSTRUCTION_ID = 0x50; // Buy instruction
    if (dataBuffer.length < 1 || dataBuffer[0] !== SALE_INSTRUCTION_ID) {
      console.log(`Not a Magic Eden sale instruction (expected ID ${SALE_INSTRUCTION_ID}, got ${dataBuffer[0]})`);
      return null;
    }

    // Extract buyer (the signer of the transaction)
    let buyer = tx.transaction.message.accountKeys.find(key => key.signer)?.pubkey.toBase58();
    if (!buyer) {
      console.log('Could not identify buyer');
      return null;
    }
    console.log(`Identified buyer: ${buyer}`);

    // Extract seller (typically the second account in the instruction)
    let seller = magicEdenInstruction.accounts[1]?.toBase58();
    if (!seller) {
      console.log('Could not identify seller');
      return null;
    }
    console.log(`Identified seller: ${seller}`);

    // Extract NFT mint address (typically the third account in the instruction)
    let nftAddress = magicEdenInstruction.accounts[2]?.toBase58();
    if (!nftAddress) {
      console.log('Could not identify NFT mint address in accounts');
      return null;
    }
    console.log(`Identified NFT mint address: ${nftAddress}`);

    // Extract sale amount (lamports, starting at byte 1)
    let amount = 0;
    if (dataBuffer.length >= 9) {
      const lamports = dataBuffer.readBigUInt64LE(1);
      amount = Number(lamports) / 1e9; // Convert lamports to SOL
      console.log(`Sale amount (in SOL): ${amount}`);
    } else {
      console.log('Could not extract sale amount from instruction data');
      return null;
    }

    return {
      nft_address: nftAddress,
      seller: seller,
      buyer: buyer,
      amount: amount.toFixed(6),
      signature: tx.transaction.signatures[0]
    };
  } catch (error) {
    console.error('Error in extractNftSaleDetails:', error.message);
    return null;
  }
}

// Helper function to extract tokens to borrow details (Solend)
async function extractTokensToBorrowDetails(tx) {
  try {
    if (!tx || !tx.transaction || !tx.transaction.message || !tx.transaction.message.instructions) {
      return null;
    }

    const solendProgramId = 'So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo';
    const solendInstruction = tx.transaction.message.instructions.find(
      (instr) => instr.programId.toBase58() === solendProgramId
    );

    if (!solendInstruction) {
      return null;
    }

    console.log('Solend instruction found:', solendInstruction);

    const instructionData = solendInstruction.data;
    if (!instructionData || typeof instructionData !== 'string') {
      return null;
    }

    let instructionId;
    if (/^[0-9]+$/.test(instructionData)) {
      instructionId = parseInt(instructionData, 10);
      console.log('Parsed Solend instruction ID (pre-decoded):', instructionId);
    } else {
      const dataBuffer = Buffer.from(instructionData, 'base64');
      console.log('Decoded instruction data (hex):', dataBuffer.toString('hex'));
      instructionId = dataBuffer[0];
      console.log('Parsed Solend instruction ID (base64):', instructionId);
    }

    if (instructionId !== 4) { // RefreshReserve instruction
      console.log('Unsupported Solend instruction ID:', instructionId);
      return null;
    }

    const reserveAccount = solendInstruction.accounts[0]?.toBase58();
    if (!reserveAccount) {
      return null;
    }
    console.log('Identified reserve account:', reserveAccount);

    const reserveData = await withRetry(() =>
      solanaConnection.getAccountInfo(new PublicKey(reserveAccount))
    );
    if (!reserveData || !reserveData.data) {
      console.log('Could not fetch reserve data for account:', reserveAccount);
      return null;
    }

    console.log('Raw reserve data length:', reserveData.data.length);
    if (reserveData.data.length < 224) {
      console.log('Reserve data too short, expected at least 224 bytes');
      return null;
    }

    const underlyingMint = new PublicKey(reserveData.data.slice(12, 44)).toBase58();
    console.log('Extracted underlying token mint:', underlyingMint);

    const mintToToken = {
      'So11111111111111111111111111111111111111112': 'SOL',
      'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 'mSOL',
      '357QPuerFkTz7zuJ62RQR3vrhJsMyTVSNAhtti7dhmX6': 'MSOL',
      '357QPuerFkTz7zuJ62RQR3vrhJsMyTVSNAhtti7dhkz5': 'MSOL', // Seen in logs, likely a typo or variant
      '7dHbWXmci3dT8UFyw1KAfZiyTAW3q1qqobWnakDKU72i': 'stSOL',
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
      'BZB9M8CBMhpSzZr5hAAehqvTDEQiUBNon5bHX1JyRhGM': 'USDC',
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
      '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs': 'ETH',
      '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E': 'BTC',
      'Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1': 'SABER',
      '4eZau1SuijUmoWMrV3Vh6sdB2kW6PwX1GJQefBcaGkow': 'RAY' // Seen in logs, adding as RAY (Raydium token)
    };

    const token = mintToToken[underlyingMint];
    if (!token) {
      console.log('Unsupported underlying mint:', underlyingMint);
      return null;
    }

    let availableAmount, amountAvailable, borrowRateAtOptimal, interestRate;
    try {
      availableAmount = reserveData.data.readBigUInt64LE(128);
      amountAvailable = Number(availableAmount) / 1e9;

      borrowRateAtOptimal = reserveData.data.readBigUInt64LE(216);
      interestRate = (Number(borrowRateAtOptimal) / 1e9) * 100;
    } catch (error) {
      console.error('Error parsing reserve data:', error.message);
      console.log('Raw reserve data (hex):', reserveData.data.toString('hex'));
      return null;
    }

    console.log(`Extracted reserve data for ${token}: Amount Available: ${amountAvailable}, Interest Rate: ${interestRate}%`);

    return [{
      token: token,
      amount_available: amountAvailable,
      interest_rate: interestRate.toFixed(2),
      platform: 'Solend'
    }];
  } catch (error) {
    console.error('Error in extractTokensToBorrowDetails:', error.message);
    return null;
  }
}

// Unified Indexer Starter 
async function startIndexer(dataTypes) {
  if (indexers.nftBids) {
    console.log('Indexer already running, skipping start');
    return;
  }

  console.log(`Starting Solana indexer (${network} mode)...`);

  if (network === 'devnet') {
    indexers.nftBids = setInterval(async () => {
      let client;
      try {
        if (!solanaConnection) return;

        client = await pool.connect();

        if (dataTypes.nftBids) {
          const mockBidDetails = {
            nft_address: 'mock_nft_address_' + Math.random().toString(36).substring(2, 15),
            bidder: 'mock_bidder_' + Math.random().toString(36).substring(2, 15),
            amount: (Math.random() * 10).toFixed(6),
            signature: 'mock_signature_' + Math.random().toString(36).substring(2, 15)
          };

          await client.query(`
            INSERT INTO nft_bids (nft_address, bidder, amount, signature, timestamp)
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (signature) DO NOTHING
          `, [mockBidDetails.nft_address, mockBidDetails.bidder, mockBidDetails.amount, mockBidDetails.signature]);

          console.log(`Processed mock NFT bid: ${mockBidDetails.signature}, NFT Address: ${mockBidDetails.nft_address}, Amount: ${mockBidDetails.amount} SOL`);
        }

        if (dataTypes.nftPrices) {
          const mockSaleDetails = {
            nft_address: 'mock_nft_address_' + Math.random().toString(36).substring(2, 15),
            seller: 'mock_seller_' + Math.random().toString(36).substring(2, 15),
            buyer: 'mock_buyer_' + Math.random().toString(36).substring(2, 15),
            amount: (Math.random() * 10).toFixed(6),
            signature: 'mock_signature_' + Math.random().toString(36).substring(2, 15)
          };

          await client.query(`
            INSERT INTO nft_prices (nft_address, seller, buyer, amount, signature, timestamp)
            VALUES ($1, $2, $3, $4, $5, NOW())
            ON CONFLICT (signature) DO NOTHING
          `, [mockSaleDetails.nft_address, mockSaleDetails.seller, mockSaleDetails.buyer, mockSaleDetails.amount, mockSaleDetails.signature]);

          console.log(`Processed mock NFT sale: ${mockSaleDetails.signature}, NFT Address: ${mockSaleDetails.nft_address}, Amount: ${mockSaleDetails.amount} SOL`);
        }

        if (dataTypes.tokensToBorrow) {
          const mockReserveData = {
            token: 'SOL',
            amount_available: 1000 + Math.random() * 500,
            interest_rate: 0.05 + Math.random() * 0.01,
            platform: 'MockSolend'
          };

          await client.query(`
            INSERT INTO tokens_to_borrow (token, amount_available, interest_rate, platform, last_updated)
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (token, platform) 
            DO UPDATE SET 
              amount_available = EXCLUDED.amount_available,
              interest_rate = EXCLUDED.interest_rate,
              last_updated = NOW()
          `, [mockReserveData.token, mockReserveData.amount_available, mockReserveData.interest_rate, mockReserveData.platform]);

          console.log(`Processed mock token to borrow: Token: ${mockReserveData.token}, Amount Available: ${mockReserveData.amount_available}`);
        }

        if (dataTypes.tokenPrices) {
          const mockPriceData = {
            token: 'SOL',
            price_usd: 150 + Math.random() * 10,
            change_24h: 0,
            volume_24h: 0
          };

          await client.query(`
            INSERT INTO token_price_history (token, price_usd, change_24h, volume_24h, timestamp)
            VALUES ($1, $2, $3, $4, NOW())
          `, [mockPriceData.token, mockPriceData.price_usd, mockPriceData.change_24h, mockPriceData.volume_24h]);

          await client.query(`
            INSERT INTO token_prices (token, price_usd, change_24h, volume_24h, last_updated)
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (token) 
            DO UPDATE SET 
              price_usd = EXCLUDED.price_usd,
              change_24h = EXCLUDED.change_24h,
              volume_24h = EXCLUDED.volume_24h,
              last_updated = NOW()
          `, [mockPriceData.token, mockPriceData.price_usd, mockPriceData.change_24h, mockPriceData.volume_24h]);

          console.log(`Processed mock token price: Token: ${mockPriceData.token}, Price USD: ${mockPriceData.price_usd}`);
        }

        const blockHeight = await withRetry(() => solanaConnection.getBlockHeight());
        const statusResult = await client.query('SELECT records_processed, last_updated FROM indexing_status WHERE id = 1');
        const { records_processed, last_updated } = statusResult.rows[0];
        const elapsedSeconds = (new Date() - new Date(last_updated)) / 1000;
        const recordsPerSecond = elapsedSeconds > 0 ? (records_processed / elapsedSeconds).toFixed(2) : 0;

        let recordsProcessed = 0;
        if (dataTypes.nftBids) recordsProcessed++;
        if (dataTypes.nftPrices) recordsProcessed++;
        if (dataTypes.tokensToBorrow) recordsProcessed++;
        if (dataTypes.tokenPrices) recordsProcessed++;

        await client.query(`
          UPDATE indexing_status
          SET 
            records_processed = records_processed + $1,
            records_per_second = $2,
            last_updated = NOW(),
            last_block_height = $3
          WHERE id = 1
        `, [recordsProcessed, recordsPerSecond, blockHeight]);

        client.release();
      } catch (error) {
        console.error('Devnet mock error:', error.message);
        if (client) client.release();
      }
    }, 30000);
    console.log('Indexer running with mock data for Devnet');
  } else {
    console.log('Starting RPC-based indexer for mainnet...');

    const programIds = {
      nftBids: new PublicKey('M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K'),
      nftPrices: new PublicKey('M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K'),
      tokensToBorrow: new PublicKey('So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo')
    };

    let lastSignatures = {
      nftBids: null,
      nftPrices: null,
      tokensToBorrow: null
    };

    if (dataTypes.nftBids || dataTypes.nftPrices || dataTypes.tokensToBorrow) {
      indexers.nftBids = setInterval(async () => {
        let client;
        try {
          if (!solanaConnection) return;

          client = await pool.connect();
          let recordsProcessed = 0;

          if (dataTypes.nftBids || dataTypes.nftPrices) {
            const limit = await rateLimiter.get({ id: 'magic_eden_polling' });
            if (!limit.remaining) {
              console.warn('Rate limit exceeded for Magic Eden polling, skipping...');
              return;
            }

            const signatures = await withRetry(() =>
              solanaConnection.getSignaturesForAddress(programIds.nftBids, {
                limit: 25,
                before: lastSignatures.nftBids
              })
            );

            console.log(`Fetched ${signatures.length} signatures for Magic Eden`);

            if (signatures.length === 0) {
              console.log('No new signatures found for Magic Eden, waiting...');
              return;
            }

            for (const sig of signatures) {
              if (processedSignatures.has(sig.signature)) {
                console.log(`Signature ${sig.signature} already processed, skipping`);
                continue;
              }

              const tx = await withRetry(() =>
                solanaConnection.getParsedTransaction(sig.signature, {
                  maxSupportedTransactionVersion: 0,
                  commitment: 'confirmed'
                })
              );

              if (!tx || !tx.meta || tx.meta.err) {
                console.log(`Transaction invalid or failed for signature: ${sig.signature}`);
                processedSignatures.add(sig.signature);
                continue;
              }

              if (dataTypes.nftBids) {
                const bidDetails = await extractNftBidDetails(tx);
                if (bidDetails) {
                  await client.query(`
                    INSERT INTO nft_bids (nft_address, bidder, amount, signature, timestamp)
                    VALUES ($1, $2, $3, $4, NOW())
                    ON CONFLICT (signature) DO NOTHING
                  `, [bidDetails.nft_address, bidDetails.bidder, bidDetails.amount, bidDetails.signature]);

                  console.log(`Processed NFT bid: ${bidDetails.signature}, NFT Address: ${bidDetails.nft_address}, Amount: ${bidDetails.amount} SOL`);
                  recordsProcessed++;
                } else {
                  console.log(`No valid bid details extracted for signature: ${sig.signature}`);
                }
              }

              if (dataTypes.nftPrices) {
                const saleDetails = await extractNftSaleDetails(tx);
                if (saleDetails) {
                  await client.query(`
                    INSERT INTO nft_prices (nft_address, seller, buyer, amount, signature, timestamp)
                    VALUES ($1, $2, $3, $4, $5, NOW())
                    ON CONFLICT (signature) DO NOTHING
                  `, [saleDetails.nft_address, saleDetails.seller, saleDetails.buyer, saleDetails.amount, saleDetails.signature]);

                  console.log(`Processed NFT sale: ${saleDetails.signature}, NFT Address: ${saleDetails.nft_address}, Amount: ${saleDetails.amount} SOL`);
                  recordsProcessed++;
                } else {
                  console.log(`No valid sale details extracted for signature: ${sig.signature}`);
                }
              }

              processedSignatures.add(sig.signature);
            }

            if (signatures.length > 0) {
              lastSignatures.nftBids = signatures[signatures.length - 1].signature;
              lastSignatures.nftPrices = signatures[signatures.length - 1].signature;
            }
          }

          if (dataTypes.tokensToBorrow) {
            const limit = await rateLimiter.get({ id: 'solend_polling' });
            if (!limit.remaining) {
              console.warn('Rate limit exceeded for Solend polling, skipping...');
              return;
            }

            const signatures = await withRetry(() =>
              solanaConnection.getSignaturesForAddress(programIds.tokensToBorrow, {
                limit: 25,
                before: lastSignatures.tokensToBorrow
              })
            );

            console.log(`Fetched ${signatures.length} signatures for Solend`);

            for (const sig of signatures) {
              if (processedSignatures.has(sig.signature)) {
                console.log(`Signature ${sig.signature} already processed, skipping`);
                continue;
              }

              const tx = await withRetry(() =>
                solanaConnection.getParsedTransaction(sig.signature, {
                  maxSupportedTransactionVersion: 0,
                  commitment: 'confirmed'
                })
              );

              if (!tx || !tx.meta || tx.meta.err) {
                console.log(`Transaction invalid or failed for signature: ${sig.signature}`);
                processedSignatures.add(sig.signature);
                continue;
              }

              const tokensToBorrowDetails = await extractTokensToBorrowDetails(tx);
              if (tokensToBorrowDetails) {
                for (const detail of tokensToBorrowDetails) {
                  await client.query(`
                    INSERT INTO tokens_to_borrow (token, amount_available, interest_rate, platform, last_updated)
                    VALUES ($1, $2, $3, $4, NOW())
                    ON CONFLICT (token, platform) 
                    DO UPDATE SET 
                      amount_available = EXCLUDED.amount_available,
                      interest_rate = EXCLUDED.interest_rate,
                      last_updated = NOW()
                  `, [detail.token, detail.amount_available, detail.interest_rate, detail.platform]);

                  console.log(`Processed token to borrow: Token: ${detail.token}, Amount Available: ${detail.amount_available}`);
                  recordsProcessed++;
                }
              } else {
                console.log(`No valid tokens to borrow details extracted for signature: ${sig.signature}`);
              }

              processedSignatures.add(sig.signature);
            }

            if (signatures.length > 0) {
              lastSignatures.tokensToBorrow = signatures[signatures.length - 1].signature;
            }
          }

          if (recordsProcessed > 0) {
            const blockHeight = await withRetry(() => solanaConnection.getBlockHeight());
            const statusResult = await client.query('SELECT records_processed, last_updated FROM indexing_status WHERE id = 1');
            const { records_processed, last_updated } = statusResult.rows[0];
            const elapsedSeconds = (new Date() - new Date(last_updated)) / 1000;
            const recordsPerSecond = elapsedSeconds > 0 ? (records_processed / elapsedSeconds).toFixed(2) : 0;

            await client.query(`
              UPDATE indexing_status
              SET 
                records_processed = records_processed + $1,
                records_per_second = $2,
                last_updated = NOW(),
                last_block_height = $3
              WHERE id = 1
            `, [recordsProcessed, recordsPerSecond, blockHeight]);
          }

          client.release();
        } catch (error) {
          console.error('Mainnet polling error:', error.message);
          if (client) client.release();
        }
      }, 20000); // Poll every 20 seconds
    }

    if (dataTypes.tokenPrices) {
      indexers.tokenPrices = setInterval(async () => {
        let client;
        try {
          client = await pool.connect();

          let priceUsd;

          try {
            const response = await fetch('https://hermes.pyth.network/api/latest_price_feeds?ids=0xef0d8b6fda2ceba32dea9d1e328dd0edf4bc8d0297241f85c9b3fd0c5d7d39');
            const text = await response.text();
            if (!response.ok) {
              console.log(`Pyth API request failed: Status ${response.status}, Response: ${text}`);
              throw new Error(`Pyth API request failed: ${text}`);
            }

            const data = JSON.parse(text);
            if (!data || !Array.isArray(data) || data.length === 0) {
              console.log('No price data returned from Pyth Network API');
              throw new Error('No price data returned from Pyth Network API');
            }

            const solPriceFeed = data[0];
            priceUsd = solPriceFeed.price.price / Math.pow(10, solPriceFeed.price.expo);
            console.log(`Fetched SOL price from Pyth API: ${priceUsd} USD`);
          } catch (error) {
            console.error('Pyth API error:', error.message);
            console.log('Falling back to CoinGecko API for SOL price...');
            const coingeckoResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
            const coingeckoData = await coingeckoResponse.json();
            if (!coingeckoData || !coingeckoData.solana || !coingeckoData.solana.usd) {
              console.log('No price data returned from CoinGecko API');
              client.release();
              return;
            }
            priceUsd = coingeckoData.solana.usd;
            console.log(`Fetched SOL price from CoinGecko API: ${priceUsd} USD`);
          }

          const priceData = {
            token: 'SOL',
            price_usd: priceUsd,
            change_24h: 0,
            volume_24h: 0
          };

          await client.query(`
            INSERT INTO token_price_history (token, price_usd, change_24h, volume_24h, timestamp)
            VALUES ($1, $2, $3, $4, NOW())
          `, [priceData.token, priceData.price_usd, priceData.change_24h, priceData.volume_24h]);

          await client.query(`
            INSERT INTO token_prices (token, price_usd, change_24h, volume_24h, last_updated)
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (token) 
            DO UPDATE SET 
              price_usd = EXCLUDED.price_usd,
              change_24h = EXCLUDED.change_24h,
              volume_24h = EXCLUDED.volume_24h,
              last_updated = NOW()
          `, [priceData.token, priceData.price_usd, priceData.change_24h, priceData.volume_24h]);

          console.log(`Processed token price: Token: ${priceData.token}, Price USD: ${priceData.price_usd}`);

          const statusResult = await client.query('SELECT records_processed, last_updated FROM indexing_status WHERE id = 1');
          const { records_processed, last_updated } = statusResult.rows[0];
          const elapsedSeconds = (new Date() - new Date(last_updated)) / 1000;
          const recordsPerSecond = elapsedSeconds > 0 ? (records_processed / elapsedSeconds).toFixed(2) : 0;

          await client.query(`
            UPDATE indexing_status
            SET 
              records_processed = records_processed + 1,
              records_per_second = $1,
              last_updated = NOW()
            WHERE id = 1
          `, [recordsPerSecond]);

          client.release();
        } catch (error) {
          console.error('Token Prices polling error:', error.message);
          if (client) client.release();
        }
      }, 60000);
    }
  }
}

// Stop all indexers
function stopAllIndexers() {
  console.log('Stopping all indexers...');

  for (const key in indexers) {
    if (indexers[key]) {
      clearInterval(indexers[key]);
      console.log(`Stopped polling interval for ${key}`);
      indexers[key] = null;
    }
  }

  processedSignatures.clear();
}

// Debug endpoint: Fetch recent signatures
app.get('/api/recent-signatures', async (req, res) => {
  try {
    const programId = new PublicKey('M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K');
    const signatures = await solanaConnection.getSignaturesForAddress(programId, { limit: 5 });
    res.json({ success: true, signatures: signatures.map(s => s.signature) });
  } catch (error) {
    console.error('Error fetching recent signatures:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Debug endpoint: Test transaction parsing
app.get('/api/test-transaction/:signature', async (req, res) => {
  try {
    const { signature } = req.params;
    const tx = await solanaConnection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed'
    });
    const bidDetails = await extractNftBidDetails(tx);
    const saleDetails = await extractNftSaleDetails(tx);
    const tokensToBorrowDetails = await extractTokensToBorrowDetails(tx);
    res.json({ success: true, transaction: tx, bidDetails, saleDetails, tokensToBorrowDetails });
  } catch (error) {
    console.error('Test transaction error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Periodic status logging
setInterval(async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT is_active, records_processed, last_updated FROM indexing_status WHERE id = 1');
    if (result.rows[0]) {
      const { is_active, records_processed, last_updated } = result.rows[0];
      console.log(`Indexing status: Active: ${is_active}, Records processed: ${records_processed}, Last updated: ${last_updated}`);
    }
    client.release();
  } catch (error) {
    console.error('Error logging indexing status:', error.message);
  }
}, 60000);

// Start the server
app.listen(PORT, () => {
  console.log(`Solana Indexer backend running on port ${PORT}`);
});

module.exports = app;