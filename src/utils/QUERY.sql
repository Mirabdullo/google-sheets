-- Altering company model 
ALTER TABLE companies ALTER COLUMN status SET DEFAULT 'new';

-- Altering apply model
ALTER TABLE applies ADD COLUMN IF NOT EXISTS rest NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE applies ADD COLUMN IF NOT EXISTS title VARCHAR(2048) NOT NULL DEFAULT '';

-- Altering payment model
ALTER TABLE payments ADD COLUMN IF NOT EXISTS wallet_id UUID;

-- Altering wallet
-- ALTER TABLE wallets ADD COLUMN amount_sum NUMERIC NOT NULL DEFAULT 0;
-- ALTER TABLE wallets ADD COLUMN amount_dollar NUMERIC NOT NULL DEFAULT 0;

-- Altering seller model
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS comp_id UUID;

-- Altering payment model
ALTER TABLE payments ADD COLUMN IF NOT EXISTS delivery_id UUID;

-- Altering approvals
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS kurs NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS copied BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS transaction_fee NUMERIC NOT NULL DEFAULT 0;


ALTER TABLE applies ADD COLUMN "deletedAt" TIMESTAMP;
ALTER TABLE approvals ADD COLUMN "deletedAt" TIMESTAMP;
ALTER TABLE clients ADD COLUMN "deletedAt" TIMESTAMP;
ALTER TABLE companies ADD COLUMN "deletedAt" TIMESTAMP;
ALTER TABLE deals ADD COLUMN "deletedAt" TIMESTAMP;
ALTER TABLE deliveries ADD COLUMN "deletedAt" TIMESTAMP;
ALTER TABLE furniture_types ADD COLUMN "deletedAt" TIMESTAMP;
ALTER TABLE models ADD COLUMN "deletedAt" TIMESTAMP;
ALTER TABLE orders ADD COLUMN "deletedAt" TIMESTAMP;
ALTER TABLE payments ADD COLUMN "deletedAt" TIMESTAMP;
ALTER TABLE sellers ADD COLUMN "deletedAt" TIMESTAMP;
ALTER TABLE wallets ADD COLUMN "deletedAt" TIMESTAMP;



ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_id UUID DEFAULT NULL;
ALTER TABLE models ADD COLUMN IF NOT EXISTS company_id UUID DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS end_date TIMESTAMP DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS transfer DATE DEFAULT NULL;


ALTER TABLE models ADD COLUMN IF NOT EXISTS code VARCHAR(25) DEFAULT NULL;
--update orders status new to NEW
ALTER TABLE order_log
ALTER COLUMN sum TYPE NUMERIC;

ALTER TABLE store ADD COLUMN IF NOT EXISTS "copied" BOOLEAN NOT NULL DEFAULT false;